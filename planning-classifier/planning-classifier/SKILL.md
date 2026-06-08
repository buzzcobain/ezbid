---
name: planning-classifier
description: >
  Classify UK planning applications to identify opportunities for Flagstaffe, an FF&E supply and installation specialist.
  Use this skill whenever the user provides a planning portal URL, a planning application reference,
  or pastes planning application text and wants to know if it's relevant to student accommodation
  (PBSA) or co-living / young professional schemes. Also triggers for queries like "is this worth
  pursuing?", "analyse this planning application", "is this student accommodation?", or any request
  to assess a planning application for business development purposes.
---

# Planning Application Classifier

Classifies UK planning applications for PBSA (purpose-built student accommodation) or co-living /
young professional schemes, and produces a full opportunity analysis for an interior design and
fit-out specialist (Flagstaffe).

---

## Step 1 — Fetch the page

Use `web_fetch` on the URL provided. Most UK council planning portals are publicly accessible.

Common portal software you'll encounter:
- **Idox/Uniform** — used by most London boroughs and many English councils
- **Civica/Academy** — used by some councils in the North and Midlands
- **Acolaid** — older system, less common now
- **Planning Portal** (national) — links out to council systems

If the URL doesn't load or requires login, tell the user and ask them to paste the application
description text directly.

---

## Step 2 — Extract key fields

Pull out as many of these as the page contains:

| Field | Notes |
|---|---|
| **Application reference** | e.g. 24/01234/FUL — ALWAYS include. If not visible on portal, search trade press or Google for it. |
| **Portal link** | Direct URL to the application page, or portal search URL with instructions |
| **Source URL** | URL where this scheme was discovered (GSL Wire, trade press article, portal search) |
| Application type | Full, Outline, Prior Approval, LDC, Pre-app |
| Site address | Full address including postcode where known |
| Proposal / description | The most important field |
| Applicant name | Often a developer or SPV |
| Agent name | Usually the architect or planning consultant |
| Proposed use class | C4, Sui Generis, C3, mixed |
| Number of units / beds / rooms | If stated |
| Status | Pending, Decided, Under consultation |
| Submission date | |
| Decision date | If decided |
| Any listed amenity spaces | Gym, lounge, co-working, rooftop, etc. |

**Finding the planning reference:** If the application was discovered via news/trade press rather than a direct portal URL, always try to find the planning reference by:
1. Searching the LPA's portal for the address
2. Searching Google for `"[address]" "[council name]" planning application reference`
3. Checking the trade press article for a reference number
4. If still not found, provide the portal search URL and note the reference is to be confirmed.

Read the full description carefully — it often contains details not in the headline fields.

---

## Step 3 — Classify the application

### Is this PBSA?

Strong signals:
- Words: "student accommodation", "student rooms", "student cluster", "student studios",
  "purpose built student", "PBSA", "term-time", "academic year", "student lettings"
- Use class: Sui Generis (large PBSA sits outside C4), sometimes C4
- Applicant/agent: known PBSA operators (Unite Students, Urbanest, Vita, Fresh, Scape, iQ, etc.)
- Location: near a university campus or city-centre university town

Weaker signals (possible PBSA):
- "managed accommodation", "cluster flats", "ensuite rooms", high bedroom-to-unit ratio
- "all-inclusive rent", "amenity space"

### Is this co-living / young professionals?

Strong signals:
- Words: "co-living", "coliving", "shared living", "managed shared accommodation",
  "young professionals", "flexible tenancies", "all-inclusive", "build-to-rent with shared amenities"
- Operators: The Collective, Conscious Coliving, Tipi, Native, Fizzy, Moda, etc.
- High ratio of communal space to bedrooms
- Studio or cluster formats marketed to working adults (not students)

Weaker signals:
- "build-to-rent" alone is not co-living — BTR can be conventional apartments
- "shared amenities" without co-living language — could be standard BTR

### Classification output

Assign one of:
- **PBSA** — clear student accommodation
- **Co-living** — clear co-living / young professional scheme
- **Possible PBSA** — ambiguous, likely student but not confirmed
- **Possible co-living** — ambiguous, likely co-living but not confirmed
- **BTR (not co-living)** — build-to-rent conventional apartments, probably not relevant
- **Not relevant** — residential or commercial with no student/co-living angle

If not relevant, state this clearly and briefly. Do not produce a full analysis.

---

## Step 4 — Produce the full analysis

Use the structured output format below. Be specific — use numbers and names from the application
rather than generic observations.

---

## Output format

```
## Planning Application Analysis

**Reference:** [planning application reference number — e.g. DM/26/00566/FPA, 25/00123/FUL]
  If not immediately visible, provide the portal search URL and search terms to find it.
**Address:** [full address including postcode where known]
**LPA:** [local planning authority]
**Submitted:** [date] | **Status:** [status]
**Portal URL:** [direct link to the application on the planning portal, or portal search URL]
**Source:** [URL(s) where this application was discovered — GSL Wire article, trade press, portal search]

---

### Classification
[PBSA / Co-living / Possible PBSA / etc.] — [High / Medium / Low] confidence

[1–2 sentence rationale. Quote key words from the description that drove the classification.]

---

### Scheme overview
- **Scale:** [X beds / X units / X storeys — whatever is known]
- **Format:** [cluster flats / studios / mixed / unknown]
- **Amenities mentioned:** [list any communal spaces, gyms, co-working, rooftops, etc.]
- **Applicant:** [name — note if known operator]
- **Agent (architect/planner):** [name]

---

### Stage assessment
[Pre-application / Recently submitted / Under consultation / Decided]

[1–2 sentences on what this means for timing. Is there a consultation period open?
Has a decision already been made? Is this early enough to approach the developer?]

---

### Opportunities for Flagstaffe (FF&E supply and installation)

List specific, concrete FF&E opportunities based on what's in the application. Consider:
- Bedroom and studio FF&E packages at scale (Flagstaffe's core scope)
- Communal and amenity spaces — kitchens, lounges, gyms, co-working areas, rooftop terraces
  (higher-value FF&E with bespoke manufacturing potential)
- Cluster flat kitchen and dining fit-out
- Early design input opportunity — if pre-application, Flagstaffe can stress-test the budget
  and specification before anything is committed
- Operator involvement — some operators procure FF&E separately from the main contractor,
  creating a direct route for Flagstaffe
- Scale — projects over 200 beds benefit most from Flagstaffe's supply chain and manufacturing

Format as bullet points. Be specific to this scheme — avoid generic statements.

---

### Red flags

Consider and flag any of the following if relevant:
- Design team already named and likely retained (architect as agent = probably already appointed)
- Very small scale (under ~50 beds — below Flagstaffe's minimum viable project size)
- Conversion of existing building (FF&E scope may be constrained or already committed)
- Application already decided and under construction (likely too late to engage)
- Applicant is a self-build or one-off developer with no sector track record
- FF&E or furniture specification already defined and assigned in application documents
- No communal or amenity spaces mentioned (limits scope to bedrooms only — lower value)

Format as bullet points. Only include flags that genuinely apply — don't pad.

---

### Recommended action

One of:
- **Approach now** — early stage, strong fit, act quickly
- **Monitor** — good opportunity but too early or too late right now; set a reminder
- **Pass** — not relevant or too many red flags

Follow with 2–3 sentences on the specific next step: who to contact, what angle to use,
or what to wait for.
```

---

## Notes on UK planning portals

### Fetchability by portal type

| Portal | Fetchable? | Notes |
|---|---|---|
| **Idox / Uniform** | ✅ Yes | Most common. Static HTML. Fetches cleanly. |
| **Civica / Academy** | ✅ Usually | Static HTML on most councils. |
| **Planning Portal (national)** | ✅ Yes | Links out to council systems. |
| **Arcus BE (Salesforce)** | ❌ No | Used by Manchester. Blocks robots + JS-rendered. |
| **NECSWS** | ❌ No | Used by Camden. URLs too long for fetch tool. |
| **OcellaWeb** | ⚠️ Sometimes | Varies by council config. |
| **MasterGov** | ⚠️ Sometimes | Some councils block, some don't. |

**If a URL fails to fetch**, tell the user clearly and ask them to either:
1. Paste the application description and key fields directly into the chat, or
2. Use the Claude in Chrome extension if available, which can handle JS-rendered portals

**For Arcus BE (Manchester) specifically:** The user must copy and paste content from the page.
Arcus BE is used by Manchester City Council and actively disallows automated access.

### Content tips by portal type

- **Idox portals** often have separate tabs for "Details", "Documents", and "Consultations" —
  check the Documents tab for the Design and Access Statement, which contains the richest detail
  about amenities, operator intent, and interior specification.
- **Pre-application advice** records are not always public — if you see a pre-app reference,
  note it but don't expect full details.
- If a fetched page returns minimal information, ask the user to also share the Design and
  Access Statement PDF — it typically contains far more useful detail than the portal summary.

## Reference files

- `references/use-classes.md` — UK planning use classes relevant to this sector
- `references/known-operators.md` — Known PBSA and co-living operators and their typical
  procurement approaches
