import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../index';

// Mock data
const mockBids = [
  {
    id: 'flag-hvr-001',
    reference: 'Flag-HVR-001',
    projectName: 'Heavitree PBSA',
    location: 'South West',
    status: 'Drafting',
    lastUpdated: '2026-06-08T22:30:00Z',
    roomSplits: {
      cluster: 100,
      studio: 30,
      premier: 10,
      acc: 5
    },
    content: '# Cover Letter\n\nDemo content',
    pricingBasis: 'W Wolverhampton'
  }
];

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  const mockFs = {
    ...actual,
    existsSync: (filePath) => {
      if (process.env.TEST_FS_ERROR === 'true') return false;
      if (filePath.endsWith('bids.json')) return true;
      if (filePath.endsWith('public')) return false; // Mock frontend static assets check
      return actual.existsSync(filePath);
    },
    readFileSync: (filePath, encoding) => {
      if (filePath.endsWith('bids.json')) {
        if (process.env.TEST_FS_ERROR === 'true') {
          throw new Error('Mock FS Read Error');
        }
        return JSON.stringify(mockBids);
      }
      return actual.readFileSync(filePath, encoding);
    },
    writeFileSync: vi.fn().mockImplementation((filePath, data, options) => {
      if (process.env.TEST_FS_ERROR === 'true') {
        throw new Error('Mock FS Write Error');
      }
    }),
    mkdirSync: vi.fn().mockImplementation((dirPath, options) => {
      if (process.env.TEST_FS_ERROR === 'true') {
        throw new Error('Mock FS Write Error');
      }
    })
  };
  return {
    ...mockFs,
    default: mockFs
  };
});

// Set random port for tests
beforeAll(() => {
  process.env.PORT = '0'; // Bind to random free port
});

describe('Express Server API Routes', () => {
  test('GET /api/bids returns bids list', async () => {
    const res = await request(app).get('/api/bids');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].projectName).toBe('Heavitree PBSA');
  });

  test('GET /api/bids/:id returns specific bid', async () => {
    const res = await request(app).get('/api/bids/flag-hvr-001');
    expect(res.status).toBe(200);
    expect(res.body.projectName).toBe('Heavitree PBSA');
  });

  test('GET /api/bids/:id returns 404 for missing bid', async () => {
    const res = await request(app).get('/api/bids/flag-missing-001');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Bid not found');
  });

  test('POST /api/bids creates new bid', async () => {
    const newBidData = {
      projectName: 'Test Site Development',
      reference: 'Flag-TEST-999',
      location: 'Scotland'
    };

    const res = await request(app)
      .post('/api/bids')
      .send(newBidData);

    expect(res.status).toBe(201);
    expect(res.body.reference).toBe('Flag-TEST-999');
    expect(res.body.status).toBe('Drafting');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('POST /api/bids validates required fields', async () => {
    const res = await request(app)
      .post('/api/bids')
      .send({ location: 'Fail' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Project Name and Reference are required.');
  });

  test('POST /api/bids prevents duplicate references', async () => {
    const res = await request(app)
      .post('/api/bids')
      .send({ projectName: 'Dup', reference: 'Flag-HVR-001' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bid with this reference already exists.');
  });

  test('PUT /api/bids/:id updates bid details', async () => {
    const updateData = {
      status: 'Ready',
      roomSplits: { cluster: 150 }
    };

    const res = await request(app)
      .put('/api/bids/flag-hvr-001')
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Ready');
    expect(res.body.roomSplits.cluster).toBe(150);
  });

  test('PUT /api/bids/:id returns 404 for missing bid', async () => {
    const res = await request(app)
      .put('/api/bids/flag-missing-001')
      .send({ status: 'Ready' });

    expect(res.status).toBe(404);
  });

  test('DELETE /api/bids/:id deletes bid', async () => {
    const res = await request(app).delete('/api/bids/flag-hvr-001');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Bid deleted successfully');
  });

  test('DELETE /api/bids/:id returns 404 for missing bid', async () => {
    const res = await request(app).delete('/api/bids/flag-missing-001');
    expect(res.status).toBe(404);
  });

  test('POST /api/search with direct URL returns opportunity details', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ url: 'https://planning.exeter.gov.uk/' });

    expect(res.status).toBe(200);
    expect(res.body.opportunities).toBeInstanceOf(Array);
    expect(res.body.opportunities.length).toBe(1);
    expect(res.body.opportunities[0].reference).toBe('26/00104/FUL');
  });

  test('POST /api/search with irrelevant URL returns empty opportunities', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ url: 'https://planning.council.gov.uk/notrelevant' });

    expect(res.status).toBe(200);
    expect(res.body.opportunities.length).toBe(0);
    expect(res.body.message).toContain('NOT RELEVANT');
  });

  test('POST /api/search with region search returns regional opportunities', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ region: 'South West' });

    expect(res.status).toBe(200);
    expect(res.body.opportunities.length).toBeGreaterThan(0);
  });

  test('GET /api/bids/:id/export/docx returns binary buffer', async () => {
    const res = await request(app)
      .get('/api/bids/flag-hvr-001/export/docx')
      .buffer()
      .parse((res, cb) => {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => cb(null, Buffer.concat(data)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('wordprocessingml');
    expect(res.body).toBeInstanceOf(Buffer);
    expect(res.body.length).toBeGreaterThan(100);
    expect(res.body[0]).toBe(0x50); // P
    expect(res.body[1]).toBe(0x4B); // K
  });

  test('GET /api/bids/:id/export/docx returns 404 for missing bid', async () => {
    const res = await request(app).get('/api/bids/flag-missing-001/export/docx');
    expect(res.status).toBe(404);
  });

  test('GET /api/bids/:id/export/xlsx returns binary buffer', async () => {
    const res = await request(app)
      .get('/api/bids/flag-hvr-001/export/xlsx')
      .buffer()
      .parse((res, cb) => {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => cb(null, Buffer.concat(data)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
    expect(res.body).toBeInstanceOf(Buffer);
    expect(res.body.length).toBeGreaterThan(100);
    expect(res.body[0]).toBe(0x50); // P
    expect(res.body[1]).toBe(0x4B); // K
  });

  test('GET /api/bids/:id/export/xlsx returns 404 for missing bid', async () => {
    const res = await request(app).get('/api/bids/flag-missing-001/export/xlsx');
    expect(res.status).toBe(404);
  });

  test('FS errors trigger catch blocks in server helpers', async () => {
    process.env.TEST_FS_ERROR = 'true';
    try {
      const res1 = await request(app).get('/api/bids');
      expect(res1.status).toBe(200);
      expect(res1.body).toEqual([]);

      const res2 = await request(app)
        .post('/api/bids')
        .send({ projectName: 'Write Fail', reference: 'Flag-FAIL' });
      expect(res2.status).toBe(201);
    } finally {
      delete process.env.TEST_FS_ERROR;
    }
  });
});
