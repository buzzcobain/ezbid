# Search Terms & Keyword Strategy

The scraper runs **two separate keyword tracks** for each portal — PBSA and co-living.
They must both be run because co-living applications almost never use the phrase
"student accommodation", and PBSA applications almost never use "co-living".
Missing either track means missing real opportunities.

---

## Track 1: PBSA keywords

| Keyword | Why |
|---------|-----|
| `student accommodation` | Highest volume; used in most PBSA application descriptions |
| `co-living` | Some hybrid PBSA/co-living schemes use this |
| `student housing` | Fallback if above returns zero |
| `purpose built student` | More specific; explicitly named PBSA |
| `cluster flat` | Common bedroom-type descriptor in PBSA applications |
| `PBSA` | Rarely appears in descriptions but occasionally does |

## Track 2: Co-living / young professionals keywords

These must be run as separate searches. Co-living schemes are submitted under use class
Sui Generis or C3 and their descriptions use different language entirely.

| Keyword | Why |
|---------|-----|
| `co-living` | Direct match; primary term used by operators and planning agents |
| `co living` | Hyphen-free variant — Idox exact-match search is sensitive to hyphens |
| `coliving` | One-word variant; occasionally used |
| `managed accommodation` | Broad; catches co-living, some PBSA hybrids, serviced living |
| `shared living` | Alternative phrase used by operators and some planning consultants |
| `young professionals` | Explicitly used in some co-living descriptions and operator briefs |
| `build to rent` | Wide net — many results will not be relevant, but catches co-living BTR |

**Note on `build to rent`:** This generates the most noise (standard C3 BTR apartments
will appear). Use it for portals in cities with known co-living activity. Always classify
before acting — the classifier will filter irrelevant BTR.

---

## Portal-type search approach

### Idox (Tier 1)

Both tracks are pre-built in the YAML `keyword_search_urls` field. Run all of them.
Idox keyword search returns applications where the keyword appears anywhere in the
description. It is case-insensitive but performs exact phrase matching — "co-living" and
"co living" return different results, which is why both are included.

Date-filtered URL pattern (replace KEYWORD and DATE):
```
[search_base_url]KEYWORD&dateReceivedStart=DD/MM/YYYY
```

### ePlanning Scotland

Scotland's national system:
```
https://eplanning.scotland.gov.uk/public/search/run?type=allApplications&keyword=KEYWORD
```
Run for: student+accommodation, co-living, managed+accommodation

### NI Planning Portal

Manual keyword search at planningni.gov.uk — run each keyword term separately.

### Web search (Tier 2 / robots-blocked portals)

Run separate searches for each track:
```
# PBSA track
"student accommodation" planning application site:[domain] 2026
"purpose built student" planning [council name] 2026

# Co-living track
"co-living" OR "co living" planning application site:[domain] 2026
"managed accommodation" OR "shared living" planning [council name] 2026
"young professionals" planning application [council name] 2026
```

### GSL Global (Tier 0 — always first)

GSL Global covers both tracks in its news wire — it reports on PBSA and co-living equally.
No separate search needed; scan all articles for both types.

---

## False positive filter

Automatically exclude results matching these patterns regardless of keyword matched:

| Pattern | Reason |
|---------|--------|
| Discharge of condition | Not a new application |
| Non-material amendment (NMA) | Variation only |
| Householder application | Single residential |
| Advertisement consent | Signage only |
| Listed building consent | Usually small works |
| Single house number address | Too small |
| HMO conversion under 20 rooms | Below Flagstaffe minimum |
| "apart-hotel" without co-living language | Probably hospitality, not co-living |
| Build-to-rent without communal/amenity language | Standard BTR, not co-living |

---

## Operator name searches (supplement)

For portals where keyword search is limited, searching known operator names directly
often finds relevant applications not caught by generic keywords:

PBSA operators: `Unite Students`, `iQ Student`, `Vita Student`, `Scape`, `Urbanest`,
`Fresh Student Living`, `Nido`, `Student Roost`, `Downing Students`

Co-living operators: `The Collective`, `Folk`, `Lyfe`, `Gravity Co`, `Native`,
`Moda Living`, `Conscious Coliving`

Use these as web search terms: `"[operator name]" planning application [city] 2026`
