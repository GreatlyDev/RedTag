# RedTag Product and Technical Design

**Status:** Consolidated approved decisions; pending user review of the written specification

**Date:** July 17, 2026

**Hackathon:** OpenAI Build Week 2026

**Track:** Apps for Your Life

## 1. Product summary

RedTag is a mobile-first recall-checking Progressive Web App (PWA). A user can photograph an item, choose an existing photo, or type an identifier. GPT-5.6 turns that ambiguous input into structured product-identity candidates and guides the user toward any missing evidence. Deterministic matching code then compares confirmed identifiers with official recall or enforcement records from the relevant public source.

The core product promise is:

> Scan a supported item or label. Verify the evidence. Know what to do next.

The core trust rule is:

> AI proposes the identity. The user confirms decisive identifiers. Deterministic rules decide whether those identifiers match a dated published record, while source limitations remain visible.

“Universal Scan” describes the shared intake experience and extensible provider architecture. It does not mean that the MVP covers every product, jurisdiction, regulator, or recall system.

## 2. Problem and audience

Recall information is fragmented across agencies, written for different audiences, and organized around identifiers that ordinary users may not know how to locate. A parent checking infant formula, a homeowner checking an appliance, and a driver checking a VIN currently face different interfaces and proof requirements.

RedTag is for U.S. parents, caregivers, homeowners, and vehicle owners who need a fast, understandable way to:

1. determine which official source is relevant;
2. collect the identifying evidence that source requires;
3. understand whether the evidence matches a published record; and
4. reach the official record and any provider-published next action without interpreting raw government data.

## 3. Goals

The hackathon MVP must:

- provide one mobile-first scan flow for camera capture, photo upload, and manual entry;
- make GPT-5.6’s vision, structured extraction, category suggestion, and follow-up guidance visible in the product;
- deliver one complete CPSC vertical and two constrained FDA/NHTSA lookup demonstrations with provider-specific semantics;
- limit P0 to one selected item and no more than two evidence images per scan session;
- use deterministic rules for result states;
- show the exact fields that matched, did not match, or remain unknown;
- link every result to the official source and show retrieval time;
- handle model and provider failures without producing false reassurance;
- deliver a visually distinctive, responsive, accessible interface; and
- be easy for judges to test from a public URL without installing a native application.

## 4. Non-goals for the hackathon MVP

The MVP will not include:

- native iOS or Android binaries;
- continuous live-video or augmented-reality scanning;
- a custom barcode/OCR pipeline separate from GPT-5.6;
- user accounts, household sharing, or cloud photo history;
- push notifications or background recall monitoring;
- an offline recall database or full agency-data ingestion platform;
- international recall coverage;
- a claim to cover all U.S. recalls or all products;
- medical, legal, or vehicle-operability advice;
- unit-specific NHTSA unrepaired-recall determinations from model-level API data; or
- a “safe,” “all clear,” or equivalent outcome.

Provider-specific monitoring may be researched after the hackathon, but **Save and watch** does not appear in the MVP or demo.

## 5. Delivery format

RedTag will be a responsive PWA delivered through a public HTTPS URL.

### Mobile

The primary experience offers:

- **Scan with camera:** requests the phone’s rear camera with `capture="environment"` where supported; otherwise the browser presents its normal camera/file chooser;
- **Choose from photos:** selects one or two existing images from the photo library; and
- **Enter details manually:** accepts a model number, UPC/GTIN, lot code, date, or VIN.

The MVP uses capture-based scanning, not a continuous camera stream. A scan session contains one selected item and at most two images: typically an overview followed by a close-up of a decisive identifier. If several products appear, the user must select one before extraction continues.

### Desktop

Desktop users can upload, drag and drop, or type identifiers. Desktop webcam capture is not promised in P0.

### Installation

RedTag includes a web manifest, 192/512 pixel icons, `display: standalone`, a minimal service worker, HTTPS production hosting, and an installability smoke test. The service worker caches only versioned application-shell/static assets, never recall results, provider responses, images, or user identifiers. RedTag is installable where the browser supports PWA installation; the responsive mobile website remains fully usable without installation. Chromium installability and iOS **Add to Home Screen** guidance are tested separately. App-store submission is outside the hackathon scope.

## 6. MVP provider lanes

### 6.1 CPSC consumer products — complete hero vertical

RedTag queries the U.S. Consumer Product Safety Commission recall API for household and consumer products. GPT-5.6 extracts candidate product names, models, and UPCs. The user confirms ambiguous characters. Local deterministic rules then compare those identifiers with the returned recall record.

The complete hero path is:

> Photo or upload → product recognition → model/UPC confirmation → CPSC candidate retrieval → exact local identifier comparison → evidence sheet → official notice and remedy

CPSC is the primary Current Provider Query demonstration because it provides a clear end-to-end consumer-product story.

A CPSC `confirmed_match` requires at least one exact user-confirmed anchor identifier that the official record also publishes, such as UPC or model/catalog number, **and** deterministic satisfaction of every published qualifier that narrows affected units, such as serial range, date code, manufacture date, size, or variant. The adapter preserves CPSC per-product nesting and field provenance; it never combines a model from one product entry with a UPC or qualifier from another. Because model/catalog numbers are not globally unique, a model-only anchor also requires exact normalized manufacturer and deterministic product-type context within the same product entry. An unprovided qualifier produces `possible_match`; a conflicting qualifier produces `identifier_conflict`; and any qualifier the adapter cannot reliably extract produces `possible_match` with reason `record_not_unit_verifiable`. Product name, description, brand, image similarity, or semantic similarity alone can retrieve candidates but cannot confirm a match. If a CPSC record omits anchor identifiers or unit qualifiers cannot be parsed, RedTag shows the dated official notice for manual review; it does not manufacture an exact local confirmation.

### 6.2 FDA food enforcement — enforcement-record lookup

RedTag queries the openFDA food enforcement API for food and infant-formula records. The UI must call this an **FDA enforcement-record lookup**, not a real-time public-alert service or lifecycle tracker.

Constraints reflected in the UI and matcher:

- the data is updated weekly;
- lot and UPC details may appear inside free-text fields;
- openFDA status is not updated after an enforcement report is published;
- records are always rendered as dated published enforcement records, never filtered or labeled as current, active, resolved, safe, or unrepaired;
- a confirmed FDA identifier match requires an exact user-confirmed anchor code present in the record plus deterministic satisfaction of every applicability constraint published for that product line, including lot/batch, UPC, expiration/date, package size, and variant when present;
- product/brand context uses normalized whole tokens and explicit aliases only—never substring or semantic compatibility—and lot codes compare as exact delimiter-bounded tokens, so one lot cannot match merely because it is a substring of another;
- every parsed free-text token retains its source field, character span, associated product-line segment, and parser rule; short codes cannot match inside dates, quantities, or longer identifiers;
- UPC-only confirmation is allowed only when the same product-line text explicitly says that all lots/codes are affected; otherwise a missing lot/batch remains `possible_match`;
- ambiguous association between a free-text code and a product line, an unsupported range expression, or any parse failure remains `possible_match` with reason `record_not_unit_verifiable`; and
- a record without an exact lot/batch for the product line—or an explicit all-lots/all-codes statement—remains `possible_match` even when UPC and product name appear identical.

Every FDA sheet and no-match context states that this lookup covers publicly releasable openFDA food-enforcement records from 2004 onward and preserves the source update date.

Official reference: <https://open.fda.gov/apis/food/enforcement/>

### 6.3 NHTSA vehicles — campaign discovery plus official VIN lookup

RedTag requires a 17-character VIN with a valid check digit, then decodes it through NHTSA vPIC. Decoded attributes are eligible for campaign lookup only when vPIC returns `ErrorCode=0`. Nonzero-error responses remain invalid or insufficient even if partial vehicle fields are present. A valid decode derives model year/make/model and queries NHTSA campaigns for that vehicle type.

The public recall API returns campaigns by model year, make, and model. Therefore RedTag must label the output:

> Campaigns associated with this vehicle type

It must not claim that a specific VIN has an open or unrepaired recall. The final action is labeled **Open NHTSA’s official VIN lookup** and keeps NHTSA’s own coverage notes accessible beside the link; RedTag does not describe that external action as a clearance or definitive verification.

The NHTSA lane never produces `confirmed_match`; its strongest local result is `vehicle_campaigns_found`.

Official references:

- <https://vpic.nhtsa.dot.gov/api/>
- <https://www.nhtsa.gov/nhtsa-datasets-and-apis>
- <https://www.nhtsa.gov/recalls>

## 7. Universal Scan experience

### Stage 1: Capture

The landing screen has two dominant actions, **Scan with camera** and **Choose from photos**, plus a quieter manual-entry link. A visible category override lets a user correct routing at any time.

### Stage 2: Understand

GPT-5.6 analyzes the image at sufficient visual detail and returns a structured `IdentityCandidate`. The UI keeps the original image visible and places quoted extracted text beside it as editable chips. P0 does not present model-inferred coordinates as evidence.

### Stage 3: Complete the proof

RedTag compares the extracted fields with the evidence requirements for the selected provider. When evidence is missing, it gives a concrete instruction such as:

> Formula label detected. Lot code still needed; photograph the code printed beneath the can.

The user can take another picture, choose another photo, correct a value, change category, or continue manually.

### Stage 4: Route and retrieve

GPT-5.6 may suggest a category, but deterministic U.S. jurisdiction/category rules plus the user-confirmed category select the eligible provider lane. If routing remains uncertain, RedTag requires user confirmation; it does not query an ineligible source to produce a result. The interface visibly activates the selected regulator lane. P0 invokes that bounded adapter directly and normalizes official records without flattening their distinct meanings.

### Stage 5: Verify

The deterministic matcher applies provider-specific minimum-evidence rules. The UI visually aligns the user-confirmed fields with the corresponding official-record fields. Only a qualifying CPSC or FDA rule result can produce `confirmed_match`; NHTSA cannot.

### Stage 6: Act

The result card contains:

- outcome label;
- regulator and record/campaign number;
- product identity;
- matched, conflicting, and unknown fields;
- provider-specific official detail fields shown under their true source labels: CPSC hazard/remedy when present, FDA `reason_for_recall` with no invented consumer-remedy field, and NHTSA component/summary/consequence/remedy when present;
- official source URL;
- source publication/update metadata when supplied, plus retrieval time; and
- an appropriate next action.

GPT-5.6 does not generate or paraphrase result summaries, safety guidance, disposal instructions, medical advice, vehicle-operability advice, or remedies in P0. Result copy comes from deterministic templates plus verbatim official text or clearly marked deterministic excerpts.

## 8. Result, source, and processing state model

The application never compresses recall applicability into a recalled/not-recalled Boolean. Every candidate provider record receives its own decision; the scan-level summary is derived from those decisions. Result meaning, retrieval completeness, and model availability are separate axes, because a valid published-record match can coexist with another candidate state or a secondary source failure.

### 8.1 Result decision

| State | Meaning | Required presentation |
| --- | --- | --- |
| `not_evaluated` | No provider has completed a valid evaluation yet because processing is pending, the source is unavailable, or the user has not supplied enough searchable input. | Show the precise workflow/source state and next action; never coerce it into no-match or another result decision. |
| `confirmed_match` | A CPSC or FDA record satisfies that provider’s non-vacuous minimum-evidence rule. | Muted brick-red **Identifiers match this published [CPSC recall/FDA enforcement] record**, exact comparison rows, record date, original official text, and source action. |
| `possible_match` | A candidate record exists, but unit-level confirmation is not possible. | If reason=`user_evidence_missing`, show warm amber **More proof needed** and name the requested field. If reason=`record_not_unit_verifiable`, say **Official record lacks machine-verifiable unit detail — review the notice** and do not ask for evidence that cannot resolve it. No recall verdict. |
| `identifier_conflict` | Candidate retrieval succeeded, but one or more user-confirmed decisive fields conflict. | Explain the conflict character by character; do not present a recall verdict. |
| `vehicle_campaigns_found` | NHTSA returned campaigns for a validly decoded vehicle type. | Neutral vehicle-type campaign list plus **Open NHTSA’s official VIN lookup** and its coverage notes; never red and never labeled verification/clearance. |
| `no_match_found` | No deterministic match was found in every named source that completed successfully. | Neutral paper/charcoal/blue-gray treatment and the required non-safety disclaimer. |
| `insufficient_identifier` | The input is incomplete, invalid, or too uncertain to search reliably. | Ask for a new image or manual entry. |
| `unsupported` | Category or jurisdiction is outside MVP coverage. | State the limitation and link to an appropriate official starting point when known. |

### 8.2 Independent operational axes

| Axis | Values | Presentation rule |
| --- | --- | --- |
| Retrieval completeness | `complete`, `partial`, `unavailable` | Track every required query/page, provider cap, and truncation marker. `partial` preserves valid record decisions while making the incomplete retrieval equally visible; an error or truncated result set can never become no-match. |
| Model state | `model_ready`, `model_unavailable` | On `model_unavailable`, keep the session and enter visibly labeled `manual_mode`; deterministic category selection, identifier entry, and provider lookup remain available. |
| Data mode | `current_query`, `recorded_response` | A recorded response is user-selected, timestamped, and visually persistent; it is never a silent fallback or described as current. |

### 8.3 Multiple-candidate aggregation

The UI retains every `RecordDecision` and derives `ScanSummary` in this order:

1. if no provider completed, summary=`not_evaluated`;
2. if one or more records are `confirmed_match`, summary=`confirmed_match` and every confirmed/possible/conflicting record remains separately visible;
3. otherwise, if one or more records are `possible_match`, summary=`possible_match`;
4. otherwise, if one or more records are `identifier_conflict`, summary=`identifier_conflict`;
5. `no_match_found` is allowed only when retrieval is `complete`, every required page/query finished without cap or truncation, and there are zero confirmed, possible, or conflicting candidates; and
6. `insufficient_identifier` or `unsupported` may end the workflow before provider evaluation when their own deterministic conditions apply.

Summary precedence never deletes or relabels a lower-precedence record decision.

Required no-match copy:

> No matching record was found in all named sources that completed successfully as of [time]. This does not establish that the product is safe or unaffected.

FDA no-match sheets append: **Coverage shown: publicly releasable openFDA food-enforcement records from 2004 onward; source last updated [date].** NHTSA sheets keep NHTSA’s own coverage notes accessible beside **Open NHTSA’s official VIN lookup**.

Prohibited product language includes “safe,” “all clear,” “not recalled,” “no recalls,” “real-time,” “complete coverage,” “AI verified,” “FDA/CPSC/NHTSA approved,” and unsupported claims that a specific VIN has an open recall.

## 9. AI integration

### 9.1 GPT-5.6 runtime responsibilities

GPT-5.6 is a central runtime dependency, not a decorative chatbot. It may:

1. classify the probable product category;
2. identify the brand, product, model, lot, date, UPC/GTIN, VIN, and visible text;
3. return those candidates through Structured Outputs;
4. identify which proof fields remain missing;
5. select the next capture request from a bounded, category-specific instruction set; and
6. suggest a category for user confirmation before deterministic routing.

GPT-5.6 must not:

- assign an outcome state;
- invent or silently correct a missing identifier;
- treat model confidence as proof;
- override a deterministic conflict;
- turn a provider error into no-match;
- choose an authoritative provider or broaden the deterministic eligibility rules;
- generate or paraphrase safety, disposal, medical, operability, or remedy instructions;
- issue medical, legal, or vehicle-operability advice; or
- obey instruction-like text found inside an uploaded image.

### 9.2 Structured extraction

The model returns raw and normalized candidate values separately. Every important candidate includes its source image reference, quoted visible text, ambiguity notes, and whether the user confirmed it. Model-inferred coordinates are excluded from the P0 schema. The server validates the output schema before using it.

### 9.3 Tool orchestration

After the user confirms the category, deterministic eligibility rules invoke the bounded P0 adapter directly. Filtering, joins, minimum-evidence evaluation, and result composition are ordinary typed code, not model-coordinated tool calls. Programmatic Tool Calling remains a post-P0 extension and can never bypass the deterministic router or matcher. Provider output is treated as untrusted external data until normalized and validated.

### 9.4 Codex development contribution

Codex is used substantively across product design and implementation:

- write and refine the design and implementation plans;
- implement the PWA, adapters, schemas, and matcher;
- generate adversarial normalization and OCR fixtures;
- write the prioritized unit, contract, end-to-end, accessibility, and later targeted property tests;
- operate the local browser to inspect rendered states;
- perform visual-regression review and responsive verification;
- debug provider and deployment failures; and
- prepare the README, demo evidence, and submission-quality documentation.

The primary build task must be preserved, and its `/feedback` Session ID must be submitted. The README and narrated video must distinguish GPT-5.6’s runtime work from Codex’s development work and identify the key human product and safety decisions.

## 10. System architecture

### 10.1 Recommended stack

- Next.js App Router and TypeScript;
- responsive React PWA;
- OpenAI Responses API with GPT-5.6;
- Zod schemas for model and provider boundaries;
- server-side route handlers for secrets and provider access;
- a small in-memory or platform cache for successful provider responses;
- versioned JSON fixtures for explicit Recorded Provider Response mode;
- Vitest for unit and contract tests;
- optional fast-check coverage for targeted normalization properties after P0; and
- Playwright for end-to-end, accessibility, mobile, and screenshot checks.

No persistent database is required for the MVP.

### 10.2 Components

| Component | Responsibility | Must not do |
| --- | --- | --- |
| `CaptureClient` | Camera, upload, manual input, client-side resize, metadata removal. | Persist images or call providers directly. |
| `ScanSessionController` | Maintains images, candidate fields, confirmations, and state transitions. | Produce provider or match conclusions. |
| `VisionIntake` | Calls GPT-5.6 and validates structured identity candidates. | Assign recall applicability. |
| `EvidenceGate` | Determines required proof fields and asks the user to confirm ambiguity. | Upgrade incomplete evidence to confirmed. |
| `ProviderRouter` | Applies deterministic U.S. jurisdiction/category eligibility after user confirmation. | Let model confidence choose authority or query an ineligible lane. |
| `CpscAdapter` | Retrieves CPSC records, preserves per-product nesting/provenance, and reports pagination/caps. | Trust wildcard results, merge fields across product entries, or hide truncation. |
| `FdaFoodAdapter` | Retrieves enforcement records, preserves product-line/code provenance, parses boundary-aware free text, and reports pagination/caps. | Claim current lifecycle status, accept ambiguous code association, or hide truncation. |
| `NhtsaAdapter` | Validates/decodes VINs and retrieves vehicle-type campaigns. | Claim VIN-specific open-recall status. |
| `RecallMatcher` | Produces a separate provider-specific deterministic `RecordDecision` for every candidate. | Use semantic similarity to confirm applicability or merge decisions. |
| `ResultComposer` | Derives `ScanSummary` by explicit precedence and builds evidence sheets from every decision, deterministic copy, and nullable provider-specific official fields under their true labels. | Drop lower-precedence decisions, generate/paraphrase advice, invent a missing field, or hide unknowns. |
| `RecordedResponseRepository` | Serves labeled, timestamped provider-response snapshots on explicit request. | Silently replace a failed current provider query. |

### 10.3 Data flow

1. `CaptureClient` creates a scan session and sends sanitized images to the server.
2. `VisionIntake` returns schema-valid candidates, a category suggestion, and a bounded missing-evidence request.
3. The user selects one item and confirms or edits the category and important identifiers.
4. `ProviderRouter` applies deterministic eligibility and invokes the relevant adapter directly.
5. Adapters normalize official records while preserving nesting, raw records, pagination/cap status, and field provenance.
6. `RecallMatcher` emits one `RecordDecision` per candidate record/product entry.
7. `ResultComposer` derives the lossless `ScanSummary` and emits evidence-backed sheets/actions.
8. The frontend renders the evidence and source timestamp without storing the user image.

## 11. Conceptual data contracts

### `ScanSession`

- session ID;
- created and updated timestamps;
- input mode;
- sanitized image references valid only for the active request/session;
- selected and suggested category;
- identity candidates;
- user confirmations;
- provider statuses; and
- scan summary, initialized as `not_evaluated` until a provider completes;
- independent source-completeness state;
- model availability and assisted/manual mode; and
- current-query/recorded-response data mode.

### `IdentityCandidate`

- category;
- brand;
- product name;
- model;
- UPC/GTIN;
- lot or batch code;
- date fields;
- VIN;
- raw visible text;
- source image reference and quoted visible text;
- ambiguity notes;
- missing required fields; and
- confirmation state.

### `NormalizedProviderRecord`

- provider;
- provider record/campaign number;
- provider product-entry ID and parent-record provenance when applicable;
- source URL;
- source publication and update metadata;
- product identity fields;
- applicability discriminators;
- per-field source/provenance, including product-line association and parser rule for FDA free-text codes;
- provider-specific nullable official details as a discriminated union:
  - CPSC: hazard and remedy;
  - FDA food enforcement: `reason_for_recall` and classification/status as dated published fields, with no consumer-remedy field; or
  - NHTSA: component, summary, consequence, and remedy;
- raw provider payload or payload hash;
- query/page/cap/truncation metadata; and
- retrieval timestamp.

### `RecordDecision`

- provider record and product-entry ID;
- result decision;
- possible-match reason code when applicable;
- matched fields;
- conflicting fields;
- unknown fields;
- rule version;
- provider limitations;
- per-source statuses and aggregate completeness;
- model availability/manual-mode status;
- current-query/recorded-response mode; and
- allowed next actions.

### `ScanSummary`

- derived summary state;
- ordered `RecordDecision` references without loss;
- counts by decision state;
- required and completed queries/pages;
- cap/truncation indicators;
- aggregate retrieval completeness;
- model and data modes; and
- summary rule version.

## 12. Matching policy

- Fuzzy or semantic comparison may retrieve candidate records only.
- A confirmed result is impossible unless the provider-specific minimum-evidence threshold below is met; agreement among zero decisive fields never confirms anything.
- Missing required evidence produces `possible_match` or `insufficient_identifier`.
- Conflicting confirmed evidence produces `identifier_conflict`.
- GTIN checksums and 17-character VIN format/check digits are validated before provider lookup.
- Raw and normalized values are retained in the active scan so transformations remain auditable.
- Normalization may remove harmless separators and normalize case, but must not change substantive characters.
- No provider failure, parser error, model failure, incomplete page, provider cap, or truncation marker may produce `no_match_found`.

### CPSC threshold

`confirmed_match` requires an exact normalized match on at least one user-confirmed anchor identifier published by one preserved CPSC product entry—UPC/GTIN or model/catalog number—and deterministic satisfaction of every published qualifier that narrows that entry’s affected units, including serial/date/manufacture ranges, size, and variant. Fields never cross product-entry boundaries. A model-only anchor additionally requires exact manufacturer and deterministic product-type context in that entry. Missing user evidence yields `possible_match:user_evidence_missing`; an absent, ambiguous, or unparseable record qualifier yields `possible_match:record_not_unit_verifiable`; any out-of-range or unequal confirmed qualifier yields `identifier_conflict`. Product name, brand, description, or visual similarity alone never confirms.

### FDA threshold

`confirmed_match` means only **identifiers match this dated FDA enforcement record**. It requires an exact user-confirmed anchor code and exact satisfaction of every published constraint associated with the same product-line segment. UPC alone confirms only when that segment explicitly states all lots/codes are affected; otherwise an exact lot/batch is required. Product/brand uses normalized whole tokens plus explicit aliases. Code tokens retain source span/provenance, must be delimiter-bounded, and cannot match inside dates, quantities, or longer identifiers. A conflicting UPC, lot, expiration/date, package size, or variant produces `identifier_conflict`. Missing user evidence yields `possible_match:user_evidence_missing`; ambiguous free-text association, absent unit detail, unsupported range syntax, or parse failure yields `possible_match:record_not_unit_verifiable`. RedTag never infers that the action is current, active, resolved, safe, or unrepaired and never uses openFDA to issue alerts or track lifecycle.

### NHTSA threshold

NHTSA never produces `confirmed_match`. A campaign lookup requires a 17-character, checksum-valid VIN and vPIC `ErrorCode=0`; partial decoded fields from any nonzero-error response are rejected. Matching model-year/make/model results in `vehicle_campaigns_found` and **Open NHTSA’s official VIN lookup**, not a claim about unrepaired recalls on that VIN. RedTag links rather than paraphrases NHTSA’s current coverage notes.

## 13. Error and recovery behavior

### Poor image quality

Show the image and name the needed correction: move closer, reduce glare, photograph a different side, or enter the field manually.

### Ambiguous text

Display editable candidate chips and visually identify uncertain characters. Do not rely on a numeric confidence score as proof.

### GPT-5.6 unavailable

Keep the scan session intact and expose manual category and identifier entry. The deterministic provider path remains usable.

### Provider timeout or malformed data

Mark that adapter `source_unavailable`, retain successful adapter results, show retry, and offer the separately labeled recorded provider response only after the failure is visible. If no provider completed, keep the result decision `not_evaluated`; never coerce the outage into a result.

### Unsupported item

Explain that the category is not yet connected. Do not route to a superficially similar provider merely to return a result.

### Source-date limitations

Show publication/update metadata exactly when the provider supplies it, plus RedTag’s retrieval time. Do not relabel age as “freshness” or infer lifecycle status from it. Recorded snapshots never appear as current-query results.

## 14. Privacy and security

- Re-encode every image before model processing, test that EXIF/location metadata is absent, and preserve enough label detail within request-size limits.
- Keep OpenAI and provider credentials server-side.
- Send OpenAI Responses requests with `store: false`.
- Do not persist user images by default. Any temporary sanitized image/reference expires and is deleted no later than 15 minutes after request completion or session abandonment.
- Clearly disclose that images are processed by OpenAI and are subject to the configured API data controls; `store: false` does not justify a zero-retention promise because applicable abuse-monitoring retention may still occur.
- Treat visible image text, provider payloads, and linked-page content as untrusted data.
- Validate all model and provider outputs at the server boundary.
- Constrain tool access to provider functions required for the active scan.
- Escape or safely render external text.
- Apply request-size, file-type, rate, and timeout limits.
- Redact identifiers in logs and traces: never record uploaded images, complete VINs, full lot codes, full UPCs, raw OCR text, or temporary image URLs in production telemetry.
- Do not claim “no retention” unless deployment and OpenAI project settings substantiate it.

Official OpenAI data-control reference: <https://platform.openai.com/docs/models/default-usage-policies-by-endpoint>

## 15. Caching and Recorded Provider Responses

### Current-query cache

- The shared P0 cache is limited to NHTSA vehicle-type campaign responses and non-user-specific provider metadata for approximately five minutes.
- Cache NHTSA campaigns by validated model year/make/model, never by VIN; do not cache vPIC VIN-decode payloads.
- Do not share-cache CPSC/FDA identifier searches, user-specific query responses, or GPT image extractions in P0.
- Keys use non-sensitive provider dimensions; any future identifier-bearing key must use a server-secret HMAC and pass a new privacy review. Keys and values never contain raw VINs, lots, UPCs, OCR text, request URLs, temporary URLs, or image references.
- Cached values contain only the eligible vehicle-type campaign/public provider-metadata fields and retrieval metadata; strip all request echoes.
- Include original retrieval time in every cached result.
- Do not persist negative/no-match responses.
- Do not present expired cached data as a current provider query.
- Do not cache user-image GPT extractions.

### Recorded provider response

The repository contains raw official response snapshots for the three bundled test cases. Each snapshot includes:

- source URL;
- `fetched_at` timestamp;
- provider update metadata when available;
- content hash; and
- adapter/schema version.

Recorded Provider Response mode is user-selected and visually separated from Current Provider Query mode. Every recorded-response screen shows:

> Recorded provider response — captured [time], not a current provider query.

The original source/update timestamp and provider-specific limitations remain visible. RedTag never silently falls back to a recorded response after a current-query failure.

## 16. Visual design system

### 16.1 Direction: Calm Guardian

The interface should feel protective, warm, and precise rather than tactical or alarming.

- Color tokens:
  - `--paper: #F5F0E7`;
  - `--surface: #FFFDF8`;
  - `--ink: #1F2925`;
  - `--muted: #6D746D`;
  - `--line: #D9D1C4`;
  - `--sage: #486154` and `--sage-soft: #DFE9DF` for navigation and non-safety brand accents;
  - `--neutral-info: #53646B` and `--neutral-info-soft: #E3E9EA` for no-match and neutral informational states;
  - `--amber: #8A6422`, `--amber-ink: #6D4B12`, and `--amber-soft: #F2DFB8` for **More proof needed** states; and
  - `--recall: #B9473D`, `--recall-ink: #8F2F29`, and `--recall-soft: #F3DCD7` only inside a deterministically confirmed CPSC/FDA identifier-match result region.
- Red is prohibited in the logo, navigation, progress, loading, source activation, vehicle-campaign results, no-match states, and all pre-confirmation UI.
- No-match styling uses paper, charcoal, `--neutral-info`, and `--neutral-info-soft` rather than sage or green, so it cannot resemble a safety clearance.
- Confirmed-match surfaces use `--recall-soft`; saturated brick red is limited to the match badge, a thin rule or icon, and decisive match text rather than a full saturated panel. Normal-size colored text uses the AA-contrast `--recall-ink` or `--amber-ink` token; body copy remains `--ink`.
- Display typography uses `Fraunces, "Iowan Old Style", Georgia, serif`; body and interface typography use `Geist, Inter, system-ui, sans-serif`.
- Model, lot, UPC, and VIN comparisons use `"Geist Mono", "SFMono-Regular", Consolas, monospace` with `font-variant-numeric: tabular-nums` for character alignment.
- The spacing scale is 4, 8, 12, 16, 24, 32, 48, and 64 CSS pixels.
- Controls, cards, and hero/result regions use 12, 18, and 24 pixel radii respectively; not every element receives a rounded container.
- The only elevated shadow token is `0 12px 36px rgba(31, 41, 37, .08)`.
- Missing-evidence states use an evidence or camera icon and calm copy such as **More proof needed**, never a warning triangle.
- The capture journey has generous breathing room, while evidence comparison is deliberately denser.
- Imagery is product-focused and self-created, without stock-photo decoration.

No green checkmark may imply safety.

### 16.2 Signature visual behavior

The memorable transformation is:

> Unknown item → quoted extracted text → editable evidence chips → selected authority → character-for-character record alignment → restrained RedTag result

The product photo remains visually anchored throughout capture and extraction. Extracted chips lift from the evidence beside it, then align against the relevant fields in an official-record sheet. When the result enters on a narrow phone, the large photo collapses into a compact evidence thumbnail so the outcome, decisive comparisons, source, and action fit together in the first result viewport. P0 does not draw bounding boxes or precise label-region overlays from any system; quoted source text and editable chips are the evidence surface.

Each function has a distinct visual form:

- a large photo canvas for the submitted evidence;
- compact editable evidence chips for extracted identifiers;
- a vertical or horizontal regulator rail for eligible sources;
- a document-like official-record sheet for source data;
- aligned comparison rows for decisive identifiers; and
- a full-width outcome band for the final state and next action.

The experience must not collapse these forms into a generic equal-card stepper. Non-selected regulator lanes remain monochrome and subordinate. The rail uses plain-text agency abbreviations/names or original neutral glyphs, never government seals or third-party logo artwork.

Motion is functional and calm:

- quoted identifier text settles beside the source image;
- confirmed chips align with official-record fields;
- the relevant regulator lane activates while others recede;
- evidence expands on request; and
- brick red appears only after deterministic confirmation.

Avoid sirens, pulsing alarms, radar motifs, red scan beams, risk meters, excessive parallax, or decorative animation unrelated to comprehension.

### 16.3 Anti-slop rules

RedTag must not default to recognizable generic AI styling:

- no purple/blue gradient blob background;
- no glassmorphism used as the primary design language;
- no repeated grid of indistinguishable cards;
- no repeated `icon + heading + body` feature-tile pattern;
- no sparkle icon used as a substitute for product identity;
- no glowing AI orb, typing dots, "thinking" panel, or confidence gauge;
- no giant empty hero that delays the scan action;
- no excessive pill controls or uniform rounded rectangles;
- no fake analytics, fabricated activity feeds, or ornamental AI output;
- no generic chatbot as the primary interface; and
- no motion added merely to make the page look "AI powered."

Evidence uses comparison rows and an official-source sheet, not an interchangeable card grid. System copy is direct and non-anthropomorphic: **Brand detected** and **Lot code still needed**, never **I found** or **I think**.

Every screen must have an intentional visual hierarchy, a clear primary action, and a distinct purpose within the scan journey. With the logo removed, a RedTag screenshot should remain recognizable through the anchored product image, lifted evidence chips, regulator rail, aligned official record, and restrained outcome band.

### 16.4 Accessibility

- meet WCAG AA contrast for text and controls;
- provide at least 44-by-44 CSS-pixel touch targets for primary mobile actions;
- preserve meaning without color;
- include visible focus states and keyboard navigation;
- announce asynchronous scan and provider status changes;
- provide text alternatives for evidence-chip and uncertain-character styling;
- support reduced-motion preferences; and
- test common narrow phone, tablet, laptop, and desktop widths.

## 17. GPT-5.6 visual quality loop

OpenAI describes GPT-5.6 as having stronger design judgment and the ability to inspect and refine rendered results. RedTag will use that build-time capability for bounded presentation review rather than treating it as a one-shot design generator or a substitute for human art direction.

GPT-5.6 and Codex review hierarchy, overflow, responsive composition, token drift, state distinction, and accessibility. Human reviewers retain ownership of Calm Guardian art direction, trust semantics, official-source meaning, and every safety-sensitive copy decision.

These are two cooperating layers: GPT-5.6 supplies the design judgment and rendered-page reasoning; Annotation mode and **Adjust** are ChatGPT desktop Browser interface features that send granular feedback to Codex. **Adjust** previews and submits a requested change—it does not directly edit source code. The Browser plugin is a build-environment prerequisite. DOM/applied-style inspection is used only when Browser Developer mode/full CDP access is available and approved; otherwise the loop relies on rendered states, annotations, accessibility inspection, and screenshots.

The visual production loop is:

1. lock the Calm Guardian tokens, content hierarchy, and anti-slop rules before coding;
2. implement one mobile-first hero flow with real fixture content;
3. render every state in the ChatGPT desktop app’s built-in browser;
4. use GPT-5.6 Sol through Codex to inspect hierarchy, overflow, applied styles, responsive composition, token drift, interaction states, and accessibility;
5. use browser Annotation mode and **Adjust** controls for element-specific font, text, spacing, and color feedback;
6. have Codex address a small, reviewable set of annotations at a time;
7. capture the mandatory screenshot set defined in section 18.5, including visibly labeled Recorded Provider Response states;
8. compare confirmed, possible, no-match, unavailable/manual, and recorded-response safety states side by side rather than reviewing each screenshot in isolation; and
9. require a final human visual pass before recording the demo.

The objective visual gates are:

- the scan action is visible without scrolling at 390×844;
- a reviewer can distinguish **GPT-5.6 extracts** from **deterministic matcher verifies** without narration;
- the official source, matched fields, and next action appear together in the first result viewport;
- the first result viewport remains readable and structurally intact at 200% text zoom;
- red is absent before a qualifying deterministic identifier match;
- confirmed, possible, no-match, vehicle-campaign, and unavailable states cannot be mistaken for one another; and
- essential meaning remains clear without animation or color.

Browser annotations may change presentation only. They may not change outcome copy, provider semantics, official remedy content, or matching rules without a separate safety review.

This feature improves the process used to build RedTag; it is not shipped as a dependency inside the consumer PWA.

Official references:

- <https://openai.com/index/gpt-5-6/>
- <https://developers.openai.com/codex/app/browser#styling-feedback>

## 18. Testing strategy

### 18.1 Unit tests, then targeted property tests

- VIN and GTIN validation;
- lot, model, punctuation, whitespace, and case normalization;
- exact, missing, and conflicting discriminators;
- prohibited-copy checks;
- outcome-state transition rules; and
- the invariant that provider/model failure cannot become no-match.

The concrete P0 examples run first. Targeted property tests for normalization and state invariants are added after the release matrix, production-phone path, and accessibility smoke tests pass; exhaustive generated suites are not allowed to delay the hero vertical.

### 18.2 Provider contract tests

- schema-valid/malformed CPSC responses plus multi-product nesting that forbids cross-entry field joins;
- FDA free-text `code_info` boundary/provenance parsing and historical status preservation;
- NHTSA vPIC error codes and model-level campaign responses;
- pagination, provider caps, repeated/missing pages, and explicit/implicit truncation;
- empty result sets;
- timeouts, rate limits, and server errors; and
- raw-field preservation and source timestamps.

### 18.3 GPT-5.6 evaluation fixtures

Use self-created original label panels and the package-shaped demo prop rather than downloaded packaging. Every physical fixture carries **DEMO FIXTURE — NOT A CONSUMER PRODUCT**. Cover:

- clear labels;
- glare and blur;
- a missing digit;
- O/0 and I/1 ambiguity;
- multiple products in one frame, which must pause for one-item selection;
- instruction-like text embedded in the image;
- missing lot/model/VIN fields; and
- wrong model-suggested category followed by user correction and deterministic routing.

Record the expected structured fields, decisive identifiers, official record IDs, model ID, prompt version, schema version, and source-snapshot hash for bundled fixtures. Pin fixtures and identifiers; do not assert against mutable current-query result counts.

### 18.4 P0 release matrix

The MVP does not ship until these fifteen paths pass:

1. The pinned CPSC mobile hero fixture produces **Identifiers match this published CPSC recall record** only after an exact official UPC/model anchor and every published qualifier agree.
2. A CPSC record with no anchor or an unparseable applicability qualifier remains `possible_match:record_not_unit_verifiable`, even when its name is similar.
3. A blurred digit remains unknown and triggers manual confirmation.
4. A matching CPSC model/UPC paired with an out-of-range serial/date becomes `identifier_conflict`; model/UPC fields from different product entries can never combine into confirmation.
5. A pinned FDA fixture confirms only when the exact anchor and every lot/date/package constraint agree, while preserving dated enforcement-record and historical-status semantics.
6. An FDA record with no unit-level code or an ambiguous parse remains `possible_match:record_not_unit_verifiable`; a matching UPC with a conflicting lot/date becomes `identifier_conflict`; and a lot that is merely a substring of another never matches.
7. No FDA result is labeled or filtered as current, active, resolved, safe, or unrepaired.
8. A checksum-valid pinned public example VIN with vPIC `ErrorCode=0` returns neutral vehicle-type campaigns plus the official VIN link.
9. A bad-check-digit VIN and a vPIC nonzero-error response with partial decoded fields are both rejected.
10. A true no-result uses the required disclaimer, names only completed sources, and has no safety styling.
11. Independent provider/subservice outages, incomplete pagination, provider caps, and truncation markers produce unavailable/partial completeness while retaining valid record decisions and confirmed input; none can produce no-match.
12. A GPT-5.6 outage visibly enters `manual_mode` and leaves the deterministic path usable.
13. Current Provider Query and Recorded Provider Response remain unmistakable on every frame; recorded mode requires explicit user action and shows snapshot time.
14. Privacy assertions verify `store: false`, EXIF removal after re-encoding, bounded temporary-reference deletion, no shared CPSC/FDA search or vPIC-decode cache, NHTSA campaign caching only by year/make/model, and absence of images/raw VINs/lots/UPCs/OCR/request URLs/temporary URLs in logs, traces, cache keys, and cache values.
15. The production HTTPS build completes camera capture on an actual phone, the scan action is visible at 390×844, and the keyboard/screen-reader smoke path reaches the official-source action.

### 18.5 End-to-end and visual checks

Testing order is: P0 release matrix → actual-phone production and accessibility smoke → responsive/state-family screenshot review → targeted property and expanded viewport coverage.

- camera permission and capture on an actual phone;
- gallery upload and manual entry;
- mobile and desktop navigation;
- retry without losing confirmed fields;
- official source links;
- current-query/recorded-response separation;
- loading, confirmed identifier match, possible, conflict, vehicle campaigns, no-match, unsupported, manual mode, partial, outage, and recorded-response states;
- keyboard and screen-reader basics;
- reduced motion; and
- the mandatory pre-submission screenshot set:
  - phone: CPSC hero result, one `user_evidence_missing` possible state, one `record_not_unit_verifiable` possible state, no-match, full `source_unavailable`, `manual_mode`, and Recorded Provider Response;
  - desktop: CPSC hero result plus one combined unavailable/recorded-response safety review; and
  - side-by-side comparison of the phone safety-state family.

Identifier conflict, vehicle campaigns, insufficient input, unsupported category, partial outage, tablets, and additional desktop widths still receive functional/rendered smoke checks. Persisted screenshot baselines for those states are added only if time remains.

## 19. Demo narrative

The public video must remain under three minutes and include narration.

### Proposed timing

- **0:00–0:03 — Cold open:** show a self-created package-shaped physical prop with an original label and the prominent mark **DEMO FIXTURE — NOT A CONSUMER PRODUCT**, then tap **Scan now** immediately; narrate recall fragmentation while extraction has already begun.
- **0:03–0:36 — Uninterrupted CPSC hero transformation:** source photo → quoted identifiers → editable chips → **GPT-5.6 extracts** boundary → **deterministic matcher verifies** boundary → exact official-field alignment → first appearance of red → official remedy action. Keep **DEMO FIXTURE — NOT A CONSUMER PRODUCT** visible; the dated source record and record number appear below.
- **0:36–0:48 — Proof hold:** keep the result still long enough to read the model/UPC comparison, CPSC record number, source date/link, and official remedy text.
- **0:48–1:08 — Formula evidence:** show the explicit transition **Possible match — lot required** → **Identifiers match this dated FDA enforcement record** only after every required discriminator agrees. Keep the published date and historical-record limitation visible.
- **1:08–1:28 — Vehicle lane:** enter the pinned public example VIN, validate it, and show neutral **vehicle-type campaigns** plus the official VIN lookup action. Never present these as VIN-specific open recalls or use the red confirmed-match treatment.
- **1:28–1:40 — Failure credibility:** show one missing-evidence recovery and one visibly labeled source outage/Recorded Provider Response frame.
- **1:40–2:05 — Codex contribution:** show an annotated before/after Calm Guardian refinement and a compact P0 test matrix. Trust architecture appears as brief overlays within the hero flow rather than a separate terminal montage.
- **2:05–2:20 — Close:** return to **Identifiers match this published CPSC recall record** and the official remedy action. Use **Scan. Verify. Act.** with the three provider lanes only as a quiet closing caption.

The video uses Current Provider Query mode when available. If a recorded response is shown, its badge and capture timestamp remain visible.

Record the uninterrupted hero transformation on one continuously visible working phone screen. Use natural warm lighting, steady cuts, and calm narration. Do not cut among enlarged mockups or use glitch transitions, alarm sounds, red flashes, urgent countdowns, or tactical graphics.

### Recording and asset compliance

Before upload, review the final build and every video frame against the Devpost rules. Demo assets use the self-created prop, original label panels, and graphics derived only from permissible public record fields. Do not download product photography or reuse packaging artwork. Crop, replace, or blur third-party logos and trademarks. Branded product or record text may appear in the submitted video only with documented permission or written organizer confirmation that the use complies with the rule; otherwise redact or replace it. Plain-text agency names remain source attribution, not logo artwork. Keep **DEMO FIXTURE — NOT A CONSUMER PRODUCT** visible so no fixture can be mistaken for genuine packaging.

Official rule reference: <https://openai.devpost.com/rules>

## 20. Submission evidence

The repository and README must include:

- installation and local-run instructions;
- environment-variable documentation without secrets;
- public demo URL;
- sample demo-fixture assets;
- current-query versus recorded-response behavior;
- source limitations and prohibited claims;
- test commands and P0 results;
- architecture diagram;
- GPT-5.6 model, vision, Structured Outputs, category-suggestion responsibilities, and the deterministic routing boundary;
- Codex workflow and the key human decisions;
- the primary `/feedback` Codex Session ID; and
- disclosure of third-party libraries, public APIs, and any pre-existing work.

## 21. Acceptance criteria

The design is successfully implemented when:

1. a judge can open the deployed PWA and begin a scan without creating an account;
2. camera capture, photo upload, and manual entry all work on a narrow mobile viewport;
3. GPT-5.6 visibly extracts structured candidates and asks for missing evidence;
4. the user can edit or confirm every decisive identifier;
5. the CPSC hero fixture reaches a source-linked **Identifiers match this published CPSC recall record** result from an exact official UPC/model discriminator;
6. FDA and NHTSA results preserve their documented limitations;
7. deterministic rules exclusively own outcome states;
8. all error paths remain distinct from no-match;
9. current-query and recorded-response data cannot be confused;
10. the interface satisfies the Calm Guardian system and anti-slop rubric;
11. the fifteen P0 verification paths pass;
12. a production smoke test passes on an actual phone; and
13. the README and under-three-minute video clearly demonstrate meaningful GPT-5.6 and Codex use.

## 22. Future extensions

After the hackathon, the provider registry can add USDA FSIS, medical-device, international, and manufacturer-specific adapters. Provider-specific monitoring may be researched only for sources whose terms, freshness, lifecycle semantics, and alerting suitability support it; openFDA enforcement data cannot be treated as a public-alert or lifecycle feed. Any consent-based inventory or notification system requires a separate retention, jurisdiction, and false-reassurance design and is not implied by this MVP.
