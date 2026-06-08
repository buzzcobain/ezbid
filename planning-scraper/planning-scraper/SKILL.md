---
name: planning-scraper
description: >
  Find new PBSA and co-living planning applications across UK councils and automatically
  classify each one for Flagstaffe. Triggers when the user asks to "find new planning
  applications", "scan planning portals", "check for new student accommodation applications",
  "run the scraper", "find opportunities this week", or any request to discover and assess
  planning applications in bulk. Supports running at any level: nationwide, region (e.g.
  "North West"), county (e.g. "Lancashire"), city/town (e.g. "Leeds"), or specific council
  (e.g. "Leeds City Council"). Covers all 366 UK local planning authorities across England,
  Scotland, Wales, and Northern Ireland, organised by PBSA demand, university presence,
  population, and portal type. Chains directly into the planning-classifier skill for each
  result. Outputs a prioritised shortlist.
---

# Planning Scraper — Flagstaffe

Discovers new PBSA and co-living planning applications across the UK. Runs as a pipeline:
find applications → classify each one → output a prioritised shortlist with bid option.

---

## Scope and filtering

The portal directory (`references/portal-directory.yaml`) contains **366 UK LPAs** with the
following metadata fields for filtering:

| Field | Values | Use to filter by |
|---|---|---|
| `region` | Greater London, South East, South West, East of England, East Midlands, West Midlands, Yorkshire and the Humber, North West, North East, Scotland, Wales, Northern Ireland | English region, devolved nation |
| `county` | e.g. West Yorkshire, Lancashire, Kent | County or sub-region |
| `name` | LPA name | Specific council |
| `pbsa_demand` | H (high), M (medium), L (low), N (none) | Universities / student population |
| `pop_band` | major_city, large_town, medium_town, small_town, district | Settlement size |
| `universities` | list of HEIs within or near the LPA | University proximity |
| `portal_type` | idox, northgate, necsws, arcus_be, eplanning_scot, ni_portal, custom | Search method |
| `tier` | 1 (direct fetch), 2 (web search), 3 (Chrome) | Technical approach |
| `robots_block` | true/false | Whether robots.txt blocks direct fetch |

**Interpreting PBSA demand:**
- **H (high):** Major university presence (20,000+ students) or multiple HEIs — strong pipeline
- **M (medium):** University present (5,000–20,000 students) or significant young professional BTR market
- **L (low):** Smaller university nearby or no university but urban — monitor only
- **N (none):** Rural, national park, or no relevant demand — skip

---

## Understanding the user's scope request

Before searching, identify the scope:

| User says | Action |
|---|---|
| "run the weekly scrape" / "nationwide" | All H-demand LPAs + selected M-demand by region |
| "scrape London" / "London this week" | All London LPAs, H+M demand |
| "check Manchester" | Manchester + Greater Manchester LPAs |
| "university towns in the North West" | Filter: region=North West AND pbsa_demand=H OR M |
| "smaller university towns" | Filter: pbsa_demand=M AND pop_band=medium_town OR large_town |
| "Scotland" | Filter: region=Scotland |
| "Leeds and Sheffield" | Filter: name contains Leeds OR Sheffield |
| "run all H-demand councils" | All LPAs where pbsa_demand=H |

**Default scope (no specification given):** all H-demand LPAs, ordered by region.

---

## H-demand LPA shortlist (58 councils — run these first)

Quick reference for the most productive portals:

**Greater London (16):** Camden, City of London, Hammersmith & Fulham, Islington,
Kensington & Chelsea, Lambeth, Lewisham, Newham, Southwark, Tower Hamlets, Westminster,
Greenwich, Hackney, Brent, Ealing, Wandsworth

**South East (5):** Brighton & Hove, Canterbury, Guildford, Portsmouth, Southampton

**South West (4):** Bath & NE Somerset, Bournemouth/Christchurch/Poole, Bristol, Exeter

**East of England (5):** Cambridge, Colchester, Luton, Norwich, Oxford *(shared planning)*

**East Midlands (6):** Charnwood (Loughborough), Leicester, Lincoln, Nottingham,
Northampton (West Northants), Rushcliffe

**West Midlands (5):** Birmingham, Coventry, Newcastle-under-Lyme (Keele), Stoke-on-Trent,
Warwick

**Yorkshire & Humber (5):** Hull, Kirklees (Huddersfield), Leeds, Sheffield, York

**North West (8):** Lancaster, Liverpool, Manchester, Preston, Salford, Trafford (partial),
Cheshire West (Chester), Stockport (partial)

**North East (4):** County Durham, Middlesbrough, Newcastle upon Tyne, Sunderland (M)

**Scotland (7):** Aberdeen City, City of Edinburgh, Dundee City, Fife (St Andrews),
Glasgow City, Renfrewshire (UWS), Stirling

**Wales (5):** Aberystwyth/Ceredigion, Bangor/Gwynedd, Cardiff, Swansea, Wrexham

**Northern Ireland (3):** Belfast, Derry City & Strabane, Causeway Coast (Coleraine)

---

## Step 1 — Always start with Tier 0: GSL Global news wire

Before touching any council portal, fetch the GSL Global wire. This aggregates UK-wide PBSA
planning news daily and is faster than portal scraping for initial discovery.

```
https://gslglobal.com/category/news/wire/
```

Fetch pages 1 and 2 (around 20 stories). Extract all UK/Ireland items mentioning:
"planning submitted", "planning approved", "consent granted", "plans for", or any scheme
with a bed count. This typically surfaces 3–8 opportunities without any portal access.

For each scheme found, try to identify the LPA from the address and cross-reference with
the portal directory to get the correct portal URL for the classifier.

---

## Step 2 — Load and filter the portal directory

Load `references/portal-directory.yaml`. Filter to the target scope:

```
# Example: all H-demand Idox portals in the North West
north_west_h = [lpa for lpa in directory
                if lpa['region'] == 'North West'
                and lpa['pbsa_demand'] == 'H'
                and lpa['tier'] == 1]
```

Recommended session sizes:
- Nationwide sweep: 10–15 H-demand portals per session, rotate regions weekly
- Regional sweep: all H+M demand portals in that region
- City/council: just that LPA (can include nearby M-demand councils)
- "Smaller university towns" run: all M-demand councils with pop_band = medium_town

---

## Step 3 — Search each portal

Each LPA entry in the portal directory now has a `keyword_search_urls` list containing
**pre-built search URLs for all relevant terms**:

| Keyword | Catches |
|---|---|
| `student accommodation` | PBSA, student rooms, cluster flats |
| `co-living` | Co-living schemes (hyphenated) |
| `co living` | Co-living schemes (some portals miss the hyphen) |
| `managed accommodation` | Co-living, PBSA and hybrid schemes |
| `shared living` | Co-living and large HMO-style schemes |
| `young professionals` | BTR co-living explicitly targeting young professionals |

Run **all** `keyword_search_urls` for each LPA in scope, not just the first one.
Co-living applications almost never use the phrase "student accommodation" and will only
be found by the co-living/managed accommodation/shared living searches.

### Tier 1: Idox portals (direct fetch)

Use `web_fetch` on each URL in `keyword_search_urls`. Deduplicate results across keywords
(same application may appear in multiple keyword searches).

For date-filtered results (last 14 days), use the advanced search pattern:
```
[search_base_url]student+accommodation&dateReceivedStart=16/05/2026
```
Replace the keyword and date as appropriate. Today is 30 May 2026.

**If `robots_block: true`** (Leeds, Bristol): skip direct fetch, use the web_search
queries from `keyword_search_urls` instead.

### Tier 2: Web search (non-Idox or robots-blocked)

Use targeted Google queries:
```
"student accommodation" planning application site:[portal_domain] 2026
"student accommodation" OR "co-living" planning [lpa_name] submitted 2026
```

### Tier 3: Claude in Chrome (Manchester Arcus BE only)

Navigate to: `https://arcusbe.manchester.gov.uk/pr/s/register-view?c__r=Arcus_BE_Public_Register`
Use the quick search box with term: "student accommodation"
Filter to Planning_Applications register.

### ePlanning Scotland (all Scottish councils)

Use the national system with the council name filter:
```
https://eplanning.scotland.gov.uk/public/search/run?type=allApplications&keyword=student+accommodation
```

### NI Planning Portal (all Northern Ireland councils)

```
https://www.planningni.gov.uk/index.cfm/event/applicationSearch.initiate
```
Search by keyword "student accommodation" filtered to the relevant council area.

---

## Step 4 — Filter results

From each portal's results, keep only applications that pass this pre-filter:
1. Received within the target date window (default: last 14 days)
2. Not householder / extension / advertisement / discharge of condition / NMA
3. Not a single residential property
4. Scale of at least ~50 units (below Flagstaffe's minimum)

Aim to pass 10–15 applications to the classifier per session.

---

## Step 5 — Classify each application

For each filtered application, run the `planning-classifier` skill:
- Pass the individual application URL or extracted text
- Collect all outputs

If a portal URL fails to fetch, pass the extracted listing text directly.

---

## Step 6 — Output the shortlist

Produce a structured summary:

```
## Flagstaffe Planning Opportunities — [DATE RANGE]
### Scope: [what was searched]
### Portals searched: [list]

| # | LPA | Address | Planning Ref | Classification | Scale | Stage | Action |
|---|-----|---------|-------------|----------------|-------|-------|--------|
```

List Approach Now / Monitor applications in priority order with:
- Full application details (ref, address, portal URL, source URL)
- Key opportunity for Flagstaffe
- Recommended next action

Offer to generate bid documents for any recommended applications.

---

## Recommended weekly rotation

**Week 1 — London + South East:** All London H-demand portals + Brighton, Canterbury,
Portsmouth, Southampton, Oxford, Guildford

**Week 2 — North + Midlands:** Leeds, Sheffield, Manchester, Liverpool, Preston, Salford,
Birmingham, Coventry, Nottingham, Leicester, Lincoln, Newcastle, Middlesbrough

**Week 3 — South West + East + Scotland/Wales:** Bristol, Bath, Exeter, Plymouth, Norwich,
Cambridge, Luton, Edinburgh, Glasgow, Aberdeen, Dundee, Cardiff, Swansea

**Week 4 — Smaller university towns:** All M-demand medium/large towns not covered in
weeks 1–3 (York, Hull, Worcester, Derby, Northampton, Chester, Wrexham, Stirling, etc.)

This covers all 58 H-demand and ~46 M-demand LPAs across a month.

---

## Error handling

| Error | Action |
|---|---|
| URL blocks / robots.txt | Switch to web search for that LPA |
| Portal returns 0 results | Try alternative keyword; note and move on |
| Application page not fetchable | Pass listing text to classifier |
| Rate limiting | Wait 3 seconds between requests |
| Classifier returns Not Relevant | Record in table, exclude from shortlist |
