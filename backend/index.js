const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const BIDS_FILE_PATH = path.join(__dirname, 'data', 'bids.json');

app.use(cors());
app.use(express.json());

// Serve static frontend files if they exist (production)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Helpers for read/write JSON file DB
const readBids = () => {
  try {
    if (!fs.existsSync(BIDS_FILE_PATH)) {
      // Create folder and write default file
      fs.mkdirSync(path.dirname(BIDS_FILE_PATH), { recursive: true });
      fs.writeFileSync(BIDS_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(BIDS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading bids file:', error);
    return [];
  }
};

const writeBids = (bids) => {
  try {
    fs.mkdirSync(path.dirname(BIDS_FILE_PATH), { recursive: true });
    fs.writeFileSync(BIDS_FILE_PATH, JSON.stringify(bids, null, 2));
  } catch (error) {
    console.error('Error writing bids file:', error);
  }
};

// API Routes

// 1. Get Bids list
app.get('/api/bids', (req, res) => {
  const bids = readBids();
  res.json(bids);
});

// 2. Get Single Bid
app.get('/api/bids/:id', (req, res) => {
  const bids = readBids();
  const bid = bids.find(b => b.id.toLowerCase() === req.params.id.toLowerCase());
  if (!bid) {
    return res.status(404).json({ error: 'Bid not found' });
  }
  res.json(bid);
});

// 3. Create Bid
app.post('/api/bids', (req, res) => {
  const { projectName, reference, location, roomSplits, content } = req.body;
  if (!projectName || !reference) {
    return res.status(400).json({ error: 'Project Name and Reference are required.' });
  }

  const bids = readBids();
  const id = reference.toLowerCase().replace(/\s+/g, '-');
  
  if (bids.find(b => b.id === id)) {
    return res.status(400).json({ error: 'Bid with this reference already exists.' });
  }

  const newBid = {
    id,
    reference,
    projectName,
    location: location || 'Unknown',
    status: 'Drafting',
    lastUpdated: new Date().toISOString(),
    roomSplits: roomSplits || {
      cluster: 0,
      studio: 0,
      premier: 0,
      acc: 0,
      kld4: 0,
      kld5: 0,
      kld6: 0,
      kld7: 0,
      kld8: 0,
      kld9: 0
    },
    content: content || `# Cover Letter\n\nDear Applicant,\n\n**Re: FF&E Proposal – ${projectName}**\n\n[Standard cover letter content goes here...]`,
    pricingBasis: 'Flag22167, Stafford Street Wolverhampton (April 2026, Kronospan Band A)'
  };

  bids.push(newBid);
  writeBids(bids);
  res.status(201).json(newBid);
});

// 4. Update Bid
app.put('/api/bids/:id', (req, res) => {
  const bids = readBids();
  const index = bids.findIndex(b => b.id.toLowerCase() === req.params.id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  const updatedBid = {
    ...bids[index],
    ...req.body,
    id: bids[index].id, // Keep ID lock
    lastUpdated: new Date().toISOString()
  };

  bids[index] = updatedBid;
  writeBids(bids);
  res.json(updatedBid);
});

// 5. Delete Bid
app.delete('/api/bids/:id', (req, res) => {
  const bids = readBids();
  const filtered = bids.filter(b => b.id.toLowerCase() !== req.params.id.toLowerCase());
  if (filtered.length === bids.length) {
    return res.status(404).json({ error: 'Bid not found' });
  }
  writeBids(filtered);
  res.json({ message: 'Bid deleted successfully' });
});

// 6. Search Scraper Endpoint (Mock/Real Search)
app.post('/api/search', (req, res) => {
  const { region, url } = req.body;
  
  // Simulate standard scraper pipeline delay
  setTimeout(() => {
    // If user searched a direct URL
    if (url) {
      if (url.includes('notrelevant') || url.includes('householder')) {
        return res.json({
          opportunities: [],
          message: 'The URL was assessed as NOT RELEVANT to student (PBSA) or co-living schemes.'
        });
      }
      return res.json({
        opportunities: [
          {
            reference: '26/00104/FUL',
            address: '12-16 Cranbrook Road, Bristol, BS6 7BP',
            lpa: 'Bristol City Council',
            submitted: '2026-05-18',
            status: 'Under Consultation',
            portalUrl: url,
            source: 'Direct Portal URL',
            classification: 'Co-living',
            confidence: 'High',
            scale: '78 units / 4 storeys',
            amenities: ['Shared lounge', 'Communal kitchen', 'Roof garden', 'Gym', 'Laundry'],
            applicant: 'Cranbrook Living Ltd',
            agent: 'CS Architects',
            timing: 'Under consultation until June 20th, 2026. Excellent early window to approach.',
            opportunities: [
              'Scale of 78 co-living units is perfect for Flagstaffe bespoke manufacturing fitouts.',
              'Bespoke shared kitchens (KLD) and dining structures required for each floor.',
              'Premium roof garden loose furniture and gym fit-out package opportunity.'
            ],
            redFlags: [
              'Architect agent is already named, design package might be pre-specified.',
              'Conversion of existing commercial property - tight access challenges.'
            ],
            action: 'Approach now',
            actionDescription: 'Draft an early design stage intro letter. Contact Cranbrook Living and offer free budget stress-testing.'
          }
        ]
      });
    }

    // Default mock list by region
    const mockOpportunities = [
      {
        reference: '26/00566/FPA',
        address: 'Heavitree Road, Exeter, EX1 2UR',
        lpa: 'Exeter City Council',
        submitted: '2026-05-24',
        status: 'Pending Decision',
        portalUrl: 'https://planning.exeter.gov.uk/online-applications/',
        source: 'GSL Wire daily news feed',
        classification: 'PBSA',
        confidence: 'High',
        scale: '145 beds / 6 storeys',
        amenities: ['Communal study space', 'Gym', 'Cycle storage', 'Cluster flat kitchens'],
        applicant: 'Student City Exeter Ltd',
        agent: 'LPA Planning Consultants',
        timing: 'Submitted 14 days ago. Stage is perfect for early design engagement.',
        opportunities: [
          'Supply of 145 cluster bedroom sets (beds, desks, wardrobes).',
          'Full fit-out of cluster kitchen/dining spaces (KLD4 and KLD5 configurations).',
          'Turnkey gym and lounge package.'
        ],
        redFlags: [
          'Exeter is a competitive territory; must lead with ConstructionLine Gold compliance.'
        ],
        action: 'Approach now',
        actionDescription: 'Draft a direct bid proposal outlining logistics plan for Exeter.'
      },
      {
        reference: '26/01222/OUT',
        address: 'Hathersage Road, Manchester, M13 0EH',
        lpa: 'Manchester City Council',
        submitted: '2026-05-29',
        status: 'Recently Submitted',
        portalUrl: 'https://arcusbe.manchester.gov.uk/',
        source: 'Google search weekly sweep',
        classification: 'Possible PBSA',
        confidence: 'Medium',
        scale: '210 beds / 8 storeys',
        amenities: ['Social lounge', 'Study hubs', 'Cinema room'],
        applicant: 'Manchester Student Homes SPV',
        agent: 'Vici Design Architects',
        timing: 'Under initial validation. High value early entry window.',
        opportunities: [
          'Bespoke study hubs and communal space joinery.',
          'High bed count fits Flagstaffe volume efficiencies.'
        ],
        redFlags: [
          'Manchester Arcus BE portal blocks automated scrapers. Details extracted from user upload.',
          'Vici Design often has pre-existing ties with European suppliers.'
        ],
        action: 'Monitor',
        actionDescription: 'Assign Steven Green to track architect appointments and set calendar notification.'
      },
      {
        reference: '26/03312/FUL',
        address: '22-26 Cardiff Road, Newport, NP20 2ED',
        lpa: 'Newport City Council',
        submitted: '2026-05-20',
        status: 'Decided (Approved)',
        portalUrl: 'https://planning.newport.gov.uk/',
        source: 'LPA sweep',
        classification: 'Co-living',
        confidence: 'High',
        scale: '55 units',
        amenities: ['Shared lounge', 'Common laundry room'],
        applicant: 'Wales Development Group',
        agent: 'Evans Partners Planning',
        timing: 'Recently approved. Mobilisation likely starting in next 3 months.',
        opportunities: [
          'Complete turn-key fit-out of co-living bedrooms and shared amenities.'
        ],
        redFlags: [
          'Approved status means main contractor is likely already chosen or bidding. Act fast.'
        ],
        action: 'Approach now',
        actionDescription: 'Contact Wales Development Group immediately to offer procurement lead-time guarantees.'
      }
    ];

    const filtered = region && region !== 'Nationwide' 
      ? mockOpportunities.filter(o => o.address.toLowerCase().includes(region.toLowerCase()) || o.lpa.toLowerCase().includes(region.toLowerCase()))
      : mockOpportunities;

    res.json({ opportunities: filtered });
  }, 1500);
});

// 7. Export files endpoints placeholder (we will fill code inside services/exporter)
app.get('/api/bids/:id/export/docx', (req, res) => {
  const docxExporter = require('./services/docx-exporter');
  const bids = readBids();
  const bid = bids.find(b => b.id.toLowerCase() === req.params.id.toLowerCase());
  
  if (!bid) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  docxExporter.generateDocx(bid, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to generate Word document' });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Flag-${bid.reference}-${bid.projectName.replace(/\s+/g, '_')}_Full_Bid.docx`);
    res.send(buffer);
  });
});

app.get('/api/bids/:id/export/xlsx', (req, res) => {
  const xlsxExporter = require('./services/xlsx-exporter');
  const bids = readBids();
  const bid = bids.find(b => b.id.toLowerCase() === req.params.id.toLowerCase());
  
  if (!bid) {
    return res.status(404).json({ error: 'Bid not found' });
  }

  xlsxExporter.generateXlsx(bid, (err, buffer) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to generate Excel sheet' });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Flag-${bid.reference}-${bid.projectName.replace(/\s+/g, '_')}_Full_Bid.xlsx`);
    res.send(buffer);
  });
});

// Serve the index.html for React Router in client-side navigation (production SPA fallback)
if (fs.existsSync(publicPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`EzBid backend listening on port ${PORT}`);
});
