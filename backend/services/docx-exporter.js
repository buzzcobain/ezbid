const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType, PageBreak } = require('docx');

// Rates database to compute totals
const RATES = {
  cluster: 1274.90,
  studio: 4290.50,
  premier: 5230.30,
  acc: 5248.89,
  kld4: 5677.82,
  kld5: 6392.33,
  kld6: 8744.18,
  kld7: 9116.01,
  kld8: 9521.50,
  kld9: 9949.10
};

const PM_RATE = 68.43; // Inflated pm fee per unit

function generateDocx(bid, callback) {
  try {
    const splits = bid.roomSplits || {};
    
    // Compute prices
    let totalBeds = (splits.cluster || 0) + (splits.studio || 0) + (splits.premier || 0) + (splits.acc || 0);
    let totalKLDs = (splits.kld4 || 0) + (splits.kld5 || 0) + (splits.kld6 || 0) + (splits.kld7 || 0) + (splits.kld8 || 0) + (splits.kld9 || 0);
    let totalUnits = totalBeds + totalKLDs;

    const items = [
      { name: 'Cluster Bedrooms', count: splits.cluster || 0, rate: RATES.cluster },
      { name: 'Standard Studios', count: splits.studio || 0, rate: RATES.studio },
      { name: 'Premier Studios', count: splits.premier || 0, rate: RATES.premier },
      { name: 'Accessible Studios (ACC)', count: splits.acc || 0, rate: RATES.acc },
      { name: 'KLD 4-Person Kitchens', count: splits.kld4 || 0, rate: RATES.kld4 },
      { name: 'KLD 5-Person Kitchens', count: splits.kld5 || 0, rate: RATES.kld5 },
      { name: 'KLD 6-Person Kitchens', count: splits.kld6 || 0, rate: RATES.kld6 },
      { name: 'KLD 7-Person Kitchens', count: splits.kld7 || 0, rate: RATES.kld7 },
      { name: 'KLD 8-Person Kitchens', count: splits.kld8 || 0, rate: RATES.kld8 },
      { name: 'KLD 9-Person Kitchens', count: splits.kld9 || 0, rate: RATES.kld9 },
    ].filter(item => item.count > 0);

    let itemsSum = items.reduce((sum, item) => sum + (item.count * item.rate), 0);
    let pmFeeTotal = totalUnits * PM_RATE;
    let subTotal = itemsSum + pmFeeTotal;
    let mcdDiscount = subTotal * 0.025;
    let grandTotal = subTotal - mcdDiscount;

    // Helper for creating borders
    const borderStyleNone = { style: BorderStyle.NONE, size: 0, color: 'auto' };
    const borderStyleSolid = { style: BorderStyle.SINGLE, size: 4, color: '1A1A2E' };
    const borderStyleLight = { style: BorderStyle.SINGLE, size: 4, color: '7F8C8D' };

    const borderStyleThinGold = { style: BorderStyle.SINGLE, size: 6, color: 'E8C547' };

    // Format currency
    const formatGBP = (val) => '£' + val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Build Word Document
    const doc = new Document({
      creator: 'Flagstaffe EzBid',
      title: `Flag-${bid.reference} ${bid.projectName} Proposal`,
      styles: {
        default: {
          heading1: {
            run: {
              font: 'Arial',
              size: 32, // 16pt
              bold: true,
              color: '1A1A2E'
            },
            paragraph: {
              spacing: { before: 240, after: 120 }
            }
          },
          heading2: {
            run: {
              font: 'Arial',
              size: 26, // 13pt
              bold: true,
              color: '1A1A2E'
            },
            paragraph: {
              spacing: { before: 180, after: 80 }
            }
          },
          body: {
            run: {
              font: 'Arial',
              size: 22, // 11pt
              color: '333333'
            },
            paragraph: {
              spacing: { after: 120, line: 276 } // 1.15 line spacing
            }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 11906, // A4 width
                height: 16838 // A4 height
              },
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440
              }
            }
          },
          children: [
            // COVER PAGE
            new Paragraph({
              spacing: { before: 1800, after: 400 },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'FLAGSTAFFE',
                  bold: true,
                  size: 64, // 32pt
                  color: '1A1A2E',
                  spacing: 120
                })
              ]
            }),
            new Paragraph({
              spacing: { before: 100, after: 1800 },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'FF&E SUPPLY & INSTALLATION PROPOSAL',
                  bold: true,
                  size: 24, // 12pt
                  color: 'E8C547',
                  spacing: 80
                })
              ]
            }),
            new Paragraph({
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: 'Project Details',
                  bold: true,
                  size: 28,
                  color: '1A1A2E'
                })
              ]
            }),
            // Info Table on Cover
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: borderStyleThinGold,
                bottom: borderStyleThinGold,
                left: borderStyleNone,
                right: borderStyleNone
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: 'Development:', bold: true, color: '1A1A2E' })] })]
                    }),
                    new TableCell({
                      width: { size: 70, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: bid.projectName })] })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'Application Ref:', bold: true, color: '1A1A2E' })] })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: bid.reference })] })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'Location:', bold: true, color: '1A1A2E' })] })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: bid.location })] })]
                    })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: 'Date:', bold: true, color: '1A1A2E' })] })]
                    }),
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: new Date(bid.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) })] })]
                    })
                  ]
                })
              ]
            }),
            new Paragraph({ spacing: { before: 800, after: 200 } }),
            
            // Pricing Table on Cover page
            new Paragraph({
              children: [
                new TextRun({ text: 'Indicative Quote Summary', bold: true, size: 28, color: '1A1A2E' })
              ]
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: borderStyleLight,
                bottom: borderStyleLight,
                left: borderStyleNone,
                right: borderStyleNone,
                insideHorizontal: borderStyleLight
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Room Type', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Qty', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rate', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })] })
                  ]
                }),
                ...items.map(item => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.name })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(item.count) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(item.rate) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(item.count * item.rate) })] })] })
                  ]
                })),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'PM / Prelims Fee' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(totalUnits) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(PM_RATE) })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(pmFeeTotal) })] })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sub-Total', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '-' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '-' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(subTotal), bold: true })] })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MCD Discount (2.5%)', color: '7F8C8D' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '-' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '-' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `(${formatGBP(mcdDiscount)})`, color: '7F8C8D' })] })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Grand Total', bold: true, color: '1A1A2E', size: 24 })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatGBP(grandTotal), bold: true, color: '1A1A2E', size: 24 })] })] })
                  ]
                })
              ]
            }),
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({
                  text: `Note: Pricing is indicative. Based on Wolverhampton Flag22167 Band A rates. Excludes VAT, skips, final electrical/plumbing connections.`,
                  italics: true,
                  size: 16,
                  color: '7F8C8D'
                })
              ]
            }),
            new Paragraph({ children: [new PageBreak()] }),

            // CONTENT SECTIONS (Parsed from Markdown headings)
            ...parseMarkdownToDocx(bid.content)
          ]
        }
      ]
    });

    Packer.toBuffer(doc).then((buffer) => {
      callback(null, buffer);
    }).catch(err => {
      callback(err);
    });

  } catch (error) {
    console.error('Error generating document:', error);
    callback(error);
  }
}

// Simple parser to convert Markdown content to docx Paragraphs
function parseMarkdownToDocx(mdText) {
  const paragraphs = [];
  if (!mdText) return paragraphs;

  const lines = mdText.split('\n');
  let currentList = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    // Header 1 (# Section)
    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    }
    // Header 2 (## Subsection)
    else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 }
        })
      );
    }
    // Bullet list item (* item or - item)
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      const text = line.substring(2);
      // Simple bold parsing inside bullet
      const runs = parseInlineFormatting(text);
      paragraphs.push(
        new Paragraph({
          children: runs,
          bullet: {
            level: 0
          },
          spacing: { after: 80 }
        })
      );
    }
    // Bold highlight blocks
    else if (line.startsWith('**') && line.endsWith('**')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, ''),
              bold: true,
              color: '1A1A2E'
            })
          ],
          spacing: { after: 120 }
        })
      );
    }
    // Normal paragraph text
    else {
      const runs = parseInlineFormatting(line);
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { after: 120, line: 276 }
        })
      );
    }
  }

  return paragraphs;
}

// Parse simple markdown formatting like **bold**
function parseInlineFormatting(text) {
  const runs = [];
  const regex = /(\*\*.*?\*\*)/g;
  const parts = text.split(regex);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          color: '1A1A2E'
        })
      );
    } else if (part) {
      runs.push(
        new TextRun({
          text: part,
          color: '333333'
        })
      );
    }
  }

  return runs;
}

module.exports = {
  generateDocx
};
