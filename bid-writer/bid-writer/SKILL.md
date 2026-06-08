---
name: bid-writer
description: >
  Produce a Word (.docx) bid document for Flagstaffe — an FF&E supply and installation
  specialist targeting PBSA and co-living planning applications. Triggers when the user asks
  to "write a bid", "draft a pitch", "create a proposal", "prepare bid documents", or
  "generate a bid" for a planning application. Also triggers when the user passes classifier
  output from the planning-classifier skill and wants to take it further. Input can be a
  classifier analysis, a planning application URL, or a reference number — if a URL or
  reference is supplied without prior classifier output, run the planning-classifier skill
  first. Output is always a downloadable .docx file the user can edit before sending.
---

# Bid Writer — Flagstaffe FF&E

Produces a professional, tailored bid document in Word (.docx) for Flagstaffe, positioning
them as the FF&E supply and installation partner of choice for PBSA and co-living schemes.

Flagstaffe is NOT an interior design practice. They are an end-to-end FF&E specialist —
they get involved at design stage to provide input, then manage procurement, manufacturing,
and installation. All bid language must reflect this: the value proposition is programme
certainty, budget reliability, specification expertise, and quality installation — not
creative design.

---

## Step 1 — Gather application details

You need the following before writing anything:

- Application reference, address, LPA
- Classification (PBSA or co-living)
- Scale: number of beds/units/storeys
- Amenity spaces mentioned
- Applicant and agent names
- Stage (pre-app, submitted, under consultation, decided)
- Any known operator

**If the user has provided classifier output**, extract these fields from it directly.
**If the user has provided a URL or reference number**, run the planning-classifier skill first.
**If the application was classified as Not Relevant**, do not produce a bid. Explain clearly.

---

## Step 2 — Load firm profile

Read `references/firm-profile.md`. This contains Flagstaffe's real credentials, project
references, team bios, and fee structure.

For any field not yet populated (marked with [ADD ...]):
- Use the placeholder format `[ADD: description]` so the user can find it easily in Word
- Add a comment at the start of the document listing all incomplete fields

---

## Step 3 — Write the bid

### Document structure

1. **Cover page** — Application address, "Flagstaffe", date, "Prepared for: [Applicant]"
2. **Cover letter** — 1 page. Warm, direct, confident. Why Flagstaffe is writing, what they
   bring specifically to this scheme, clear call to action.
3. **About Flagstaffe** — 1–2 pages. Who they are. Key stats (50,000+ rooms, 50–3,000+
   room projects, nationwide, ConstructionLine Gold, SafeContractor). The Six Cs.
4. **Our services** — Half to 1 page. Concise overview of the end-to-end service: design
   input, turnkey supply, bespoke manufacturing, installation. Tailored to what's most
   relevant to this scheme.
5. **Relevant past projects** — 2–3 projects from firm-profile.md. Match to scheme type.
6. **Proposed approach** — 1–2 pages. How Flagstaffe would approach this specific scheme.
   Reference the application details — scale, format, amenity spaces, programme stage.
   Show awareness of the pressures (programme, budget, spec) the applicant will face.
7. **Why Flagstaffe for this scheme** — Half page. Connect Flagstaffe's specific strengths
   to the opportunities and challenges in this application.
8. **Testimonials** — 2–3 quotes from firm-profile.md.
9. **Team** — Dan Brownsword and Kam Krupinski bios from firm-profile.md.
10. **Timeline** — Table anchored to the application's current stage.
11. **Next steps** — Clear close. Who to contact, how, what the proposed next step is.

---

## Step 4 — Tailor the content

Every bid must feel specific. Always:

- Name the development address and planning reference in the cover letter
- Reference scale (e.g. "a 287-bed PBSA scheme of this size")
- Mention specific spaces from the application (communal kitchens, cluster flats, studios,
  gym, co-working etc.) and connect Flagstaffe's scope to them
- Name the applicant or operator if known
- Adjust emphasis based on operator type:
  - Known PBSA operator → emphasise programme reliability, spec delivery, scale experience
  - Unknown / SPV developer → emphasise early engagement value, budget stress-testing,
    removing risk
  - Co-living operator → emphasise communal space quality, bespoke manufacturing, brand fit
- Reflect the application stage:
  - Pre-application → emphasise early design input, budget planning, programme benefit
  - Post-submission → emphasise readiness to mobilise post-consent, procurement lead times,
    no-delay installation

### Flagstaffe-specific positioning points to weave in

- 50,000+ rooms delivered nationally
- Projects from 50 to 3,000+ rooms — experience at any scale
- Early involvement reduces cost and risk — stress-test budgets, catch specification issues
- Private company: manage workload to deliver quality, not to hit volume targets
- Programme certainty: the end date doesn't change
- CSCS-accredited fitters, locally based to site
- ConstructionLine Gold and SafeContractor — de-risks supply chain approval
- Bespoke manufacturing capability: any size, shape, material, finish
- Legacy supply chain relationships built over decades

---

## Step 5 — Generate the .docx file

Use the docx npm package. Follow all rules in the docx SKILL.md:

- Page size: A4 (11906 × 16838 DXA), margins 1440 DXA (1 inch) all sides
- Font: Arial throughout. Body 11pt (size: 22), headings scaled appropriately
- Use `LevelFormat.BULLET` for all bullet lists — never unicode bullets
- Tables: always set both `columnWidths` and cell `width` in DXA; use `ShadingType.CLEAR`
- Never use `\n` — use separate Paragraph elements
- PageBreak must always be inside a Paragraph
- Heading styles: exact IDs "Heading1", "Heading2" with `outlineLevel` set
- Paragraph border order in `w:pBdr` MUST be: top, left, bottom, right (not top, bottom,
  left, right). After generating, unpack the XML and fix the border order if needed using
  the regex approach before packing and validating.

### Colour palette (Flagstaffe brand)

- Primary: `1A1A2E` (deep navy — headings, cover page)
- Accent: `E8C547` (warm amber/gold — dividers, highlights, cover accent)
- Body text: `333333`
- Light background: `F7F5F0`
- White: `FFFFFF`
- Mid grey: `7F8C8D`

### Save location

`/mnt/user-data/outputs/bid-[application-reference].docx`
e.g. `bid-2025-2847-P.docx`

Then call `present_files`.

---

## Placeholder format

Use `[ADD: description of what's needed]` for any unpopulated firm-profile fields.
At the top of the cover letter, include an italic note:
*"Note: Fields marked [ADD: ...] need completing before this bid is sent."*
Remove the note once all fields are populated.

---

## Reference files

- `references/firm-profile.md` — Flagstaffe's credentials, projects, team, rates
- `references/bid-template.md` — section writing guidance and example language for Flagstaffe

---

## Step 6 — Include indicative pricing (when requested)

When the user asks for a bid that includes pricing, or when writing an internal pricing document:

### Unit rates source
Use rates from `references/firm-profile.md` under "Pricing structure". These are from Flag22167 (Stafford Street, Wolverhampton, April 2026, Kronospan Band A, inflation to Jan-27).

### Pricing calculation
1. Multiply room counts by unit rates for each room type
2. Sum clusters, studios, premier studios, ACC studios, and KLDs
3. Add PM fee: £65 × (total beds + total KLDs)
4. Calculate MCD discount: 2.5% × sub-total (including PM fee)
5. Grand total = sub-total − MCD discount

### Key notes for bids with pricing
- **Always mark as indicative** if room type splits have not been confirmed from drawings
- **State the rate source** clearly: "Based on Flag22167, Stafford Street, Wolverhampton (April 2026, Kronospan Band A)"
- **State the inflation basis**: rates include inflation to [start date] — ask user for programme start date
- **Exclude amenity spaces** from the unit rate calculation — gym, lounge, common room FF&E requires separate specification
- **Adjust prelim rates** for location: London lorries £3,200, Midlands/North £3,300, Scotland £3,800

### For internal pricing Excel
Use the `Flagstaffe_Manchester_Pricing_Tool.xlsx` template structure as reference:
- Summary sheet: scheme names, bed/KLD counts, indicative totals
- Per-scheme sheets: room type inputs (blue cells), unit rates from firm-profile, calculated totals
- Unit Rates sheet: pre-loaded from firm-profile.md, user-adjustable

### When NOT to include pricing
- Do not include pricing in external bid documents without Dan or Kam confirming the room type split
- Always include the indicative warning caveat on any document containing estimated costs

---

## Pricing template (Excel)

Reference file: `Flagstaffe_Pricing_Template.xlsx`

The pricing template contains 7 sheets:

| Sheet | Purpose |
|---|---|
| **SETUP** | Enter project name, client, room counts, location, start date, spec level |
| **SUMMARY** | Auto-generated quote output — pulls from all detail sheets |
| **BEDROOMS** | All bedroom furniture line items with unit costs and per-room quantities |
| **KITCHENS** | All kitchen/KLD line items by room type |
| **APPLIANCES** | All appliance line items (Montpellier range) |
| **LOOSE** | All loose goods, bins, accessories, brown goods |
| **PRELIMS** | PM fee and logistics cost calculator |

**How to use for a new project:**
1. Open `Flagstaffe_Pricing_Template.xlsx`
2. Go to SETUP tab — fill in project name, client, room counts (blue cells), location, start date
3. All other sheets recalculate automatically
4. Review SUMMARY tab for the quote output
5. Adjust any blue input cells in the detail sheets if spec differs from Wolverhampton Band A

**Rate basis:** Flag22167, Stafford Street Wolverhampton, April 2026, Kronospan Band A, inflation to Jan-27. Adjust inflation factor in SETUP for later starts.

## Company profile (Word)

Reference file: `Flagstaffe_Company_Profile.docx`

The company profile document contains all supporting information for bids:
- About Flagstaffe (founding story, 100,000 rooms, 20 years)
- Key statistics (turnover, Experian, accreditations)
- Services overview (design input, supply, manufacturing, installation)
- What we supply (full product/scope list)
- Full team table (all 10 named staff with roles)
- Contact details

**How to use in bids:**
- Copy sections from `Flagstaffe_Company_Profile.docx` into any bid document
- The "About Flagstaffe", "Our Services", and "The Team" sections are ready to paste directly
- Update the `[ADD: project references]` placeholder in Track Record with live project details


---

## Step 7 — Generate a complete client-ready BOQ

The file `references/line-item-rates.md` contains all 110 line items from Flag22167 (Stafford Street, Wolverhampton, April 2026) with verified unit rates and per-room quantities.

### Structure of the reference file

Four sections: **BEDROOMS** (33 items) | **KITCHENS** (37 items) | **APPLIANCES** (11 items) | **LOOSE GOODS** (29 items)

Each row: `Code | Description | Spec | Supplier | Model | Rate (£) | C | S | P | A | K4 | K5 | K6 | K7 | K8 | K9`

Where `C=Cluster, S=Studio, P=Premier, A=Studio ACC, K4-K9=KLD size`

The qty/room column shows how many of that item each room type receives (blank = not applicable).

### How to generate a complete BOQ for a bid document

1. Read the room counts from the scheme (cluster beds, studios, KLD sizes)
2. For each line item in the reference: `Rate x qty/room x room_count = line sub-total`
3. Group into Bedrooms / Kitchens / Appliances / Loose Goods totals
4. Add PM fee: `£68.43 x (total_beds + total_KLDs)`
5. MCD discount: `sub-total x 0.025`
6. Grand total: `sub-total - MCD discount`

**Critical:** For the final totals, always reconcile to the verified per-room rates at the bottom of the reference file. The line items show scope; the per-room rates set the price.

### What a complete Flagstaffe-format bid document contains

1. **Cover page** — project name, reference, client, date, room summary, totals
2. **Bedrooms sheet** — all bedroom line items with qty per room type and sub-totals
3. **Kitchens sheet** — all kitchen/KLD line items
4. **Appliances sheet** — all appliance line items with model numbers
5. **Loose Goods sheet** — all loose goods items
6. **Summary sheet** — Bedrooms/Kitchens/Loose/Appliances totals, PM fee, MCD, Grand Total
7. **Revision notes** — what changed from previous revisions
8. **T&Cs** — standard Flagstaffe terms and conditions (from firm-profile.md)

### Key room type rules (from the reference file)

- **Studios do NOT have ovens** — only KLDs have ovens (MCH29T15 2-ring hob instead)
- **Studios get undercounter integrated fridge** (MBUR115E), not a 4x4 FF
- **Premier gets 70/30 integrated FF** (MIFF730FF)
- **ACC gets undercounter freestanding fridge** (MDAUCIB54W) — freestanding for accessibility
- **KLDs get 4x4 freestanding FF** (MDANF181W) — shared between cluster residents
- **ACC has no carcass sink unit** — the DDA Adjustable Height Mechanism replaces the sink base
- **Open Boxed Shelving above sink** — KLDs only, not studios
- **Drawers 600mm** — KLDs only, not studios or ACC
- **Dining chairs** — KLD4 gets 4 chairs; KLD5/KLD6 get 0 chairs (dining benches only); KLD7=1, KLD8=2, KLD9=3 plus benches


---

## Full bid output: two files always

When generating a **full bid** (as opposed to an indicative/summary bid), always produce **two files**:

### File 1: Excel workbook (Flag-[REF]-[PROJECT]_Full_Bid.xlsx)

7 sheets, mirroring the Wolverhampton Flag22167 Excel format:

| Sheet | Contents |
|---|---|
| **SUMMARY** | Project info, room counts, category totals (Bedrooms/Kitchens/Loose/Appliances/PM/MCD/Total) |
| **BEDROOMS** | All bedroom line items: desks, beds, wardrobes, mirrors, pinboards, installation — with Studio and ACC (or all applicable room types) columns showing qty × rate × room count |
| **KITCHENS** | All kitchen line items: wall/base/tall units, worktops, splashbacks, infills, sinks, installation |
| **APPLIANCES** | All appliance line items with Montpellier model numbers |
| **LOOSE** | All loose goods: mattresses, chairs, dining furniture, bins, accessories, distribution |
| **ROOM SPLITS** | Per-room total verification table — room type totals × counts + PM fee − MCD = grand total, with a verification row that should show £0.00 |
| **T&Cs** | Full Flagstaffe standard terms and conditions (Contract, Delivery, Design sections) |

Column structure for BEDROOMS/KITCHENS/APPLIANCES/LOOSE:
`Code | Description | Spec | Supplier | Model | Rate(£) | [Room Type] qty | [Room Type] sub-total | ... | TOTAL(£)`

Only include room type columns that appear in the scheme (e.g. a studio-only scheme has Studio and ACC columns only; a cluster scheme adds Cluster and KLD columns).

Use Flagstaffe navy (#1A1A2E) section headers and amber (#E8C547) total rows. Section names (DESKS, BEDS, WARDROBES, etc.) appear as amber-background rows within each sheet.

### File 2: Word document (Flag-[REF]-[PROJECT]_Full_Bid.docx)

Structured to match the Wolverhampton PDF format, with Flagstaffe company profile added:

1. **Cover page** — Flagstaffe/project header bar, project info block, summary cost table (Bedrooms/Kitchens/Loose/Appliances/PM/MCD/TOTAL), numbered T&C clauses (1-11 as per Wolverhampton), inflation/programme statement, footer
2. **About Flagstaffe** — company narrative (Dan & Kam, 100,000 rooms, 20 years), stats block (£7M FY26, 93/100 Experian, ConstructionLine Gold), services bullet list, team table (all 10 named staff), accreditations, track record (with [ADD: project references] if not yet populated), contact details
3. **Revision notes** — Rev 0/1/etc. table explaining all pricing assumptions and basis of estimate
4. **BEDROOMS** — full line-item table matching the Excel BEDROOMS sheet
5. **KITCHENS** — full line-item table matching the Excel KITCHENS sheet
6. **APPLIANCES** — full line-item table matching the Excel APPLIANCES sheet
7. **LOOSE GOODS** — full line-item table matching the Excel LOOSE sheet
8. **Room splits verification** — per-room totals table with grand total reconciliation
9. **Full T&Cs** — complete Flagstaffe standard terms (Contract, Delivery, Design)

### Naming convention
- Excel: `Flag-[XXX]-[ProjectName]_Full_Bid.xlsx` e.g. `Flag-HVR-001_Heavitree_Full_Bid.xlsx`
- Word: `Flag-[XXX]-[ProjectName]_Full_Bid.docx` e.g. `Flag-HVR-001_Heavitree_Full_Bid.docx`
- Indicative (summary only): `Flag-[XXX]-[ProjectName]_Indicative.docx`

### Indicative bid (summary only)
When asked for an **indicative bid**, produce a single Word document only:
- Cover page
- Project details
- Cover letter
- Summary cost table (per-room rates × room counts)
- Room split assumptions
- Proposed next steps
- Key T&C clauses

The indicative bid does NOT include the line-item detail sheets or the full company profile.

