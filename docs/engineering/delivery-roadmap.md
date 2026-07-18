# RedTag Engineering Delivery Roadmap

## Purpose

This document turns the approved RedTag product and technical design into a delivery system for a small, high-performing hackathon team. It defines the architecture boundary, branch and pull-request sequence, quality gates, and evidence required before each merge.

The approved product specification remains the source of truth for product meaning, provider semantics, safety copy, privacy, visual direction, and acceptance criteria:

- `docs/superpowers/specs/2026-07-17-redtag-design.md`

The date in that existing filename is retained as historical context. New filenames use stable semantic names.

## Delivery principles

1. `main` is always deployable.
2. Every change reaches `main` through a focused pull request.
3. Each pull request has one reviewer-sized purpose, explicit non-goals, verification evidence, and a rollback note.
4. Tests are written with the feature, not collected in a cleanup branch.
5. Live GPT-5.6 and government-provider calls are release evidence, not mutable pull-request gates.
6. Pull-request CI uses pinned, hashed response fixtures and deterministic clocks.
7. AI extracts candidates; typed deterministic code owns routing, matching, result state, and safety-sensitive copy.
8. Provider outages, incomplete retrieval, and model failures remain operational states and can never become `no_match_found`.
9. Visual refinement cannot change provider meaning, matching rules, or safety copy without a separate safety review.
10. Process exists to preserve evidence and speed. There is no `develop` branch, merge queue, release train, or ceremony that does not protect the product.

## Target architecture

RedTag is a single Next.js App Router application with four internal boundaries:

```text
Browser
  |
  | capture, upload, manual identifiers
  v
features/scan + app/
  |
  | validated application commands
  v
application/
  |                \
  |                 \ server-only ports
  v                  v
domain/            server/
pure rules         images, OpenAI, providers, cache, security
  |                  |
  +--------+---------+
           |
           v
typed evidence sheets and source-linked actions
```

- `src/domain/` contains pure contracts, identifier rules, provider-specific matching, summary precedence, and app-authored copy policy.
- `src/application/` contains use cases and dependency-injection ports. It coordinates work without importing React, Next.js request objects, provider SDK response types, or environment variables.
- `src/server/` contains server-only OpenAI, image-sanitization, provider, recorded-response, cache, rate-limit, timeout, and telemetry adapters.
- `src/features/` and `src/app/` contain the mobile-first Universal Scan experience and two thin HTTP route handlers.
- `tests/` mirrors behavioral boundaries: unit, contract, security, release, end-to-end, visual, evaluation, and targeted property suites.

The application has two public scan endpoints:

```text
POST /api/scan/extract
  sanitized evidence image(s) -> schema-valid identity candidates

POST /api/scan/evaluate
  user-confirmed category and identifiers -> deterministic provider evaluation
```

No model tool loop, database, account system, native application, global state library, or background monitoring is part of the hackathon MVP.

## Implementation-plan sequence

Plans are intentionally authored at the boundary where their upstream interfaces are stable. This avoids freezing four speculative implementations before the foundation has compiled and been reviewed.

| Plan | Outcome | Entry condition | Exit evidence |
| --- | --- | --- | --- |
| `docs/superpowers/plans/redtag-foundation.md` | A deployable Calm Guardian PWA shell, deterministic safety contracts, camera/photo/drop/manual session, fixture-only state gallery, CI, and repository governance. | Approved product specification. | Clean install, quality checks, unit/contract tests, production build, Chromium installability smoke, separately tested iOS install guidance, visual state family, and a draft preview. |
| `docs/superpowers/plans/redtag-cpsc-and-vision.md` | The complete camera/photo -> GPT-5.6 extraction -> confirmation -> CPSC evidence-sheet hero vertical. | Foundation interfaces merged and reviewed. | P0 paths 1-4, live GPT evaluation, CPSC recorded snapshot, actual-phone capture, and official-source link. |
| `docs/superpowers/plans/redtag-fda-and-nhtsa.md` | Provenance-aware FDA food enforcement matching and neutral NHTSA vehicle-type campaign discovery. | Shared provider and result contracts proven by CPSC. | P0 paths 5-9 plus provider contract and copy-policy evidence. |
| `docs/superpowers/plans/redtag-hardening-and-submission.md` | Recorded-response mode, outage behavior, privacy proof, PWA release evidence, expanded responsive/state coverage, targeted property tests, deployment, README, visuals, and demo assets. | All three provider lanes are feature complete. | P0 paths 10-15; phone, tablet, laptop, and additional-desktop rendered smoke; `insufficient_identifier`, `unsupported`, and partial/outage functional smoke; post-P0 targeted property suites; release matrix; physical-phone attestation; final visual review; public URL; and submission-ready documentation. |

Only `redtag-foundation.md` is executable from this planning checkpoint. The next plan is written from merged code and references exact stable interfaces rather than assumptions.

## Pull-request sequence

### Planning checkpoint

1. `docs/implementation-plan`
   - Documents this roadmap and the executable foundation plan, and ignores the repository-local pnpm cache.
   - Expected commit: `docs: add RedTag implementation roadmap`.

### Foundation increment

2. `chore/repository-governance`
   - Adds contribution, security, agent, pull-request, issue, editor, and dependency policies.
   - Establishes review and evidence conventions before application code.

3. `chore/app-foundation`
   - Scaffolds the pinned Next.js/TypeScript application and deterministic test harness.
   - Adds the Calm Guardian global token system, formatting, linting, type checking, production build, and fixture-only CI.

4. `feat/domain-safety-core`
   - Defines provider, evidence, result, completeness, model, and data-mode contracts.
   - Implements result precedence and prohibited-copy enforcement with pure tests.

5. `feat/universal-scan-shell`
   - Applies the Calm Guardian token system to camera/photo/desktop-drop/quiet-manual intake, the session reducer, and the accessible shell.
   - Proves the two-image ephemeral boundary, client-side metadata removal, and responsive capture path.

6. `feat/result-presentation-foundation`
   - Adds the server-gated fixture state family and reusable evidence-sheet presentation.
   - Proves that red is reserved for deterministic confirmation and that recorded fixtures cannot appear as current results.

7. `feat/pwa-accessibility-foundation`
   - Adds the manifest, icons, shell-only service worker, keyboard/live-region behavior, reduced motion, Chromium installability checks, and non-obscuring iOS Add-to-Home-Screen guidance.

8. `ci/release-quality-gates`
   - Upgrades baseline CI with coverage, real contract/security suites, PWA diagnostics, immutable action references, and CodeQL.
   - Confirms the stable required checks before provider work begins.

### CPSC and GPT-5.6 hero increment

9. `feat/secure-image-intake`
10. `feat/gpt-vision-extraction`
11. `feat/provider-platform`
12. `feat/cpsc-hero-vertical`

### Constrained provider increment

13. `feat/fda-enforcement-lane`
14. `feat/nhtsa-campaign-lane`

### Release increment

15. `feat/resilient-scan-session`
16. `security/privacy-and-abuse-controls`
17. `test/p0-release-matrix`
18. `docs/submission-readiness`

The sequence may combine two adjacent branches only when the combined diff remains reviewer-sized and both original scopes share one testable outcome. It may not combine provider semantics merely to reduce PR count.

## Branch and commit standard

Branches are short-lived and use one of these prefixes:

- `feat/`
- `fix/`
- `docs/`
- `test/`
- `refactor/`
- `chore/`
- `ci/`
- `security/`

Every branch starts from an updated `main`, pushes early as a draft pull request, and is deleted after merge. Commits use Conventional Commit subjects and each commit leaves its branch in a coherent state. Two to four commits is a healthy default for a normal feature PR; a single atomic documentation change should remain one commit.

Examples:

```text
feat(domain): define provider decision contracts
test(domain): enforce no-match completeness invariants
security(images): strip metadata before model processing
ci: add fixture-backed pull-request checks
docs: record physical-phone release evidence
```

Commits are not split to manufacture activity. They are split where a reviewer could understand or revert one coherent decision independently.

## Pull-request contract

Every pull request records:

- scope and user-visible outcome;
- explicit non-goals;
- linked issue or roadmap item;
- safety and privacy impact;
- current-query versus recorded-response impact;
- commands run and their results;
- screenshots for user-interface changes at 390x844 and 1440x900;
- fixture or live-source provenance when provider behavior changes;
- deployment or environment impact; and
- rollback procedure.

Draft PRs are opened early. A PR becomes ready only after the author reviews the complete diff, resolves every checklist item, and attaches current verification evidence.

Normal merges use a merge commit so the curated commit sequence and PR boundary remain visible. Squash merge is reserved for automated dependency updates or deliberately collapsed housekeeping. Rebase merge is disabled.

## Protection and repository settings

The `main` ruleset is configured in two phases.

### Phase 1: immediately after the repository-governance PR

Create the `main` ruleset with these controls:

- require pull requests;
- block direct pushes, force pushes, and branch deletion;
- require resolved review conversations; and
- allow zero required approving reviews while the repository has one human maintainer.

Configure these separate repository-wide pull-request settings:

- automatically delete merged branches; and
- allow merge commits as the normal merge method, keep squash only for automated or deliberately collapsed housekeeping, disable rebase merges, and leave auto-merge off.

GitHub does not allow an author to approve their own PR. Requiring one approval in a solo repository would block every merge without improving review quality. When a second reviewer joins, require one approval and add CODEOWNERS review.

### Phase 2: after CI completes its first successful run

Require these stable checks:

- `ci-quality`
- `ci-tests`
- `ci-build`
- `ci-e2e-smoke`
- `security-dependency-review`

At the same checkpoint, require the branch to be current before merge so GitHub evaluates those checks against the latest protected base.

Add the preview-deployment check only after hosting integration is stable. CodeQL runs on `main`, weekly, and manually; it does not block early pull requests.

## CI and security policy

- Pin Node and pnpm and commit `pnpm-lock.yaml`.
- Pin GitHub Actions to immutable commit SHAs while retaining version comments.
- Use minimal workflow permissions.
- Never execute repository code through `pull_request_target`.
- Pull-request tests use recorded fixtures and fake clocks; no OpenAI or mutable government API call is required to merge.
- Live GPT-5.6 and provider verification runs through a manual workflow using a protected environment.
- Enable dependency graph, Dependabot alerts, security updates, secret scanning, push protection, and private vulnerability reporting.
- Run Dependabot weekly for npm and GitHub Actions; group compatible minor and patch updates.
- Review runtime dependency updates manually and never auto-merge them.
- Store OpenAI and deployment secrets only in protected environments and hosting secret stores.
- Do not add a license until the repository owner chooses one explicitly.

## Definition of done for a feature PR

A feature PR is ready to merge only when all applicable statements are true:

1. The behavior is covered by a failing test written before the implementation.
2. Formatting, linting, type checking, unit/contract/security tests, and production build pass.
3. Provider behavior uses schema-valid fixtures with source and retrieval provenance.
4. No provider, parser, model, pagination, cap, or truncation failure can become no-match.
5. No sensitive identifier, image, OCR text, request URL, or temporary URL appears in telemetry.
6. Safety-sensitive app copy passes the prohibited-language scanner.
7. User-interface changes pass keyboard, accessibility, reduced-motion, narrow-mobile, desktop, and 200% text checks appropriate to their scope.
8. Red appears only after deterministic confirmation; green never communicates safety.
9. Current and recorded data modes are visibly distinct on every affected frame.
10. Documentation and rollback notes match the shipped behavior.

## Release evidence

Before submission, the release PR must contain or link:

- the complete fifteen-path P0 matrix;
- a physical-phone HTTPS capture attestation with commit SHA and device/browser details;
- a verified official-source action for every provider lane;
- fixture hashes and recorded-response provenance;
- a live GPT-5.6 structured-extraction evaluation;
- a live current-query smoke for each available provider;
- the required mobile and desktop state-family screenshots;
- rendered smoke at phone, tablet, laptop, and an additional desktop viewport;
- functional smoke for `insufficient_identifier`, `unsupported`, and partial-provider/outage behavior;
- targeted property-test evidence added after the fifteen deterministic P0 paths pass;
- the final Browser Annotation/Adjust visual review record;
- the public deployment URL;
- the primary Codex `/feedback` Session ID; and
- the under-three-minute narrated demo evidence.
