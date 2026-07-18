# RedTag Repository Instructions

## Source of truth

Read `docs/superpowers/specs/2026-07-17-redtag-design.md` before changing product meaning, provider behavior, result states, privacy rules, or safety-sensitive copy.

## Non-negotiable boundaries

- AI extracts identity candidates. Deterministic typed code owns provider routing, matching, result decisions, and result copy.
- Never convert an outage, malformed payload, incomplete page, provider cap, truncation marker, or model failure into `no_match_found`.
- Never claim that a product is safe, all clear, not recalled, or agency approved.
- NHTSA results describe campaigns associated with a vehicle type; they never claim VIN-specific open or unrepaired recalls.
- FDA results are dated enforcement records; they are never labeled current, active, resolved, safe, or unrepaired.
- Preserve CPSC product-entry boundaries and FDA field/span/product-line provenance.
- Never log or persist uploaded images, raw OCR, full VINs, full lot codes, full UPCs, request URLs containing identifiers, or temporary image URLs.
- Keep Current Provider Query and Recorded Provider Response visibly distinct.
- Red appears only after a qualifying deterministic CPSC/FDA match. Green never communicates safety.

## Engineering workflow

- Branch from current `main`; use `feat/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`, `ci/`, or `security/`.
- Use Conventional Commit subjects.
- Open a draft PR early and keep commits coherent and passing.
- Add or update tests before behavior changes.
- Do not push directly to `main`.

## Required verification

Run the applicable subset during development and the full set before marking a PR ready:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:contracts
pnpm test:security
pnpm build
pnpm test:e2e:smoke
```

Live OpenAI and government-provider calls are explicit release checks and never ordinary PR gates.
