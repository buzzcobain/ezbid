const ExcelJS = require('exceljs');

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

const PM_RATE = 68.43;

function generateXlsx(bid, callback) {
  try {
    const workbook = new ExcelJS.Workbook();
    const splits = bid.roomSplits || {};

    const formatCurrency = (cell) => {
      cell.numFormat = '"£"#,##0.00';
    };

    const styleHeader = (row) => {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1A1A2E' }
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' },
          bold: true,
          name: 'Arial',
          size: 10
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    };

    const styleGoldRow = (row) => {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8C547' }
        };
        cell.font = {
          color: { argb: 'FF1A1A2E' },
          bold: true,
          name: 'Arial',
          size: 10
        };
      });
    };

    // ----------------------------------------------------
    // Sheet 1: SUMMARY
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet('SUMMARY');
    summarySheet.views = [{ showGridLines: true }];
    summarySheet.columns = [
      { header: 'Item Description', key: 'desc', width: 35 },
      { header: 'Room Type', key: 'type', width: 20 },
      { header: 'Unit Count', key: 'count', width: 12 },
      { header: 'Unit Rate', key: 'rate', width: 15 },
      { header: 'Category Total', key: 'total', width: 18 }
    ];
    styleHeader(summarySheet.getRow(1));

    summarySheet.addRow(['Project Details:', bid.projectName, '', '', '']);
    summarySheet.addRow(['Reference:', bid.reference, '', '', '']);
    summarySheet.addRow(['Location:', bid.location, '', '', '']);
    summarySheet.addRow(['Pricing Basis:', bid.pricingBasis, '', '', '']);
    summarySheet.addRow([]);

    const detailStartRow = 7;
    const items = [
      { desc: 'Fitted cluster bedrooms + install', type: 'Cluster', count: splits.cluster || 0, rate: RATES.cluster },
      { desc: 'Fitted studio bedrooms + appliances + install', type: 'Standard Studio', count: splits.studio || 0, rate: RATES.studio },
      { desc: 'Fitted premier studio rooms + sofa + install', type: 'Premier Studio', count: splits.premier || 0, rate: RATES.premier },
      { desc: 'Accessible studio bedrooms + DDA joinery + install', type: 'Studio ACC', count: splits.acc || 0, rate: RATES.acc },
      { desc: '4-Person cluster KLD kitchen + loose', type: 'KLD 4p', count: splits.kld4 || 0, rate: RATES.kld4 },
      { desc: '5-Person cluster KLD kitchen + sofa + loose', type: 'KLD 5p', count: splits.kld5 || 0, rate: RATES.kld5 },
      { desc: '6-Person cluster KLD kitchen + sofa + loose', type: 'KLD 6p', count: splits.kld6 || 0, rate: RATES.kld6 },
      { desc: '7-Person cluster KLD kitchen + sofa + loose', type: 'KLD 7p', count: splits.kld7 || 0, rate: RATES.kld7 },
      { desc: '8-Person cluster KLD kitchen + sofa + loose', type: 'KLD 8p', count: splits.kld8 || 0, rate: RATES.kld8 },
      { desc: '9-Person cluster KLD kitchen + sofa + loose', type: 'KLD 9p', count: splits.kld9 || 0, rate: RATES.kld9 },
    ].filter(i => i.count > 0);

    items.forEach((item, index) => {
      const rowNum = detailStartRow + index;
      const row = summarySheet.addRow([
        item.desc,
        item.type,
        item.count,
        item.rate,
        { formula: `=C${rowNum}*D${rowNum}` }
      ]);
      formatCurrency(row.getCell(4));
      formatCurrency(row.getCell(5));
    });

    const itemsEndRow = detailStartRow + items.length - 1;

    // PM Fee row
    const totalBeds = (splits.cluster || 0) + (splits.studio || 0) + (splits.premier || 0) + (splits.acc || 0);
    const totalKLDs = (splits.kld4 || 0) + (splits.kld5 || 0) + (splits.kld6 || 0) + (splits.kld7 || 0) + (splits.kld8 || 0) + (splits.kld9 || 0);
    const totalUnits = totalBeds + totalKLDs;
    const pmRowNum = itemsEndRow + 2;
    const pmRow = summarySheet.addRow([
      'Project Management & Prelims fee',
      'All Units (Beds + KLD)',
      totalUnits,
      PM_RATE,
      { formula: `=C${pmRowNum}*D${pmRowNum}` }
    ]);
    formatCurrency(pmRow.getCell(4));
    formatCurrency(pmRow.getCell(5));

    // Subtotal Row
    const subtotalRowNum = pmRowNum + 1;
    const subtotalRow = summarySheet.addRow([
      'Sub-total (excl. VAT)',
      '',
      '',
      '',
      { formula: `=SUM(E${detailStartRow}:E${pmRowNum})` }
    ]);
    subtotalRow.getCell(1).font = { bold: true };
    formatCurrency(subtotalRow.getCell(5));
    subtotalRow.getCell(5).font = { bold: true };

    // MCD Discount Row
    const mcdRowNum = subtotalRowNum + 1;
    const mcdRow = summarySheet.addRow([
      'Main Contractor Discount (MCD)',
      '2.5%',
      '',
      '',
      { formula: `=E${subtotalRowNum}*0.025` }
    ]);
    formatCurrency(mcdRow.getCell(5));
    mcdRow.getCell(5).font = { italic: true };

    // Grand Total Row
    const totalRowNum = mcdRowNum + 1;
    const totalRow = summarySheet.addRow([
      'Grand Total (excl. VAT)',
      '',
      '',
      '',
      { formula: `=E${subtotalRowNum}-E${mcdRowNum}` }
    ]);
    styleGoldRow(totalRow);
    formatCurrency(totalRow.getCell(5));

    // ----------------------------------------------------
    // Create Mocked/Reference detail sheets: BEDROOMS, KITCHENS, APPLIANCES, LOOSE
    // These contain the actual Wolverhampton style itemized pricing
    // ----------------------------------------------------
    const createDetailSheet = (sheetName, columns, itemsData) => {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.views = [{ showGridLines: true }];
      sheet.columns = columns;
      styleHeader(sheet.getRow(1));

      itemsData.forEach((item, index) => {
        const rowNum = 2 + index;
        const row = sheet.addRow(item);
        if (row.getCell(6).value) formatCurrency(row.getCell(6));
        if (row.getCell(8).value) formatCurrency(row.getCell(8));
      });
    };

    // 2. BEDROOMS
    createDetailSheet('BEDROOMS', [
      { header: 'Code', key: 'code', width: 8 },
      { header: 'Description', key: 'desc', width: 35 },
      { header: 'Specification', key: 'spec', width: 45 },
      { header: 'Supplier', key: 'supplier', width: 12 },
      { header: 'Model', key: 'model', width: 12 },
      { header: 'Rate (£)', key: 'rate', width: 12 },
      { header: 'Est Qty', key: 'qty', width: 10 },
      { header: 'Total (£)', key: 'total', width: 15 }
    ], [
      { code: 'B4', desc: 'Desktop straight 2100x600x25', spec: '1x cable tidy, supporting batten, no upstand', supplier: 'Factory', model: 'MFC Band A', rate: 73.90, qty: totalBeds, total: { formula: `=F2*G2` } },
      { code: 'B13', desc: 'Drawers 400x725x570mm', spec: '3 drawers soft close', supplier: 'Factory', model: 'Metabox', rate: 108.53, qty: totalBeds, total: { formula: `=F3*G3` } },
      { code: 'B28', desc: 'Bed Double 1420x1950x450mm', spec: 'MFC bed with underbed storage boxes', supplier: 'Factory', model: 'MFC Band A', rate: 207.11, qty: totalBeds, total: { formula: `=F4*G4` } },
      { code: 'B55', desc: 'Wardrobe 1000x2100x600mm', spec: '2 doors, full shelf, full hanging rail', supplier: 'Factory', model: 'MFC Band A', rate: 284.99, qty: totalBeds, total: { formula: `=F5*G5` } },
      { code: 'B84', desc: 'Mirror 500x1600x4mm', spec: 'Chrome fixings, safety backed, polished edges', supplier: 'Tradesliders', model: 'Clear Float', rate: 46.31, qty: totalBeds, total: { formula: `=F6*G6` } },
      { code: 'INS', desc: 'Installation – Bedrooms Package', spec: 'Assembly, horizontal distribution and clean', supplier: 'Labour', model: 'CSCS crew', rate: 242.75, qty: totalBeds, total: { formula: `=F7*G7` } },
    ]);

    // 3. KITCHENS
    createDetailSheet('KITCHENS', [
      { header: 'Code', key: 'code', width: 8 },
      { header: 'Description', key: 'desc', width: 35 },
      { header: 'Specification', key: 'spec', width: 45 },
      { header: 'Supplier', key: 'supplier', width: 12 },
      { header: 'Model', key: 'model', width: 12 },
      { header: 'Rate (£)', key: 'rate', width: 12 },
      { header: 'Est Qty', key: 'qty', width: 10 },
      { header: 'Total (£)', key: 'total', width: 15 }
    ], [
      { code: 'K4', desc: 'Wall Unit 500x720x340mm', spec: '1 door and shelf soft close', supplier: 'Factory', model: 'MFC Band A', rate: 61.22, qty: totalKLDs * 5, total: { formula: `=F2*G2` } },
      { code: 'K13', desc: 'Base Unit 500x720x600mm', spec: '1 door highline soft close', supplier: 'Factory', model: 'MFC Band A', rate: 78.62, qty: totalKLDs * 5, total: { formula: `=F3*G3` } },
      { code: 'K19', desc: 'Drawers 600x720x600mm', spec: '3 drawers metabox soft close', supplier: 'Factory', model: 'Metabox', rate: 132.55, qty: totalKLDs, total: { formula: `=F4*G4` } },
      { code: 'K22', desc: 'Sink Unit 1000x720x600mm', spec: 'Removable back service access', supplier: 'Factory', model: 'MFC Band A', rate: 134.87, qty: totalKLDs, total: { formula: `=F5*G5` } },
      { code: 'K40', desc: 'HPL Worktop Square edge', key: 'worktop', spec: 'Egger 4100x650x25mm board', supplier: 'Panelco', model: 'Woodgrain', rate: 147.17, qty: totalKLDs * 1.5, total: { formula: `=F6*G6` } },
      { code: 'K100', desc: 'BLANCO Sink and Tap', spec: 'DINAS 8S sink + MILA ECO tap dry fit', supplier: 'Blanco', model: 'Chrome', rate: 215.55, qty: totalKLDs, total: { formula: `=F7*G7` } },
      { code: 'INS', desc: 'Installation – Kitchens Package', spec: 'Assembly, fitting, leveling and dry fit of sink', supplier: 'Labour', model: 'CSCS crew', rate: 1025.70, qty: totalKLDs, total: { formula: `=F8*G8` } },
    ]);

    // 4. APPLIANCES
    createDetailSheet('APPLIANCES', [
      { header: 'Code', key: 'code', width: 8 },
      { header: 'Description', key: 'desc', width: 35 },
      { header: 'Specification', key: 'spec', width: 45 },
      { header: 'Supplier', key: 'supplier', width: 12 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Rate (£)', key: 'rate', width: 12 },
      { header: 'Est Qty', key: 'qty', width: 10 },
      { header: 'Total (£)', key: 'total', width: 15 }
    ], [
      { code: 'A28', desc: 'Oven – electric fan stainless steel', spec: 'Montpellier electric built in', supplier: 'Montpellier', model: 'M8MES70SS', rate: 154.08, qty: totalKLDs, total: { formula: `=F2*G2` } },
      { code: 'A13', desc: 'Hob – 4 ring ceramic cut-off timer', spec: 'Montpellier 4 zone hobs with plug', supplier: 'Montpellier', model: 'MCH59T15', rate: 118.47, qty: totalKLDs, total: { formula: `=F3*G3` } },
      { code: 'A25', desc: 'Extractor – canopy with filter', spec: 'Montpellier MCA52S + CHAR-04', supplier: 'Montpellier', model: 'MCA52S', rate: 82.11, qty: totalKLDs, total: { formula: `=F4*G4` } },
      { code: 'A28', desc: 'Microwave – integrated combi 25L', spec: 'Montpellier black 25L grill combo', supplier: 'Montpellier', model: 'MWBIC90029', rate: 201.93, qty: totalKLDs, total: { formula: `=F5*G5` } },
      { code: 'A43', desc: 'Fridge Freezer – freestanding', spec: 'Montpellier 4x4 freestanding white', supplier: 'Montpellier', model: 'MDANF181W', rate: 288.77, qty: totalKLDs * 2, total: { formula: `=F6*G6` } },
      { code: 'DIS', desc: 'Distribution and dry fit', spec: 'Per appliance delivery and plug-in placement', supplier: 'Labour', model: 'CSCS crew', rate: 12.31, qty: totalKLDs * 6, total: { formula: `=F7*G7` } },
    ]);

    // 5. LOOSE
    createDetailSheet('LOOSE', [
      { header: 'Code', key: 'code', width: 8 },
      { header: 'Description', key: 'desc', width: 35 },
      { header: 'Specification', key: 'spec', width: 45 },
      { header: 'Supplier', key: 'supplier', width: 12 },
      { header: 'Model', key: 'model', width: 12 },
      { header: 'Rate (£)', key: 'rate', width: 12 },
      { header: 'Est Qty', key: 'qty', width: 10 },
      { header: 'Total (£)', key: 'total', width: 15 }
    ], [
      { code: 'L7', desc: 'Mattress Double contract grade', spec: 'Stonehouse 1350x1900x190mm crib 5', supplier: 'Stonehouse', model: 'Mid Matt', rate: 88.51, qty: totalBeds, total: { formula: `=F2*G2` } },
      { code: 'L10', desc: 'Desk Chair gas lift arms black', spec: 'TC gas lift with arms crib 5 nylon base', supplier: 'TC Group', model: 'Start Mesh', rate: 73.73, qty: totalBeds, total: { formula: `=F3*G3` } },
      { code: 'L20', desc: 'Dining Bench 1800x450x350mm', spec: 'Charterbrae metal frame bench MFC top', supplier: 'Charterbrae', model: 'Poland', rate: 163.12, qty: totalKLDs * 2, total: { formula: `=F4*G4` } },
      { code: 'L32', desc: 'Dining Table 1800x700x700mm', spec: 'Charterbrae 50mm metal legs table', supplier: 'Charterbrae', model: 'Poland', rate: 202.46, qty: totalKLDs, total: { formula: `=F5*G5` } },
      { code: 'L35', desc: '3 Seat Sofa grey fabric', spec: 'Lion fabric evolution series crib 5', supplier: 'Lion Sofa', model: 'Victoria 3S', rate: 418.23, qty: totalKLDs, total: { formula: `=F6*G6` } },
      { code: 'L56', desc: 'Swing Bin 50L plastic grey', spec: 'Swing lid waste bins', supplier: 'PlasticBox', model: 'WME50BSG', rate: 14.75, qty: totalKLDs, total: { formula: `=F7*G7` } },
      { code: 'DIS', desc: 'Distribution – sofa and tables', spec: 'Manual distribution per sofa and dining set', supplier: 'Labour', model: 'CSCS crew', rate: 23.08, qty: totalKLDs * 3, total: { formula: `=F8*G8` } },
    ]);

    // 6. ROOM SPLITS
    const splitsSheet = workbook.addWorksheet('ROOM SPLITS');
    splitsSheet.views = [{ showGridLines: true }];
    splitsSheet.columns = [
      { header: 'Room Type', key: 'type', width: 25 },
      { header: 'Count', key: 'count', width: 12 },
      { header: 'Rate (£)', key: 'rate', width: 15 },
      { header: 'Reconciled Cost (£)', key: 'total', width: 20 }
    ];
    styleHeader(splitsSheet.getRow(1));

    let splitIndex = 2;
    Object.keys(RATES).forEach((key) => {
      const countVal = splits[key] || 0;
      if (countVal > 0 || key === 'cluster' || key === 'studio') {
        const row = splitsSheet.addRow([
          key.toUpperCase(),
          countVal,
          RATES[key],
          { formula: `=B${splitIndex}*C${splitIndex}` }
        ]);
        formatCurrency(row.getCell(3));
        formatCurrency(row.getCell(4));
        splitIndex++;
      }
    });

    splitsSheet.addRow([]);
    const verRowNum = splitIndex + 1;
    const verRow = splitsSheet.addRow([
      'Room Splitting Reconciliation',
      'Verification:',
      { formula: `=SUM(D2:D${splitIndex-1}) - SUM(SUMMARY!E7:E${itemsEndRow})` },
      'Difference (Must be £0.00)'
    ]);
    verRow.getCell(1).font = { bold: true };
    formatCurrency(verRow.getCell(3));
    verRow.getCell(3).font = { bold: true, color: { argb: 'FF008000' } };

    // 7. T&Cs
    const tcSheet = workbook.addWorksheet('T&Cs');
    tcSheet.views = [{ showGridLines: true }];
    tcSheet.columns = [
      { header: 'Clause', key: 'clause', width: 10 },
      { header: 'Category', key: 'cat', width: 15 },
      { header: 'Terms and Conditions details', key: 'detail', width: 85 }
    ];
    styleHeader(tcSheet.getRow(1));

    tcSheet.addRow(['1', 'Contract', 'All quotations valid for a period of 60 days from document issue.']);
    tcSheet.addRow(['2', 'Contract', 'Pricing is structured based on the total project order. Any deletion of rooms or reduction in scope may result in a revision of rates.']);
    tcSheet.addRow(['3', 'Delivery', 'Horizontal distribution of goods from offload zone to bedroom space is included, assuming good clear pathways.']);
    tcSheet.addRow(['4', 'Delivery', 'Vertical distribution of goods to higher storeys is excluded. Main Contractor must provide fully working goods hoist or forklift support.']);
    tcSheet.addRow(['5', 'Delivery', 'Horizontal and vertical unloading requires clear articulated lorry access within 25 meters of the drop off point.']);
    tcSheet.addRow(['6', 'Design', 'Flagstaffe is an FF&E supplier. Architectural and interior design liability remains with the designated project architect or engineer. Sign-off is required before bulk manufacturing.']);
    tcSheet.addRow(['7', 'Install', 'Electrical connections are strictly limited to simple plug-in items. Dry fit of sinks and hobs included. Electrical wiring and wet plumbing connections by others.']);
    tcSheet.addRow(['8', 'Install', 'Skips and packaging recycling bins are the responsibility of the Main Contractor on site.']);
    tcSheet.addRow(['9', 'Tax', 'Prices exclude VAT. Reverse charge regulations likely apply to student housing construction.']);

    // Compile Workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      callback(null, buffer);
    }).catch((err) => {
      callback(err);
    });

  } catch (error) {
    console.error('Error generating Excel sheet:', error);
    callback(error);
  }
}

module.exports = {
  generateXlsx
};
