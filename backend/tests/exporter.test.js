import docxExporter from '../services/docx-exporter';
import xlsxExporter from '../services/xlsx-exporter';

const dummyBid = {
  reference: 'Flag-TEST-001',
  projectName: 'Test Development',
  location: 'North West',
  lastUpdated: new Date().toISOString(),
  roomSplits: {
    cluster: 10,
    studio: 5,
    premier: 2,
    acc: 1,
    kld4: 2,
    kld5: 1,
    kld6: 0,
    kld7: 0,
    kld8: 0,
    kld9: 0
  },
  content: '# Title\n\n## Section\n\n* Bullet 1\n* Bullet 2\n\nSome paragraph text here.',
  pricingBasis: 'Test Wolverhampton baseline'
};

describe('Exporter Services', () => {
  test('Word Docx Exporter generates valid binary buffer', () => {
    return new Promise((resolve) => {
      docxExporter.generateDocx(dummyBid, (err, buffer) => {
        expect(err).toBeNull();
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(100);
        
        // Assert standard PKZip header (used by docx packages)
        expect(buffer[0]).toBe(0x50); // P
        expect(buffer[1]).toBe(0x4B); // K
        resolve();
      });
    });
  });

  test('Excel Xlsx Exporter generates valid spreadsheet buffer', () => {
    return new Promise((resolve) => {
      xlsxExporter.generateXlsx(dummyBid, (err, buffer) => {
        expect(err).toBeNull();
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(100);

        // Assert standard PKZip header (used by xlsx Excel packages)
        expect(buffer[0]).toBe(0x50); // P
        expect(buffer[1]).toBe(0x4B); // K
        resolve();
      });
    });
  });
});
