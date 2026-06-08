const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageBreak, TabStopType
} = require('docx');
const fs = require('fs');
const { execSync } = require('child_process');

// ── Palette ───────────────────────────────────────────────────────────────────
const NAVY='1A1A2E', AMBER='E8C547', BODY='333333', LIGHT='F7F5F0',
      WHITE='FFFFFF', MID='7F8C8D', RED='C62828', ORANGE='E65100',
      AMBER_BG='FFF9E0', WARN_BG='FFF9C4', WARN_F='E65100';
const PAGE_W=11906, PAGE_H=16838, MARGIN=1134, CW=PAGE_W-MARGIN*2;

// ── Helpers ───────────────────────────────────────────────────────────────────
const tr=(t,o={})=>new TextRun({text:t,font:'Arial',color:BODY,size:20,...o});
const sp=(b=0,a=0)=>({before:b,after:a});
const hair=c=>({style:BorderStyle.SINGLE,size:1,color:c});
const thk=c=>({style:BorderStyle.SINGLE,size:6,color:c});
const pb=()=>new Paragraph({children:[new PageBreak()]});
const gap=(n=120)=>new Paragraph({spacing:sp(0,n),children:[tr('')]});
const rule=()=>new Paragraph({spacing:sp(60,60),border:{bottom:{style:BorderStyle.SINGLE,size:4,color:AMBER}},children:[tr('')]});
const h1=t=>new Paragraph({heading:HeadingLevel.HEADING_1,spacing:sp(300,120),
  border:{bottom:{style:BorderStyle.SINGLE,size:10,color:AMBER,space:4}},
  children:[new TextRun({text:t,font:'Arial',bold:true,size:28,color:NAVY})]});
const h2=t=>new Paragraph({spacing:sp(200,60),
  children:[new TextRun({text:t,font:'Arial',bold:true,size:22,color:NAVY})]});
const body=t=>new Paragraph({spacing:sp(0,120),children:[tr(t)]});
const bul=t=>new Paragraph({numbering:{reference:'bullets',level:0},spacing:sp(0,80),children:[tr(t)]});
const kv=(label,val,boldVal=false)=>new Paragraph({
  spacing:sp(0,70),tabStops:[{type:TabStopType.LEFT,position:2600}],
  children:[tr(label,{bold:true,color:NAVY}),new TextRun({text:'\t',font:'Arial'}),tr(val,{bold:boldVal})]});
const warn=t=>new Paragraph({spacing:sp(120,120),indent:{left:280},
  shading:{fill:WARN_BG,type:ShadingType.CLEAR},
  border:{left:{style:BorderStyle.SINGLE,size:16,color:ORANGE},
    top:{style:BorderStyle.SINGLE,size:2,color:ORANGE},
    bottom:{style:BorderStyle.SINGLE,size:2,color:ORANGE},
    right:{style:BorderStyle.NONE,size:0,color:WHITE}},
  children:[tr(t,{bold:true,color:ORANGE,size:19})]});

const fmt=v=>'\u00a3'+v.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtI=v=>v.toLocaleString('en-GB');

// ── Pricing constants ─────────────────────────────────────────────────────────
const STUDIO=770, ACC_N=43, TOTAL=813;
const S_BED=1511.07,S_KIT=1331.80,S_LOOSE=574.52,S_APP=873.11,S_TOTAL=4290.50;
const A_BED=1734.34,A_KIT=2182.68,A_LOOSE=574.52,A_APP=757.34,A_TOTAL=5248.89;
const BED_T=STUDIO*S_BED+ACC_N*A_BED;
const KIT_T=STUDIO*S_KIT+ACC_N*A_KIT;
const LOOSE_T=STUDIO*S_LOOSE+ACC_N*A_LOOSE;
const APP_T=STUDIO*S_APP+ACC_N*A_APP;
const PM_T=TOTAL*68.43;
const SUB_T=BED_T+KIT_T+LOOSE_T+APP_T+PM_T;
const MCD_T=SUB_T*0.025;
const GRAND=SUB_T-MCD_T;

// ── Line item data ────────────────────────────────────────────────────────────
// (code, description, spec, supplier, model, rate, studio_qty, acc_qty)
const BEDROOM_ITEMS=[
  // DESKS
  ['B1','Desktop straight 1800 x 600 x 25mm','1x cable tidy 80mm, supporting batten','Factory','25 pricelist',56.67,0,1],
  ['B4','Desktop straight 2100 x 600 x 25mm','1x cable tidy 80mm, supporting batten','Factory','25 pricelist',73.90,1,0],
  ['B10','Desk Rise and Fall system — Hand Crank','DDA rooms only','RACK','',368.33,0,1],
  ['B13','Drawers 400 x 725 x 570mm — 3 drawers','','Factory','25 pricelist',108.53,1,0],
  ['B13','ACC Pedestal — 3 drawers on castors','DDA rooms','Factory','25 pricelist',120.95,0,1],
  // BEDS
  ['B28','Bed Double — 1420 x 1950 x 450mm','MFC with storage','Factory','25 pricelist',207.11,1,1],
  ['B46','Headboard Flat Double — 1400 x 550 x 18mm','','Factory','25 pricelist',28.17,1,1],
  ['B43','Extended Headboard Boxed 1650 x 1000 x 150mm','Service zone from kitchen','Factory','25 pricelist',86.16,1,0],
  // WARDROBES
  ['B61','Wardrobe 700 x 2100 x 600mm','2 doors, full shelf, full hanging rail','Station Rd','25 pricelist',244.48,1,0],
  ['B64','Wardrobe 400 x 2100 x 600mm','1 door, full shelf, full hanging rail','Station Rd','25 pricelist',208.47,1,0],
  ['B55','Wardrobe 1000 x 2100 x 600mm','2 doors, full shelf, full hanging rail','Factory','25 pricelist',284.99,0,1],
  ['B73','Tall Open Shelving 400 x 2100 x 600mm','5 fixed shelves','Factory','25 pricelist',124.27,1,1],
  ['B76','Pull-down DDA rail within wardrobe','Grey — DDA rooms','Hafele','805.20.056',95.38,0,1],
  // OTHER
  ['B82','Coathooks on pattress','','Umbra','',14.36,1,1],
  ['B64','Tall infill 2100 x 70 x 18mm','','','',13.26,1,1],
  ['B84','Mirror 500 x 1600 x 4mm','Chrome fixings, safety backed','Tradesliders','',46.31,1,1],
  ['B84','Mirror back panel','','','',26.92,1,1],
  ['B93','Pinboard 1800 x 600 x 9mm','Polycolour, mechanically fixed','Pitts','Polycolour',48.46,0,1],
  ['B96','Pinboard 2100 x 600 x 9mm','Polycolour, mechanically fixed','Pitts','Polycolour',64.62,1,0],
  // INSTALLATION
  ['INS','Installation — Standard Studio bedroom','Offload, distribute, unpack, assemble, fix, waste, snag','','',242.75,1,0],
  ['INS','Installation — Studio ACC/DDA bedroom','','','',299.16,0,1],
];

const KITCHEN_ITEMS=[
  // WALL UNITS
  ['K4','Wall Unit 600 x 720 x 340mm — 1 door and shelf','Studios and ACC','Factory','25 pricelist',67.85,2,2],
  ['K9','Extractor Unit 600 x 720 x 340mm — top opening with shelf','All kitchens','Factory','25 pricelist',74.48,1,1],
  // BASE UNITS
  ['K13','Base Unit 600 x 720 x 600mm highline','ACC only','Factory','25 pricelist',85.25,0,1],
  ['K25','Sink Unit 600 x 720 x 600mm inc removable back','Studio only','Factory','25 pricelist',79.03,1,0],
  ['K25','Undercounter Fridge Door 600 x 720 x 18mm on plinth','Studio only','Beeston','',23.10,1,0],
  ['K28','Combi Housing 600 x 720 x 600mm with pan drawer','Studio only','Factory','25 pricelist',89.51,1,0],
  // TALL UNITS
  ['K34','ACC Tall Microwave Housing 600 x 2100 x 600mm','DDA only','Factory','25 pricelist',254.50,0,1],
  ['K46','DDA Adjustable Height Mechanism','Rak Systems HA-700-C-BOXY-SINK','Rak Systems','HA-700-C-BOXY-SINK',381.79,0,1],
  // WORKTOPS
  ['K40','HPL Worktop Square edge 4100 x 650 x 25mm','Egger — 0.5 board per studio/ACC','Panelco','25 pricelist',73.59,1,1], // 0.5 * 147.17
  // SPLASHBACKS
  ['K52','HPL Splashback per kitchen','Egger — Studio: 0.72m2 | ACC: 1.44m2','Panelco','£65/m2',79.87,1,0], // 0.72*110.93
  ['K52','HPL Splashback per kitchen (ACC)','Egger — 1.44m2','Panelco','£65/m2',159.74,0,1], // 1.44*110.93
  ['K61','Brushed SS Splashback 600 x 600 x 9mm','Studio ×2 | ACC ×1','MPM','25 pricelist',73.73,2,1],
  // INFILLS
  ['K64','Wall infill 720 x 70 x 18mm','Studio ×2 | ACC ×1','Factory','25 pricelist',6.41,2,1],
  ['K67','Base infill 720 x 70 x 18mm','Studio ×2 | ACC ×1','Factory','25 pricelist',6.61,2,1],
  ['K70','Base End Panel','ACC only','Factory','25 pricelist',18.42,0,1],
  ['K73','Wall End Panel','ACC only','Factory','25 pricelist',11.60,0,1],
  ['K82','DDA sink modesty panel 1200 x 200 x 18mm','ACC only','Factory','25 pricelist',41.42,0,1],
  // SINKS & TAPS
  ['K85','BLANCO Sink and Tap','DINAS 45S MINI + MILA ECO — dry fit only','Blanco','Station Road',175.65,1,1],
  // INSTALLATION
  ['INS','Installation — Studio kitchen','Offload, distribute, unpack, assemble, fix, waste, snag','','',427.38,1,0],
  ['INS','Installation — Studio ACC kitchen','','','',683.80,0,1],
];

const APPLIANCE_ITEMS=[
  ['A10','Hob — 2 ring ceramic cut-off timer with plug','Studios and ACC','Montpellier','MCH29T15',88.85,1,1],
  ['A25','Extractor — canopy with charcoal filter','Studios and ACC','Montpellier','MCA52S',82.11,1,1],
  ['A28','Microwave — integrated combi 45L black','Studios and ACC','Montpellier','MWBIC90044',403.87,1,1],
  ['A58','Fridge — undercounter integrated with icebox','Standard Studio','Montpellier','MBUR115E',249.05,1,0],
  ['A61','Fridge — undercounter freestanding with icebox white','Studio ACC','Montpellier','MDAUCIB54W',133.28,0,1],
  ['DIS','Distribution of appliances and dry fit','Per appliance — 4 per kitchen','','',12.31,4,4],
];

const LOOSE_ITEMS=[
  // MATTRESSES & BEDROOM
  ['L7','Mattress Double — 1350 x 1900 x 190mm contract','','Stonehouse','Mid matt',88.51,1,1],
  ['L10','Desk Chair — mesh gas lift arms crib 5 black','','TC','Start',73.73,1,1],
  // KITCHEN/COMMUNAL
  ['L26','Pedestal Table 750 x 750 x 700mm','25mm MFC top, black base','Global','Poland',105.42,1,1],
  // BINS
  ['L53','Wastepaper Bin — plastic 12L','','Plastic Box Shop','NWDRB',5.14,1,1],
  ['L59','Integrated Bin — 2 x 10L / 1 x 20L','','Emuca','8199423',49.71,1,1],
  ['L64','Fire blanket 1 x 1m','','Safety Supply Company','SGI-GF-FB-10-10A',5.80,1,1],
  // DISTRIBUTION
  ['DIS','Distribution — bins, accessories & brown goods','Per item — approx. 3 per studio','','',3.08,3,3],
  ['DIS','Distribution — assembled goods','Per item — approx. 5 per studio','','',15.39,5,5],
];

// ── Table builder for line items ──────────────────────────────────────────────
function buildLineTable(items, studioCount, accCount){
  const cols=[
    Math.floor(CW*0.05), // code
    Math.floor(CW*0.30), // description
    Math.floor(CW*0.15), // spec
    Math.floor(CW*0.07), // supplier
    Math.floor(CW*0.08), // model
    Math.floor(CW*0.07), // rate
    Math.floor(CW*0.05), // S qty
    Math.floor(CW*0.09), // S sub
    Math.floor(CW*0.04), // A qty
    CW-Math.floor(CW*0.05)-Math.floor(CW*0.30)-Math.floor(CW*0.15)-Math.floor(CW*0.07)-Math.floor(CW*0.08)-Math.floor(CW*0.07)-Math.floor(CW*0.05)-Math.floor(CW*0.09)-Math.floor(CW*0.04), // A sub
  ];
  // Plus total col — shift
  const totCol=Math.floor(CW*0.09);
  const newCols=[...cols];
  newCols[9]=cols[9]-totCol+Math.floor(CW*0.04);
  newCols.push(totCol);
  // Actually just 10 cols
  const c10=[
    Math.floor(CW*0.05),Math.floor(CW*0.26),Math.floor(CW*0.13),
    Math.floor(CW*0.07),Math.floor(CW*0.07),Math.floor(CW*0.07),
    Math.floor(CW*0.05),Math.floor(CW*0.09),Math.floor(CW*0.04),Math.floor(CW*0.08),
    CW-Math.floor(CW*0.05)-Math.floor(CW*0.26)-Math.floor(CW*0.13)-Math.floor(CW*0.07)*3-Math.floor(CW*0.05)-Math.floor(CW*0.09)-Math.floor(CW*0.04)-Math.floor(CW*0.08)
  ];
  const mkC=(t,w,o={})=>new TableCell({
    borders:{top:hair(o.head?NAVY:'DDDDDD'),bottom:hair(o.head?NAVY:'DDDDDD'),
             left:hair(o.head?NAVY:'DDDDDD'),right:hair(o.head?NAVY:'DDDDDD')},
    shading:{fill:o.head?NAVY:(o.sect?AMBER_BG:(o.total?AMBER:(o.zero?LIGHT:WHITE))),type:ShadingType.CLEAR},
    margins:{top:60,bottom:60,left:100,right:100},
    width:{size:w,type:WidthType.DXA},
    children:[new Paragraph({spacing:sp(0,0),
      alignment:o.right?AlignmentType.RIGHT:AlignmentType.LEFT,
      children:[tr(t,{bold:!!o.head||!!o.total,
        color:o.head?WHITE:(o.total?NAVY:(o.zero?'CCCCCC':BODY)),size:o.sz||17})]})]});
  const rows=[];
  // Header
  rows.push(new TableRow({children:[
    mkC('Code',c10[0],{head:true,sz:16}),mkC('Description',c10[1],{head:true,sz:16}),
    mkC('Spec',c10[2],{head:true,sz:16}),mkC('Supplier',c10[3],{head:true,sz:16}),
    mkC('Model',c10[4],{head:true,sz:16}),mkC('Rate (£)',c10[5],{head:true,right:true,sz:16}),
    mkC(`Studio\n(${fmtI(studioCount)})`,c10[6],{head:true,right:true,sz:14}),
    mkC('Studio\nsub-total',c10[7],{head:true,right:true,sz:14}),
    mkC(`ACC\n(${fmtI(accCount)})`,c10[8],{head:true,right:true,sz:14}),
    mkC('ACC\nsub-total',c10[9],{head:true,right:true,sz:14}),
    mkC('TOTAL (£)',c10[10],{head:true,right:true,sz:14}),
  ]}));

  let runningTotal=0;
  let currentSection='';
  for(const item of items){
    const [code,desc,spec,sup,model,rate,sqty,aqty]=item;
    const ssub=rate*sqty*studioCount;
    const asub=rate*aqty*accCount;
    const total=ssub+asub;
    runningTotal+=total;
    rows.push(new TableRow({children:[
      mkC(code,c10[0],{sz:15}),mkC(desc,c10[1],{sz:16}),
      mkC(spec,c10[2],{sz:14}),mkC(sup,c10[3],{sz:14}),
      mkC(model,c10[4],{sz:14}),
      mkC(fmt(rate),c10[5],{right:true,sz:15}),
      mkC(sqty?String(sqty):'',c10[6],{right:true,zero:!sqty,sz:15}),
      mkC(ssub?fmt(ssub):'',c10[7],{right:true,zero:!ssub,sz:15}),
      mkC(aqty?String(aqty):'',c10[8],{right:true,zero:!aqty,sz:15}),
      mkC(asub?fmt(asub):'',c10[9],{right:true,zero:!asub,sz:15}),
      mkC(fmt(total),c10[10],{right:true,sz:15}),
    ]}));
  }
  // Total row
  rows.push(new TableRow({children:[
    new TableCell({columnSpan:9,
      borders:{top:thk(NAVY),bottom:thk(NAVY),left:thk(NAVY),right:thk(NAVY)},
      shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:100,right:100},
      width:{size:c10.slice(0,9).reduce((a,b)=>a+b,0),type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),
        children:[tr('TOTAL',{bold:true,color:WHITE,size:18})]})]}),
    new TableCell({columnSpan:2,
      borders:{top:thk(NAVY),bottom:thk(NAVY),left:thk(NAVY),right:thk(NAVY)},
      shading:{fill:AMBER,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:100,right:100},
      width:{size:c10[9]+c10[10],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),alignment:AlignmentType.RIGHT,
        children:[tr(fmt(runningTotal),{bold:true,color:NAVY,size:18})]})]}),
  ]}));
  return {table:new Table({width:{size:CW,type:WidthType.DXA},columnWidths:c10,rows}),total:runningTotal};
}

// ── Summary table (cover page style) ─────────────────────────────────────────
function buildSummaryTable(){
  const cw2=[Math.floor(CW*0.55),CW-Math.floor(CW*0.55)];
  const mkR=(label,val,opts={})=>new TableRow({children:[
    new TableCell({borders:{top:hair('DDDDDD'),bottom:hair('DDDDDD'),left:hair(opts.bold?NAVY:'DDDDDD'),right:hair('DDDDDD')},
      shading:{fill:opts.head?NAVY:(opts.amber?AMBER:WHITE),type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:160,right:160},width:{size:cw2[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr(label,{bold:!!opts.head||!!opts.amber,
        color:opts.head?WHITE:NAVY,size:opts.sz||20})]})]
    }),
    new TableCell({borders:{top:hair('DDDDDD'),bottom:hair('DDDDDD'),left:hair('DDDDDD'),right:hair(opts.bold?NAVY:'DDDDDD')},
      shading:{fill:opts.head?NAVY:(opts.amber?AMBER:WHITE),type:ShadingType.CLEAR},
      margins:{top:80,bottom:80,left:160,right:160},width:{size:cw2[1],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),alignment:AlignmentType.RIGHT,children:[tr(val,{bold:!!opts.head||!!opts.amber,
        color:opts.head?WHITE:(opts.red?RED:NAVY),size:opts.sz||20})]})]
    }),
  ]});
  return new Table({width:{size:CW,type:WidthType.DXA},columnWidths:cw2,rows:[
    mkR('Category','Sub-total',{head:true}),
    mkR('Bedrooms',fmt(BED_T)),
    mkR('Kitchens',fmt(KIT_T)),
    mkR('Loose Goods',fmt(LOOSE_T)),
    mkR('Appliances',fmt(APP_T)),
    mkR('Project Management Fee',fmt(PM_T)),
    mkR('Sub-total',fmt(SUB_T),{amber:true}),
    mkR('2.5% MCD Discount','-'+fmt(MCD_T),{red:true}),
    mkR('TOTAL (excl. VAT)',fmt(GRAND),{amber:true,sz:22}),
  ]});
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 1: INDICATIVE BID
// ═══════════════════════════════════════════════════════════════════════════════
function buildIndicativeBid(){
  const ch=[];
  ch.push(gap(300));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,60),
    children:[tr('FLAGSTAFFE',{bold:true,size:56,color:NAVY,allCaps:true})]}));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,30),
    children:[tr('FF&E Supply & Installation  -  Nationwide',{size:22,color:MID})]}));
  ch.push(rule()); ch.push(gap(160));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,60),
    children:[tr('Indicative FF&E Budget',{bold:true,size:32,color:NAVY})]}));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,40),
    children:[tr('Heavitree Road, Exeter  -  NCO (Seven) Ltd / Nixon Homes',{size:24,color:BODY})]}));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,30),
    children:[tr('Flag-HVR-IND-001  |  2 June 2026  |  Rev 0',{size:18,color:MID})]}));
  ch.push(gap(160));
  ch.push(warn('INDICATIVE BUDGET ONLY - Room counts assumed from planning documents. Final pricing requires confirmed room splits, drawings and site survey.'));
  ch.push(gap(200)); ch.push(rule()); ch.push(gap(80));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,50),
    children:[tr('Dan Brownsword  07442399616  -  enquiries@flagstaffe.com  -  01260 460 003',{size:18,color:MID})]}));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,0),
    children:[tr('The Granary Business Centre, Cranage, CW4 8GE  -  flagstaffe.com',{size:18,color:MID})]}));
  ch.push(pb());

  // Project details
  ch.push(h1('Project Details'));
  ch.push(kv('Project','Heavitree Road, Exeter (Former Police HQ & Magistrates Court)'));
  ch.push(kv('Planning reference','25/0676/FUL — Exeter City Council'));
  ch.push(kv('Developer','NCO (Seven) Limited + Nixon Homes Limited'));
  ch.push(kv('Architect','Brown & Company'));
  ch.push(kv('Planning status','Approved December 2025 — construction expected Q3-Q4 2026'));
  ch.push(kv('Scheme description','399 PBSA studios + 414 co-living studios — all self-contained studio format'));
  ch.push(kv('Total units','813 studios'));
  ch.push(kv('Flagstaffe ref','Flag-HVR-IND-001'));
  ch.push(kv('Issued by','Dan Brownsword | Jimmy Hogg (Estimator)'));
  ch.push(kv('Date','2 June 2026'));
  ch.push(kv('Specification assumed','Kronospan Band A (as Flag22167, Stafford St, Wolverhampton)'));
  ch.push(kv('Inflation assumed','Jan-27 start (factor 1.0527 from Apr-26 base)'));
  ch.push(kv('Programme assumed','8 months, even and continuous delivery'));
  ch.push(gap(140));

  // Cover letter
  ch.push(h1('Cover Letter'));
  ch.push(kv('From','Dan Brownsword & Kam Krupinski, Directors — Flagstaffe'));
  ch.push(kv('To','NCO (Seven) Limited / Nixon Homes Limited'));
  ch.push(kv('Re','Heavitree Road, Exeter — FF&E Indicative Budget'));
  ch.push(gap(100));
  ch.push(body('We are writing in relation to your approved mixed PBSA and co-living development at the former Devon & Cornwall Constabulary site, Heavitree Road, Exeter (planning ref: 25/0676/FUL). We understand the scheme has been approved and that construction is expected to commence Q3-Q4 2026.'));
  ch.push(body('Flagstaffe is a specialist FF&E supplier and installer for purpose-built student accommodation and co-living schemes nationwide. Dan Brownsword and Kam Krupinski, who jointly own the business, have between them delivered more than 100,000 rooms across the UK, and we have significant experience of all-studio and co-living format schemes of this scale and complexity.'));
  ch.push(body('The Heavitree Road scheme — 813 studio units across seven blocks — is exactly the scale and format where Flagstaffe delivers its most efficient and competitive pricing. All-studio schemes with no cluster kitchens simplify the procurement process considerably and allow us to move quickly once a programme is confirmed.'));
  ch.push(body('We have prepared the indicative budget below to support your FF&E planning. We would welcome a call to discuss the scheme, talk through our specification assumptions, and understand your timeline in more detail. The budget can be refined quickly once programme dates and any drawings are available.'));
  ch.push(body('Our standard delivery terms allow even and continuous delivery over the programme period, with full installation, snagging and handover for each block as it becomes available. We are experienced in phased multi-block delivery and can adapt the programme to your construction sequence.'));
  ch.push(gap(80));
  ch.push(body('Kind regards,'));
  ch.push(gap(60));
  ch.push(body('Dan Brownsword & Kam Krupinski'));
  ch.push(body('Directors — Flagstaffe'));
  ch.push(body('enquiries@flagstaffe.com  |  01260 460 003'));
  ch.push(gap(140));

  // Indicative budget
  ch.push(h1('Indicative FF&E Budget'));
  ch.push(warn('Room counts assumed: 770 Standard Studios + 43 DDA/Accessible Studios = 813 total. Rates from Flag22167 (Stafford St, Wolverhampton, April 2026, Kronospan Band A). This is a budget estimate — not a final quotation.'));
  ch.push(gap(80));
  ch.push(buildSummaryTable());
  ch.push(gap(100));
  ch.push(new Paragraph({spacing:sp(0,80),children:[tr('excl. VAT (it is expected that Reverse Charge will apply)',{size:17,italic:true,color:MID})]}));
  ch.push(gap(140));

  // Assumed room split
  ch.push(h2('Assumed room split'));
  ch.push(kv('Standard Studios (assumed)',fmtI(STUDIO)));
  ch.push(kv('DDA/Accessible Studios (assumed)',fmtI(ACC_N)));
  ch.push(kv('Total units',fmtI(TOTAL)));
  ch.push(kv('Total KLDs','0 — studio-only scheme, no cluster kitchens'));
  ch.push(gap(80));
  ch.push(body('This budget assumes all units are self-contained studios with individual fitted kitchens, appliances and loose goods — consistent with the planning approval description of "all as studio format." DDA/Accessible studio count assumed at approximately 5% of total (43 units), consistent with typical Building Regulations requirements. Both PBSA and co-living units are assumed to the same specification.'));
  ch.push(gap(140));

  // Cost per unit
  ch.push(h2('Indicative cost per unit'));
  ch.push(kv('Standard Studio',fmt(S_TOTAL)+' — per studio (supply, deliver, install)'));
  ch.push(kv('DDA/Accessible Studio',fmt(A_TOTAL)+' — per studio (full accessible spec)'));
  ch.push(kv('Project Management / Prelims fee','£68.43 per unit x '+fmtI(TOTAL)+' units = '+fmt(PM_T)));
  ch.push(gap(140));

  // Next steps
  ch.push(h1('Proposed Next Steps'));
  ch.push(bul('Introductory call — confirm your programme timeline, phasing sequence across the seven blocks, and any specification preferences or departures from standard.'));
  ch.push(bul('Confirm DDA/accessible unit count and locations — Building Regs requirements will define the exact number and we can update the budget immediately.'));
  ch.push(bul('Specification review — Kronospan Band A is assumed. We can discuss alternatives (Band B, Band C, custom finishes) and provide updated rates.'));
  ch.push(bul('Programme alignment — once construction sequence is confirmed, we will prepare a block-by-block delivery programme and update the budget for any phasing assumptions.'));
  ch.push(bul('Site survey — before final quotation is issued, a brief site survey will be required to confirm access arrangements and vertical distribution logistics.'));
  ch.push(gap(140));

  // Key T&C clauses
  ch.push(h1('Key Terms & Pricing Basis'));
  ch.push(kv('1','All electrical connections (other than plug-in) by others.'));
  ch.push(kv('2','Sink traps excluded. Dry fit of sinks and taps included; wet connections by others.'));
  ch.push(kv('3','Full articulated lorry access on site assumed for offloading.'));
  ch.push(kv('4','Vertical distribution by Main Contractor (goods hoist or forklift with driver).'));
  ch.push(kv('5','Skips excluded (by Main Contractor). Builder\'s clean included.'));
  ch.push(kv('6','Sequencing to be agreed per block to allow sufficient rooms available for templating, delivery and installation.'));
  ch.push(kv('7','Pricing based on whole order being placed with Flagstaffe Ltd.'));
  ch.push(kv('8','Pricing subject to final site survey.'));
  ch.push(kv('9','Finishes priced: Kronospan Band A. Quote valid 60 days.'));
  ch.push(kv('10','Items noted as RATE ONLY do not form part of this quotation.'));
  ch.push(gap(200)); ch.push(rule()); ch.push(gap(80));
  ch.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,50),
    children:[tr('enquiries@flagstaffe.com  |  01260 460 003  |  www.flagstaffe.com  |  CRN: 14154708  |  VAT: 421442927',{size:17,color:MID})]}));

  return ch;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 2: FULL BID (Wolverhampton format)
// ═══════════════════════════════════════════════════════════════════════════════
function buildFullBid(){
  const ch=[];

  // ── COVER PAGE ───────────────────────────────────────────────────────────────
  // Header bar
  const navyHdr=()=>{
    const cw=[Math.floor(CW*0.55),CW-Math.floor(CW*0.55)];
    return new Table({width:{size:CW,type:WidthType.DXA},columnWidths:cw,rows:[
      new TableRow({children:[
        new TableCell({borders:{top:thk(NAVY),bottom:thk(NAVY),left:thk(NAVY),right:hair(NAVY)},
          shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:200,right:200},
          width:{size:cw[0],type:WidthType.DXA},
          children:[
            new Paragraph({spacing:sp(0,40),children:[tr('Heavitree Road, Exeter',{bold:true,size:28,color:WHITE})]}),
            new Paragraph({spacing:sp(0,20),children:[tr('NCO (Seven) Ltd / Nixon Homes Ltd',{size:20,color:WHITE})]}),
            new Paragraph({spacing:sp(0,0),children:[tr('Flag-HVR-001  |  Rev 0',{size:18,color:AMBER})]}),
          ]}),
        new TableCell({borders:{top:thk(NAVY),bottom:thk(NAVY),left:hair(NAVY),right:thk(NAVY)},
          shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:200,right:200},
          width:{size:cw[1],type:WidthType.DXA},
          children:[
            new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,40),
              children:[tr('FLAGSTAFFE',{bold:true,size:28,color:WHITE,allCaps:true})]}),
            new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),
              children:[tr('FF&E Supply & Installation',{size:18,color:AMBER})]}),
          ]}),
      ]}),
    ]});
  };
  ch.push(navyHdr()); ch.push(gap(80));

  // Project info
  const infoCols=[Math.floor(CW*0.28),Math.floor(CW*0.22),Math.floor(CW*0.28),CW-Math.floor(CW*0.28)-Math.floor(CW*0.22)-Math.floor(CW*0.28)];
  const infoRows=[
    ['Issued to:','[Contact TBC]','Date:','2 June 2026'],
    ['Sales:','Dan Brownsword 07442399616','Estimator:','Jimmy Hogg 07392765933'],
  ];
  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:infoCols,rows:infoRows.map(r=>
    new TableRow({children:r.map((t,i)=>new TableCell({
      borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
      shading:{fill:i%2===0?LIGHT:WHITE,type:ShadingType.CLEAR},
      margins:{top:60,bottom:60,left:120,right:120},
      width:{size:infoCols[i],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),
        children:[tr(t,{bold:i%2===0,color:i%2===0?NAVY:BODY,size:18})]})]}))})
  )})); ch.push(gap(80));

  // Summary table
  const sumCols=[Math.floor(CW*0.30),Math.floor(CW*0.14),Math.floor(CW*0.14),Math.floor(CW*0.14),Math.floor(CW*0.14),CW-Math.floor(CW*0.30)-Math.floor(CW*0.14)*4];
  const mkSumHdr=()=>new TableRow({children:[
    ...[['Summary:',0.30],['Studios',0.14],['',0.14],['',0.14],['',0.14],['',0]].map(([t,w])=>
      new TableCell({borders:{top:hair(NAVY),bottom:hair(NAVY),left:hair(NAVY),right:hair(NAVY)},
        shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:60,bottom:60,left:120,right:120},
        width:{size:Math.floor(CW*(w||1-0.30-0.14*4)),type:WidthType.DXA},
        children:[new Paragraph({spacing:sp(0,0),alignment:t===''?AlignmentType.RIGHT:AlignmentType.LEFT,
          children:[tr(t,{bold:true,color:WHITE,size:18})]})]}))
  ]});
  // Room count row
  const mkSumCount=()=>new TableRow({children:[
    new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
      shading:{fill:LIGHT,type:ShadingType.CLEAR},margins:{top:60,bottom:60,left:120,right:120},
      width:{size:sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr('',{size:17})]})]}),
    new TableCell({columnSpan:5,borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
      shading:{fill:WHITE,type:ShadingType.CLEAR},margins:{top:60,bottom:60,left:120,right:120},
      width:{size:CW-sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[
        tr(`Studios: ${STUDIO}`,{bold:true,size:18}),
        new TextRun({text:'   ACC Studios: ',font:'Arial',bold:true,size:18,color:BODY}),
        new TextRun({text:String(ACC_N),font:'Arial',bold:true,size:18,color:BODY}),
        new TextRun({text:'   Total: ',font:'Arial',bold:true,size:18,color:BODY}),
        new TextRun({text:String(TOTAL),font:'Arial',bold:true,size:18,color:BODY}),
      ]})]})
  ]});

  const sumLines=[
    ['Bedrooms',fmt(BED_T)],['Kitchens',fmt(KIT_T)],
    ['Loose Goods',fmt(LOOSE_T)],['Appliances',fmt(APP_T)],
    ['Project Management Fee',fmt(PM_T)],
  ];
  const sumRows=sumLines.map(([l,v])=>new TableRow({children:[
    new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
      shading:{fill:LIGHT,type:ShadingType.CLEAR},margins:{top:60,bottom:60,left:120,right:120},
      width:{size:sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr(l,{bold:true,size:18,color:NAVY})]})]
    }),
    new TableCell({columnSpan:5,borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
      shading:{fill:WHITE,type:ShadingType.CLEAR},margins:{top:60,bottom:60,left:120,right:120},
      width:{size:CW-sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),children:[tr(v,{size:18})]})]
    }),
  ]}));
  // Sub-total
  sumRows.push(new TableRow({children:[
    new TableCell({borders:{top:thk(NAVY),bottom:hair(NAVY),left:thk(NAVY),right:hair(NAVY)},
      shading:{fill:AMBER_BG,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:120,right:120},
      width:{size:sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr('Sub-total',{bold:true,size:18,color:NAVY})]})]
    }),
    new TableCell({columnSpan:5,borders:{top:thk(NAVY),bottom:hair(NAVY),left:hair(NAVY),right:thk(NAVY)},
      shading:{fill:AMBER_BG,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:120,right:120},
      width:{size:CW-sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),children:[tr(fmt(SUB_T),{bold:true,size:18,color:NAVY})]})]
    }),
  ]}));
  // MCD
  sumRows.push(new TableRow({children:[
    new TableCell({borders:{top:hair(NAVY),bottom:thk(AMBER),left:thk(NAVY),right:hair(NAVY)},
      shading:{fill:AMBER,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:120,right:120},
      width:{size:sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr('2.5% MCD',{bold:true,size:18,color:NAVY})]})]
    }),
    new TableCell({columnSpan:5,borders:{top:hair(NAVY),bottom:thk(AMBER),left:hair(NAVY),right:thk(NAVY)},
      shading:{fill:AMBER,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:120,right:120},
      width:{size:CW-sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),children:[tr('-'+fmt(MCD_T),{bold:true,size:18,color:RED})]})]
    }),
  ]}));
  // Total
  sumRows.push(new TableRow({children:[
    new TableCell({borders:{top:thk(AMBER),bottom:thk(NAVY),left:thk(NAVY),right:hair(NAVY)},
      shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:90,bottom:90,left:120,right:120},
      width:{size:sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr('TOTAL',{bold:true,size:22,color:WHITE})]})]
    }),
    new TableCell({columnSpan:5,borders:{top:thk(AMBER),bottom:thk(NAVY),left:hair(NAVY),right:thk(NAVY)},
      shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:90,bottom:90,left:120,right:120},
      width:{size:CW-sumCols[0],type:WidthType.DXA},
      children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),children:[tr(fmt(GRAND),{bold:true,size:22,color:AMBER})]})]
    }),
  ]}));

  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:sumCols,
    rows:[mkSumHdr(),mkSumCount(),...sumRows]}));
  ch.push(gap(60));
  ch.push(new Paragraph({spacing:sp(0,40),children:[tr('excl. VAT (it is expected that Reverse Charge will apply)',{size:16,italic:true,color:MID})]}));
  ch.push(new Paragraph({spacing:sp(0,20),children:[tr('Inflation built in for commencement on site:',{bold:true,size:17,color:NAVY}),tr('  January 2027',{bold:true,size:17})]}));
  ch.push(new Paragraph({spacing:sp(0,20),children:[tr('Priced for even and continuous delivery over following months:',{bold:true,size:17,color:NAVY}),tr('  8',{bold:true,size:17})]}));
  ch.push(gap(80));

  // T&C clauses (Wolverhampton cover page style)
  const tcl=[
    'Pricing based on following terms being met.',
    'All electrical connections (other than plug-in) by others.',
    'Sink traps excluded at this stage.',
    'Price includes dry fit of sinks and taps; all wet & electrical connections by others.',
    'It is assumed that full articulated lorries will be allowed on site to offload materials.',
    'Skips excluded. Correx to Kitchen worktops only.',
    'It is assumed that vertical assistance for distribution will be provided by the Main Contractor.',
    'Sequencing of works to be agreed to allow sufficient quantities of rooms available for templating, delivery and install each visit.',
    'Flagstaffe\'s proposal is based on the information and drawings provided. Pricing is subject to a final site survey.',
    'Finishes priced - Kronospan Band A',
    'Items noted as RATE ONLY do not form part of this quotation. These rates are for the unit price only and does not allow for delivery, distribution or installation.',
  ];
  for(let i=0;i<tcl.length;i++)
    ch.push(new Paragraph({spacing:sp(0,50),children:[tr(String(i+1),{bold:true,color:NAVY,size:17}),
      tr('\t'+tcl[i],{size:17})]}));
  ch.push(gap(80));
  ch.push(navyHdr());
  ch.push(new Paragraph({spacing:sp(60,0),children:[tr('enquiries@flagstaffe.com  |  01260 460 003  |  www.flagstaffe.com  |  CRN: 14154708  |  VAT: 421442927  |  UTR: 2239413036',{size:15,color:MID})]}));
  ch.push(pb());


  // ── ABOUT FLAGSTAFFE (between cover and revision notes) ──────────────────
  ch.push(pb());
  ch.push(navyHdr()); ch.push(gap(80));
  ch.push(new Paragraph({spacing:sp(0,80),children:[tr('About Flagstaffe',{bold:true,size:26,color:NAVY})]}));
  ch.push(rule()); ch.push(gap(60));

  ch.push(body('Flagstaffe is jointly owned and managed by Dan Brownsword and Kam Krupinski — two FF&E professionals with a long history of achievement in large-scale project delivery. Having worked together for over 20 years in senior management positions at two previous market-leading FF&E businesses, and between them having successfully delivered more than 100,000 rooms, including some of the UK\'s largest and most award-winning FF&E packages, Flagstaffe has the knowledge, expertise and supply chain to oversee the delivery of your project to the highest possible standard.'));
  ch.push(body('We manage the entire FF&E workstream from early design input and specification, through procurement and bespoke manufacturing, to final installation and handover — with a single point of accountability throughout. All projects are fully managed from the design stage through to handover by our talented crew of fitters.'));
  ch.push(gap(100));

  // Stats block
  const sCols2=[Math.floor(CW*0.25),Math.floor(CW*0.25),Math.floor(CW*0.25),CW-Math.floor(CW*0.25)*3];
  const mkStat=(stat,label)=>new TableCell({
    borders:{top:hair(AMBER),bottom:hair(AMBER),left:hair(NAVY),right:hair(NAVY)},
    shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:140,bottom:140,left:180,right:180},
    width:{size:Math.floor(CW*0.25),type:WidthType.DXA},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,50),children:[tr(stat,{bold:true,size:36,color:AMBER})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,0),children:[tr(label,{size:18,color:WHITE})]}),
    ]});
  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:[...Array(4).fill(Math.floor(CW/4))],rows:[
    new TableRow({children:[
      mkStat('100,000+','Rooms delivered'),mkStat('\u00a37M','Turnover FY26'),
      mkStat('93/100','Experian credit'),mkStat('Gold','ConstructionLine'),
    ]})
  ]}));
  ch.push(gap(100));

  // Services
  ch.push(h2('Our Services'));
  ch.push(bul('Design input — early-stage engagement with your design team to incorporate FF&E into the plan, stress-test budget assumptions, and co-ordinate with the wider build programme.'));
  ch.push(bul('Turnkey supply — procurement of bedroom furniture, kitchen units, loose goods, appliances and accessories through our established UK supply chain relationships.'));
  ch.push(bul('Bespoke manufacturing — custom furniture to any size, shape or finish using Kronospan, Egger, Pfleiderer, Swiss Krono and Finsa board materials from our UK manufacturing partners.'));
  ch.push(bul('Installation — CSCS-accredited installation teams, based locally to each site, scaled to your programme.'));
  ch.push(bul('Project co-ordination — we manage the full FF&E workstream so your team does not have to. One contract, one point of accountability, from specification through to snagging and handover.'));
  ch.push(gap(100));

  // Team table
  ch.push(h2('The Team'));
  const teamCols=[Math.floor(CW*0.25),Math.floor(CW*0.25),CW-Math.floor(CW*0.25)*2];
  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:teamCols,rows:[
    new TableRow({children:[
      ...[['Name','Role','Contact / Notes']].flat().map((t,i)=>new TableCell({
        borders:{top:hair(NAVY),bottom:hair(NAVY),left:hair(NAVY),right:hair(NAVY)},
        shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:70,bottom:70,left:140,right:140},
        width:{size:teamCols[i],type:WidthType.DXA},
        children:[new Paragraph({spacing:sp(0,0),children:[tr(t,{bold:true,color:WHITE,size:19})]})]}))
    ]}),
    ...([
      ['Dan Brownsword','Director / Sales','07442399616'],
      ['Kam Krupinski','Director','Co-founder, 20+ years FF&E delivery'],
      ['Jamie Ward','Senior Estimator','Specification and pricing'],
      ['Jimmy Hogg','Junior Estimator','BOQ and bid preparation'],
      ['Danny Collins','Pre-Construction Manager','Programme planning and procurement'],
      ['Rachael Marrow','Head of Contract Coordination','Contract management'],
      ['Steven Green','Contracts Manager','On-site contracts and delivery'],
      ['Joe Barker','Coordinator','Project co-ordination'],
      ['Arsha Devasia','Coordinator','Project co-ordination'],
      ['Lidia Karabanik','Accounts & Finance Manager','Finance and invoicing'],
    ].map((row,i)=>new TableRow({children:row.map((t,ci)=>new TableCell({
      borders:{top:hair('DDDDDD'),bottom:hair('DDDDDD'),left:hair('DDDDDD'),right:hair('DDDDDD')},
      shading:{fill:i%2===0?LIGHT:WHITE,type:ShadingType.CLEAR},
      margins:{top:70,bottom:70,left:140,right:140},
      width:{size:teamCols[ci],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr(t,{bold:ci===0,size:19})]})]}))}))),
  ]}));
  ch.push(gap(100));

  // Accreditations
  ch.push(h2('Accreditations & Quality'));
  ch.push(kv('ConstructionLine','Gold member'));
  ch.push(kv('SafeContractor','Accredited'));
  ch.push(kv('ISO 9001:2015','Registered'));
  ch.push(kv('CSCS','All installation teams CSCS-certified'));
  ch.push(kv('Experian credit score','93/100'));
  ch.push(kv('CRN','14154708  |  VAT: 421442927'));
  ch.push(gap(100));

  // Track record
  ch.push(h2('Track Record'));
  ch.push(kv('Rooms delivered','100,000+ over 20 years, including projects from 50 to 2,000+ rooms'));
  ch.push(kv('Sectors','PBSA, co-living, BTR, multi-room residential'));
  ch.push(kv('Coverage','UK-wide nationwide delivery and installation'));
  ch.push(gap(60));
  ch.push(body('[ADD: 3-4 project references with scheme name, location, scale, and scope]'));
  ch.push(gap(100));

  // Contact
  ch.push(h2('Contact'));
  ch.push(kv('Phone','01260 460 003'));
  ch.push(kv('Email','enquiries@flagstaffe.com'));
  ch.push(kv('Website','www.flagstaffe.com'));
  ch.push(kv('Address','The Granary Business Centre, Hollins Farm, Twemlow Lane, Cranage, CW4 8GE'));


  // ── REVISION NOTES PAGE ──────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(80));
  const revCols=[Math.floor(CW*0.10),CW-Math.floor(CW*0.10)];
  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:revCols,rows:[
    new TableRow({children:[
      new TableCell({borders:{top:hair(NAVY),bottom:hair(NAVY),left:hair(NAVY),right:hair(NAVY)},
        shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:160,right:160},
        width:{size:revCols[0],type:WidthType.DXA},
        children:[new Paragraph({spacing:sp(0,0),children:[tr('Revision',{bold:true,color:WHITE,size:18})]})]}),
      new TableCell({borders:{top:hair(NAVY),bottom:hair(NAVY),left:hair(NAVY),right:hair(NAVY)},
        shading:{fill:NAVY,type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:160,right:160},
        width:{size:revCols[1],type:WidthType.DXA},
        children:[new Paragraph({spacing:sp(0,0),children:[tr('Notes',{bold:true,color:WHITE,size:18})]})]}),
    ]}),
    new TableRow({children:[
      new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
        shading:{fill:LIGHT,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},
        width:{size:revCols[0],type:WidthType.DXA},
        children:[new Paragraph({spacing:sp(0,0),children:[tr('0',{bold:true,size:18,color:NAVY})]})]}),
      new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair('EEEEEE')},
        shading:{fill:WHITE,type:ShadingType.CLEAR},margins:{top:120,bottom:120,left:160,right:160},
        width:{size:revCols[1],type:WidthType.DXA},
        children:[
          new Paragraph({spacing:sp(0,60),children:[tr('This is a budget quotation based on the following assumptions in the absence of drawings or confirmed specification.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Priced as 813 self-contained studios: 770 standard studios + 43 DDA/accessible studios.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Both PBSA and co-living units assumed to identical studio specification.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- No cluster kitchens (KLDs). All kitchens are individual studio kitchens.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- DDA/accessible count assumed at 5% (43 units). Adjust when Building Regs drawings confirm exact count.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Specification: Kronospan Band A, 18mm carcass, Metabox soft-close drawers, 155° hinges, Discreet Handle.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Appliances: Montpellier range throughout. Other options available.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Sinks/taps: Blanco (DINAS 45S MINI + MILA ECO) priced to align with previous projects.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Loose goods: mattresses, desk chairs, pedestal tables, bins and accessories.',{size:17})]}),
          new Paragraph({spacing:sp(0,50),children:[tr('- Inflation: priced for January 2027 commencement. Rates will be reviewed if programme changes.',{size:17})]}),
          new Paragraph({spacing:sp(0,0),children:[tr('- This quote is based on the standard studio format from Flag22167 (Stafford Street, Wolverhampton, April 2026). Confirmation of room dimensions and layouts required before final quotation.',{size:17})]}),
        ]}),
    ]}),
  ]}));
  ch.push(pb());

  // ── BEDROOMS SHEET ───────────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(60));
  ch.push(new Paragraph({spacing:sp(0,60),children:[tr(`Finishes: Kronospan Band A  |  18mm carcass  |  Metabox soft close drawers  |  155\u00b0 soft close hinges  |  Discreet Handle`,{size:16,italic:true,color:MID})]}));
  ch.push(gap(40));
  const {table:bedTable,total:bedRunning}=buildLineTable(BEDROOM_ITEMS,STUDIO,ACC_N);
  ch.push(bedTable);
  ch.push(pb());

  // ── KITCHENS SHEET ───────────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(60));
  ch.push(new Paragraph({spacing:sp(0,60),children:[tr(`Finishes: Kronospan Band A  |  18mm carcass  |  Metabox soft close drawers  |  155\u00b0 soft close hinges  |  Discreet to base units, overhang to wall units`,{size:16,italic:true,color:MID})]}));
  ch.push(gap(40));
  const {table:kitTable,total:kitRunning}=buildLineTable(KITCHEN_ITEMS,STUDIO,ACC_N);
  ch.push(kitTable);
  ch.push(pb());

  // ── APPLIANCES SHEET ─────────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(60));
  ch.push(new Paragraph({spacing:sp(0,60),children:[tr('Appliances: Montpellier range  |  Model numbers shown  |  Other options available on request',{size:16,italic:true,color:MID})]}));
  ch.push(gap(40));
  const {table:appTable,total:appRunning}=buildLineTable(APPLIANCE_ITEMS,STUDIO,ACC_N);
  ch.push(appTable);
  ch.push(pb());

  // ── LOOSE GOODS SHEET ────────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(60));
  ch.push(new Paragraph({spacing:sp(0,60),children:[tr('Loose goods: mattresses, desk chairs, dining furniture, bins, accessories — per studio',{size:16,italic:true,color:MID})]}));
  ch.push(gap(40));
  const {table:looseTable,total:looseRunning}=buildLineTable(LOOSE_ITEMS,STUDIO,ACC_N);
  ch.push(looseTable);
  ch.push(pb());

  // ── ROOM SPLITS / VERIFICATION PAGE ─────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(80));
  ch.push(new Paragraph({spacing:sp(0,60),children:[tr('Flagstaffe Room Splits — Verification',{bold:true,size:22,color:NAVY})]}));

  const rsCols=[Math.floor(CW*0.18),Math.floor(CW*0.12),Math.floor(CW*0.12),Math.floor(CW*0.12),Math.floor(CW*0.12),Math.floor(CW*0.12),Math.floor(CW*0.12),CW-Math.floor(CW*0.18)-Math.floor(CW*0.12)*6];
  const rsHdr=['Room Type','Total per Room','Bedrooms','Kitchen','Loose','Appliances','Qty','Grand Total'];
  const rsData=[
    ['Standard Studio',fmt(S_TOTAL),fmt(S_BED),fmt(S_KIT),fmt(S_LOOSE),fmt(S_APP),fmtI(STUDIO),fmt(STUDIO*S_TOTAL)],
    ['Studio ACC',fmt(A_TOTAL),fmt(A_BED),fmt(A_KIT),fmt(A_LOOSE),fmt(A_APP),fmtI(ACC_N),fmt(ACC_N*A_TOTAL)],
  ];
  const rsTotRow=['PM Fee','','','','','',fmtI(TOTAL)+' units',fmt(PM_T)];
  const mkRsCell=(t,w,o={})=>new TableCell({
    borders:{top:hair(o.head?NAVY:'DDDDDD'),bottom:hair(o.head?NAVY:'DDDDDD'),left:hair(o.head?NAVY:'DDDDDD'),right:hair(o.head?NAVY:'DDDDDD')},
    shading:{fill:o.head?NAVY:(o.total?AMBER:WHITE),type:ShadingType.CLEAR},
    margins:{top:70,bottom:70,left:120,right:120},width:{size:w,type:WidthType.DXA},
    children:[new Paragraph({spacing:sp(0,0),alignment:AlignmentType.RIGHT,
      children:[tr(t,{bold:!!o.head||!!o.total,color:o.head?WHITE:NAVY,size:17})]})]});

  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:rsCols,rows:[
    new TableRow({children:rsHdr.map((t,i)=>mkRsCell(t,rsCols[i],{head:true}))}),
    ...rsData.map(row=>new TableRow({children:row.map((t,i)=>mkRsCell(t,rsCols[i]))})),
    new TableRow({children:rsTotRow.map((t,i)=>mkRsCell(t,rsCols[i],{total:true}))}),
  ]}));

  ch.push(gap(60));
  // Grand total verification
  const verCols=[Math.floor(CW*0.55),CW-Math.floor(CW*0.55)];
  const mkVR=(l,v,o={})=>new TableRow({children:[
    new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair(NAVY),right:hair('EEEEEE')},
      shading:{fill:o.amber?AMBER:(o.red?'FFE8E8':LIGHT),type:ShadingType.CLEAR},
      margins:{top:70,bottom:70,left:160,right:160},width:{size:verCols[0],type:WidthType.DXA},
      children:[new Paragraph({spacing:sp(0,0),children:[tr(l,{bold:true,size:18,color:NAVY})]})]
    }),
    new TableCell({borders:{top:hair('EEEEEE'),bottom:hair('EEEEEE'),left:hair('EEEEEE'),right:hair(NAVY)},
      shading:{fill:o.amber?AMBER:(o.red?'FFE8E8':WHITE),type:ShadingType.CLEAR},
      margins:{top:70,bottom:70,left:160,right:160},width:{size:verCols[1],type:WidthType.DXA},
      children:[new Paragraph({alignment:AlignmentType.RIGHT,spacing:sp(0,0),
        children:[tr(v,{bold:!!o.amber,size:18,color:o.red?RED:NAVY})]})]
    }),
  ]});
  ch.push(new Table({width:{size:CW,type:WidthType.DXA},columnWidths:verCols,rows:[
    mkVR('Room totals (excl. PM)',fmt(STUDIO*S_TOTAL+ACC_N*A_TOTAL)),
    mkVR('Project Management Fee',fmt(PM_T)),
    mkVR('Sub-total',fmt(SUB_T),{amber:true}),
    mkVR('2.5% MCD Discount','-'+fmt(MCD_T),{red:true}),
    mkVR('TOTAL',fmt(GRAND),{amber:true}),
    mkVR('Should show zero — verification check',fmt(0.00)),
  ]}));

  ch.push(gap(100));
  ch.push(new Paragraph({spacing:sp(0,40),children:[tr('All splits do not include MCD',{size:15,italic:true,color:MID})]}));
  ch.push(pb());

  // ── T&Cs PAGE ────────────────────────────────────────────────────────────────
  ch.push(navyHdr()); ch.push(gap(80));
  ch.push(new Paragraph({spacing:sp(0,80),children:[tr('TERMS AND CONDITIONS',{bold:true,size:22,color:NAVY})]}));

  const tcs=[
    ['Contract',''],
    ['1','Pricing excludes VAT, if applicable.'],
    ['2','The quotation is valid for 60 days for the items listed out, quantified and included in the total; anything not mentioned or not included in the total is to be deemed excluded.'],
    ['3','Models and specification of products quoted may be changed by manufacturers in the course of the project. Flagstaffe Ltd reserves the right to amend the offer accordingly and propose current alternatives.'],
    ['4','The quotation is based on the DDA requirements as shown on the drawings/specification document. Flagstaffe Ltd takes no responsibility for compliance with DDA regulations and any agreements made with Client on this specific project.'],
    ['5','The quotation is based on the whole order being placed with Flagstaffe Ltd. Changes to scope may affect pricing.'],
    ['Delivery',''],
    ['1','Skips are excluded (to be provided by Main Contractor); Flagstaffe Ltd will segregate waste as directed by the Main Contractor.'],
    ['2','Horizontal distribution is included; vertical distribution is excluded. Main contractor to provide vertical distribution assistance (for instance, goods hoist or forklift and driver).'],
    ['3','Safe access for distribution of materials will be required, with no materials of others impeding access through stairways or corridors or bedrooms/kitchens themselves.'],
    ['4','Quotation is based on available access for articulated lorries, with off-load within 25 metres of vertical distribution point.'],
    ['5','Minor damage to rooms during distribution and installation, due to the bulky nature of the materials, is to be expected. No contra charges for repairs will be accepted unless there is evident malicious damage or lack of care on the part of Flagstaffe\'s operatives.'],
    ['6','It is recommended that final decorations are carried out after FF&E distribution and installation.'],
    ['7','Builder\'s clean included; sparkle clean excluded.'],
    ['8','All furniture is to be installed in suitable conditions to prevent damage. This includes no standing or dripping water, dry walls, temperature between 10 and 30 degrees and relative humidity of 35 to 65 percent.'],
    ['9','Unless specifically stated and priced, scribing to uneven floors or walls is not included.'],
    ['Design',''],
    ['1','Flagstaffe Ltd will provide detailed drawings for each room type. Design responsibility remains with principal designer. Explicit sign-off will be required before bulk manufacturing.'],
    ['2','Flagstaffe Ltd will provide advice, but will take no responsibility for compliance with local HMO regulations.'],
    ['3','Flagstaffe Ltd will seal any cut-outs in worktops in kitchens (for instance for sink or hob); All other mastic or caulking is not included.'],
    ['4','Flagstaffe Ltd do not offer wet connections; dry fit included only.'],
    ['5','Sink traps excluded; waste outlet included only.'],
    ['6','Taps include tails, connected to the tap by FF&E installers.'],
    ['7','Any commissioning of electrical or wet connections excluded.'],
    ['8','Flagstaffe Ltd do not offer electrical connections (other than plugging in, if priced).'],
    ['9','If appliances do not come with flexes, they are to be provided and fixed by the M&E contractor.'],
    ['10','Flagstaffe Ltd will take no responsibility for compliance with Fire Regulations.'],
    ['11','If Fire Equipment is provided, any commissioning is excluded.'],
  ];

  let lastSection='';
  for(const [num,text] of tcs){
    if(!text){
      ch.push(new Paragraph({spacing:sp(120,40),children:[tr(num,{bold:true,size:19,color:NAVY})]}));
    } else {
      ch.push(new Paragraph({spacing:sp(0,50),
        tabStops:[{type:TabStopType.LEFT,position:400}],
        children:[tr(num,{bold:true,size:17,color:NAVY}),new TextRun({text:'\t',font:'Arial'}),tr(text,{size:17})]}));
    }
  }

  ch.push(gap(160)); ch.push(navyHdr());
  ch.push(new Paragraph({spacing:sp(60,0),children:[tr('enquiries@flagstaffe.com  |  01260 460 003  |  www.flagstaffe.com  |  CRN: 14154708  |  VAT: 421442927  |  UTR: 2239413036',{size:15,color:MID})]}));

  return ch;
}

// ── Generate both documents ───────────────────────────────────────────────────
async function generate(){
  const numCfg={config:[{reference:'bullets',levels:[{level:0,format:LevelFormat.BULLET,text:'\u2022',
    alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:600,hanging:300}}}}]}]};
  const styles={default:{document:{run:{font:'Arial',size:20,color:BODY}}},
    paragraphStyles:[
      {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{size:28,bold:true,font:'Arial',color:NAVY},paragraph:{spacing:{before:300,after:120},outlineLevel:0}},
      {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,
        run:{size:22,bold:true,font:'Arial',color:NAVY},paragraph:{spacing:{before:200,after:60},outlineLevel:1}},
    ]};
  const pgProps={page:{size:{width:PAGE_W,height:PAGE_H},margin:{top:MARGIN,right:MARGIN,bottom:MARGIN,left:MARGIN}}};

  // Indicative bid
  const docInd=new Document({numbering:numCfg,styles,
    sections:[{properties:pgProps,children:buildIndicativeBid()}]});
  const OUTIND='/mnt/user-data/outputs/Flag-HVR-IND-001_Heavitree_Indicative.docx';
  const bufInd=await Packer.toBuffer(docInd);
  fs.writeFileSync(OUTIND,bufInd);
  const TMPIND='/home/claude/hvr_ind_tmp';
  execSync(`rm -rf ${TMPIND} && python3 /mnt/skills/public/docx/scripts/office/unpack.py ${OUTIND} ${TMPIND}`);
  let xmlInd=fs.readFileSync(`${TMPIND}/word/document.xml`,'utf8');
  xmlInd=xmlInd.replace(/<w:pBdr>[\s\S]*?<\/w:pBdr>/g,m=>{
    const g=t=>{const x=m.match(new RegExp(`<w:${t}[^/]*/>`));return x?x[0]:''};
    return ['<w:pBdr>',g('top')&&'          '+g('top'),g('left')&&'          '+g('left'),
      g('bottom')&&'          '+g('bottom'),g('right')&&'          '+g('right'),
      '        </w:pBdr>'].filter(Boolean).join('\n');
  });
  fs.writeFileSync(`${TMPIND}/word/document.xml`,xmlInd);
  execSync(`python3 /mnt/skills/public/docx/scripts/office/pack.py ${TMPIND} ${OUTIND} --original ${OUTIND}`);
  console.log('Indicative bid: done');

  // Full bid
  const docFull=new Document({numbering:numCfg,styles,
    sections:[{properties:pgProps,children:buildFullBid()}]});
  const OUTFULL='/mnt/user-data/outputs/Flag-HVR-001_Heavitree_Full_Bid.docx';
  const bufFull=await Packer.toBuffer(docFull);
  fs.writeFileSync(OUTFULL,bufFull);
  const TMPFULL='/home/claude/hvr_full_tmp';
  execSync(`rm -rf ${TMPFULL} && python3 /mnt/skills/public/docx/scripts/office/unpack.py ${OUTFULL} ${TMPFULL}`);
  let xmlFull=fs.readFileSync(`${TMPFULL}/word/document.xml`,'utf8');
  xmlFull=xmlFull.replace(/<w:pBdr>[\s\S]*?<\/w:pBdr>/g,m=>{
    const g=t=>{const x=m.match(new RegExp(`<w:${t}[^/]*/>`));return x?x[0]:''};
    return ['<w:pBdr>',g('top')&&'          '+g('top'),g('left')&&'          '+g('left'),
      g('bottom')&&'          '+g('bottom'),g('right')&&'          '+g('right'),
      '        </w:pBdr>'].filter(Boolean).join('\n');
  });
  fs.writeFileSync(`${TMPFULL}/word/document.xml`,xmlFull);
  execSync(`python3 /mnt/skills/public/docx/scripts/office/pack.py ${TMPFULL} ${OUTFULL} --original ${OUTFULL}`);
  console.log('Full bid: done');
}
generate().catch(console.error);
