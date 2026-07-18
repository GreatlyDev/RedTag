# RedTag Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deployable, mobile-first RedTag PWA foundation with repository governance, deterministic safety contracts, an accessible camera/photo/manual scan session, fixture-backed visual states, and required pull-request checks.

**Architecture:** Build one Next.js App Router application with pure safety rules under `src/domain`, local ephemeral session state under `src/features/scan`, and thin routes reserved for later server-only OpenAI and provider adapters. The foundation contains no live model or government-provider call; it proves the UI, state, privacy, PWA, and CI boundaries that the CPSC/GPT-5.6 vertical will consume.

**Tech Stack:** Node.js 24, pnpm 11, Next.js 16 App Router, React 19, TypeScript strict mode, Zod, CSS variables/modules, Vitest, Testing Library, Playwright Chromium, and axe-core.

## Global Constraints

- Use Node.js `24.x`; commit `.nvmrc` with `24` and set `engines.node` to `>=24 <25`.
- Use pnpm `11.9.0`; set `packageManager` to `pnpm@11.9.0` and commit `pnpm-lock.yaml`.
- Pin production framework packages to `next@16.2.10`, `react@19.2.7`, and `react-dom@19.2.7`.
- Use the Next.js App Router and React Server Components by default; add `"use client"` only at interactive leaf boundaries.
- Use TypeScript strict mode and validate every future model/provider boundary with Zod.
- Use custom CSS variables and focused CSS modules; do not add Tailwind, shadcn/ui, a generic component kit, glassmorphism, gradient blobs, or a card-grid design language.
- Keep the application database-free and account-free for the hackathon MVP.
- Keep scan images and identifiers ephemeral; do not add browser storage, analytics payloads, or server persistence.
- A scan contains one selected item and no more than two evidence images.
- GPT-5.6 may later propose identity candidates; it may never assign outcome state, select an authoritative provider, or generate safety/remedy advice.
- Only deterministic typed code may produce result decisions.
- No provider, parser, model, pagination, cap, or truncation failure may produce `no_match_found`.
- Never use `safe`, `all clear`, `not recalled`, `no recalls`, `real-time`, `complete coverage`, `AI verified`, or agency-approval language as an outcome or positive claim. The exact required sentence `This does not establish that the product is safe or unaffected.` is the sole contextual exception.
- Red is absent before a qualifying deterministic identifier match; green and green checkmarks never communicate safety.
- Current Provider Query and Recorded Provider Response are independent, visible data modes; recorded data is never a silent fallback.
- The scan action must be visible without scrolling at `390x844`; primary touch targets are at least `44x44` CSS pixels.
- Meet WCAG AA, visible focus, keyboard navigation, reduced-motion, live-status, 200% text, and meaning-without-color requirements.
- The service worker may cache only versioned shell/static assets; it must never cache API traffic, images, identifiers, provider results, or recorded responses.
- Use test-first implementation for behavioral code and keep each commit independently passing.
- Do not rename the existing dated specification; all new filenames are semantic and undated.

### Checked-command invariant

The current Windows workspace uses Windows PowerShell 5.1, where `$ErrorActionPreference` does not promote a failing native executable to a terminating error. The planning checkpoint and Task 1 therefore inspect `$LASTEXITCODE` immediately after every native command that gates a commit, push, or merge. Task 1 then adds `scripts/invoke-checked.ps1`; every later executable PowerShell block begins by dot-sourcing it. The helper wraps `git`, `gh`, `pnpm`, `corepack`, `node`, `npx`, and `rg`, preserves their normal output, and throws on any nonzero exit. Expected-no-match scans use its dedicated `Assert-NoRgMatches` helper, which accepts only exit code `1`.

---

## Plan boundary and key-file map

This plan implements only the reusable foundation. It intentionally does not call OpenAI, CPSC, FDA, vPIC, or NHTSA. The next plan consumes the stable interfaces from Tasks 3 and 4 to build the complete CPSC/GPT-5.6 hero vertical. The task-specific **Files** lists are authoritative; this overview highlights the foundation's principal paths.

```text
.github/
  ISSUE_TEMPLATE/
    bug_report.yml                 structured defect intake
    feature_request.yml            structured product-change intake
  dependabot.yml                   weekly grouped dependency updates
  pull_request_template.md         review and evidence contract
  workflows/
    ci.yml                          quality, tests, build, browser smoke
    codeql.yml                     trusted-ref static analysis
    dependency-review.yml           dependency diff gate
.editorconfig                       cross-editor whitespace policy
.gitattributes                      line-ending and binary policy
.gitignore                          local dependency and generated-artifact exclusions
.nvmrc                              Node major
AGENTS.md                           RedTag-specific agent safety rules
CONTRIBUTING.md                     branch, commit, PR, and merge workflow
SECURITY.md                         private vulnerability-reporting guidance
package.json                        pinned runtime and verification scripts
pnpm-lock.yaml                      exact dependency graph
next.config.ts                      Next application configuration
tsconfig.json                       strict TypeScript configuration
vitest.config.ts                    jsdom unit-test configuration
playwright.config.ts                deterministic browser projects
playwright.pwa.config.ts            production PWA/cache checks
playwright.visual.config.ts         explicit fixture-gallery snapshots
tests/setup/vitest.ts               DOM matcher setup
tests/contracts/foundation/         executable application contract
tests/security/                     privacy and cache-boundary checks
tests/unit/domain/                  pure invariant coverage
tests/unit/pwa/                     installable-shell and document-security policy
tests/unit/results/                 state-to-tone and copy-registry coverage
tests/unit/scan/                    session-state coverage
tests/e2e/foundation.spec.ts        mobile, keyboard, and accessibility smoke
tests/e2e/image-privacy.spec.ts     metadata-removal and URL-revocation proof
tests/e2e/pwa.spec.ts               installability and cache-policy checks
tests/fixtures/images/              self-authored EXIF-bearing privacy fixture
tests/visual/                       phone and desktop state-family snapshots
src/app/
  dev/state-gallery/page.tsx        server-gated visual review page
  globals.css                       Calm Guardian tokens and global rules
  layout.tsx                        metadata and service-worker registration
  manifest.ts                       installable PWA metadata
  page.module.css                   landing composition
  page.tsx                          server-rendered shell
src/domain/
  evidence.ts                       confirmed identifier contracts
  providers.ts                      provider and operational-axis contracts
  results.ts                        record and scan result contracts
  matching/compose-scan-summary.ts  lossless deterministic precedence
  safety/copy-policy.ts             prohibited app-copy guard and no-match copy
src/features/scan/
  components/                       capture, provider rail, and status UI
  model/scan-reducer.ts             ephemeral scan state machine
  model/types.ts                    scan-stage and image contracts
  use-evidence-images.ts            object-URL lifecycle and two-image cap
  universal-scan.tsx                interactive feature boundary
  universal-scan.module.css         distinctive mobile-first composition
src/features/results/
  presentation-fixture.ts           typed nine-frame visual registry
  state-preview.tsx                 reusable evidence-sheet composition
  state-preview.module.css          deterministic state treatment
src/shared/service-worker-registration.tsx
src/proxy.ts                         nonce CSP and production transport policy
public/demo/evidence-label.svg       self-authored visual evidence fixture
public/icon-source.svg              self-created RedTag icon source
public/icons/icon-192.png            generated PWA icon
public/icons/icon-512.png            generated PWA icon
public/sw.template.js                build-versioned shell-cache policy
public/offline.html                  static offline fallback with no result data
scripts/generate-icons.mjs          deterministic icon generation
scripts/invoke-checked.ps1          fail-closed native-command wrappers
scripts/generate-privacy-fixture.mjs deterministic EXIF test-image generation
scripts/generate-service-worker.mjs build-identity injection for the worker
```

## Planning checkpoint closeout

Before Task 1, publish and merge the current documentation checkpoint. The branch already exists as `docs/implementation-plan`; its only changes are `.gitignore`, `docs/engineering/delivery-roadmap.md`, and `docs/superpowers/plans/redtag-foundation.md`.

Run:

```powershell
$ErrorActionPreference = "Stop"
function Assert-NativeSuccess([int]$ExitCode, [string]$Operation) {
  if ($ExitCode -ne 0) { throw "$Operation failed with exit code $ExitCode" }
}
git switch docs/implementation-plan
Assert-NativeSuccess $LASTEXITCODE "git switch docs/implementation-plan"
$initialIndex = @(git diff --cached --name-only)
Assert-NativeSuccess $LASTEXITCODE "inspect the staged index"
if ($initialIndex) { throw "Index must be empty before staging the planning checkpoint" }
git add .gitignore docs/engineering/delivery-roadmap.md docs/superpowers/plans/redtag-foundation.md
Assert-NativeSuccess $LASTEXITCODE "stage the planning checkpoint"
$expectedPaths = @(".gitignore", "docs/engineering/delivery-roadmap.md", "docs/superpowers/plans/redtag-foundation.md")
$stagedPaths = @(git diff --cached --name-only)
Assert-NativeSuccess $LASTEXITCODE "list staged planning paths"
if (Compare-Object -ReferenceObject $expectedPaths -DifferenceObject $stagedPaths) { throw "Planning checkpoint contains an unexpected staged path" }
git diff --cached --check
Assert-NativeSuccess $LASTEXITCODE "validate the staged planning diff"
rg -n -i '\bT[B]D\b|\bT[O]DO\b|implement\s+later|fill\s+in\s+details|appropriate\s+error\s+handling|handle\s+edge\s+cases|similar\s+to\s+task' docs/engineering/delivery-roadmap.md docs/superpowers/plans/redtag-foundation.md
$placeholderScanExit = $LASTEXITCODE
if ($placeholderScanExit -eq 0) { throw "Implementation-plan placeholders remain" }
if ($placeholderScanExit -ne 1) { throw "Placeholder scan failed" }
git commit -m "docs: add RedTag implementation roadmap"
Assert-NativeSuccess $LASTEXITCODE "commit the planning checkpoint"
git push -u origin docs/implementation-plan
Assert-NativeSuccess $LASTEXITCODE "push the planning branch"
gh pr create --draft --fill --base main --head docs/implementation-plan --title "docs: add the RedTag implementation roadmap"
Assert-NativeSuccess $LASTEXITCODE "open the planning pull request"
```

Expected: the cached diff contains only the three declared files, the whitespace check succeeds, the placeholder scan returns no matches, and the draft PR is open. Add the roadmap summary, foundation boundaries, verification evidence, and rollback note to the PR description; self-review the rendered Markdown, then run:

```powershell
$ErrorActionPreference = "Stop"
function Assert-NativeSuccess([int]$ExitCode, [string]$Operation) {
  if ($ExitCode -ne 0) { throw "$Operation failed with exit code $ExitCode" }
}
gh pr ready
Assert-NativeSuccess $LASTEXITCODE "mark the planning pull request ready"
gh pr merge --merge --delete-branch
Assert-NativeSuccess $LASTEXITCODE "merge the planning pull request"
git switch main
Assert-NativeSuccess $LASTEXITCODE "switch to main"
git pull --ff-only origin main
Assert-NativeSuccess $LASTEXITCODE "update main"
$remainingChanges = @(git status --porcelain)
Assert-NativeSuccess $LASTEXITCODE "inspect the post-merge worktree"
if ($remainingChanges) { throw "Worktree is not clean after merging the planning checkpoint" }
```

Expected: the planning PR is merged with a merge commit, its branch is deleted, and local `main` is clean before Task 1 starts.

### Task 1: Repository governance

**Branch:** `chore/repository-governance`

**Files:**
- Create: `.editorconfig`
- Create: `.gitattributes`
- Create: `AGENTS.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `.github/pull_request_template.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/dependabot.yml`
- Create: `scripts/invoke-checked.ps1`

**Interfaces:**
- Consumes: `docs/engineering/delivery-roadmap.md` and the approved RedTag specification.
- Produces: the repository-wide contribution contract and fail-closed PowerShell command wrapper followed by every later task.

- [ ] **Step 1: Create the branch from the latest protected base**

Run:

```powershell
$ErrorActionPreference = "Stop"
function Assert-NativeSuccess([int]$ExitCode, [string]$Operation) {
  if ($ExitCode -ne 0) { throw "$Operation failed with exit code $ExitCode" }
}
$currentChanges = @(git status --porcelain)
Assert-NativeSuccess $LASTEXITCODE "inspect the current worktree"
if ($currentChanges) { throw "Current branch must be clean before switching" }
git switch main
Assert-NativeSuccess $LASTEXITCODE "switch to main"
git pull --ff-only origin main
Assert-NativeSuccess $LASTEXITCODE "update main"
$mainChanges = @(git status --porcelain)
Assert-NativeSuccess $LASTEXITCODE "inspect main"
if ($mainChanges) { throw "main must be clean before branching" }
git switch -c chore/repository-governance
Assert-NativeSuccess $LASTEXITCODE "create the governance branch"
git status -sb
Assert-NativeSuccess $LASTEXITCODE "show the governance branch status"
```

Expected: `git status -sb` begins with `## chore/repository-governance` and reports no changes.

- [ ] **Step 2: Add editor, Git, and checked-command policy**

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Create `.gitattributes`:

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.woff2 binary
```

Create `scripts/invoke-checked.ps1`:

```powershell
$ErrorActionPreference = "Stop"

function Invoke-RedTagNative {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][object[]]$Arguments
  )

  $application = Get-Command -Name $Name -CommandType Application -ErrorAction Stop | Select-Object -First 1
  & $application.Source @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) { throw "$Name failed with exit code $exitCode" }
}

function git { Invoke-RedTagNative -Name "git" -Arguments $args }
function gh { Invoke-RedTagNative -Name "gh" -Arguments $args }
function pnpm { Invoke-RedTagNative -Name "pnpm" -Arguments $args }
function corepack { Invoke-RedTagNative -Name "corepack" -Arguments $args }
function node { Invoke-RedTagNative -Name "node" -Arguments $args }
function npx { Invoke-RedTagNative -Name "npx" -Arguments $args }
function rg { Invoke-RedTagNative -Name "rg" -Arguments $args }

function Assert-NoRgMatches {
  param(
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [Parameter(Mandatory = $true)][string]$FailureMessage
  )

  $application = Get-Command -Name "rg" -CommandType Application -ErrorAction Stop | Select-Object -First 1
  & $application.Source @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -eq 0) { throw $FailureMessage }
  if ($exitCode -ne 1) { throw "rg scan failed with exit code $exitCode" }
}
```

The wrapper resolves the underlying application explicitly, so the same-named PowerShell functions cannot recurse. Dot-sourcing this file is mandatory at the top of every later executable PowerShell block, including verification and merge blocks opened in a fresh shell process.

- [ ] **Step 3: Add the RedTag agent guardrails**

Create `AGENTS.md`:

````markdown
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
````

- [ ] **Step 4: Add contributor and security policy**

Create `CONTRIBUTING.md`:

```markdown
# Contributing to RedTag

`main` is deployable and accepts changes only through pull requests.

## Workflow

1. Update local `main` with `git pull --ff-only origin main`.
2. Create one short-lived branch using an approved prefix.
3. Write the failing test for behavioral work.
4. Commit coherent changes with Conventional Commit subjects.
5. Push early and open a draft pull request.
6. Complete the PR template, self-review the full diff, and attach verification evidence.
7. Mark ready only after required checks pass.
8. Merge with a merge commit and delete the branch.

Normal feature PRs usually contain two to four meaningful commits. One atomic documentation change remains one commit. Do not split commits to manufacture activity.

## Pull-request scope

Every PR states its outcome, non-goals, safety/privacy impact, data-mode impact, verification, screenshots when visual, and rollback. Live provider and GPT checks are release evidence; fixture-backed checks gate ordinary PRs.

## Reviews

Resolve every review conversation. A solo maintainer cannot approve their own PR, so required approvals remain zero until a second reviewer joins. The PR record, checks, and self-review still apply.
```

Create `SECURITY.md`:

```markdown
# Security Policy

Do not open a public issue for a vulnerability, exposed credential, sensitive identifier, or privacy incident. Use GitHub's private vulnerability-reporting flow for this repository.

Include the affected commit, reproduction steps, impact, and whether uploaded images, OCR text, VINs, lot codes, UPCs, temporary URLs, provider credentials, or OpenAI credentials may be involved. Do not include real user images or complete identifiers in the report; use synthetic sentinels.

RedTag has no production release line during the hackathon. Security fixes target `main` and the current public deployment.
```

- [ ] **Step 5: Add the pull-request template**

Create `.github/pull_request_template.md`:

```markdown
## Outcome

<!-- What reviewer-visible outcome does this PR deliver? -->

## Scope and non-goals

- Scope:
- Non-goals:
- Roadmap item or issue:

## Safety and privacy impact

- Result/provider semantics changed: yes / no
- Current-query or recorded-response behavior changed: yes / no
- Sensitive-data path changed: yes / no
- Prohibited-copy scan passed: yes / no / not applicable

## Verification

| Command or check    | Result |
| ------------------- | ------ |
| `pnpm format:check` |        |
| `pnpm lint`         |        |
| `pnpm typecheck`    |        |
| applicable tests    |        |
| `pnpm build`        |        |

## Visual evidence

<!-- Add 390x844 and 1440x900 screenshots for UI changes. State the data mode on every result frame. -->

## Provider or fixture provenance

<!-- Record provider, source URL, captured-at metadata, and hash when applicable. -->

## Deployment and rollback

- Environment or migration impact:
- Rollback procedure:

## Self-review

- [ ] I reviewed the full diff, including generated and configuration files.
- [ ] I added tests before behavioral implementation.
- [ ] Failures and incomplete retrieval cannot become `no_match_found`.
- [ ] Logs, traces, cache keys, and cache values contain no sensitive identifiers.
- [ ] User-facing copy preserves provider limitations and avoids safety clearance.
```

- [ ] **Step 6: Add structured issue forms**

Create `.github/ISSUE_TEMPLATE/bug_report.yml`:

```yaml
name: Bug report
description: Report a reproducible RedTag defect without real personal or product identifiers.
title: "fix: "
labels: [bug]
body:
  - type: markdown
    attributes:
      value: Never attach real user images, full VINs, lot codes, UPCs, credentials, or temporary URLs. Use the bundled demo fixtures or synthetic sentinels.
  - type: textarea
    id: behavior
    attributes:
      label: Observed behavior
      description: State the screen, provider lane, result state, retrieval completeness, model state, and data mode.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: Reproduction with safe fixture data
    validations:
      required: true
  - type: input
    id: commit
    attributes:
      label: Commit SHA or deployment URL
    validations:
      required: true
```

Create `.github/ISSUE_TEMPLATE/feature_request.yml`:

```yaml
name: Feature request
description: Propose a focused product or engineering change.
title: "feat: "
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: User problem
      description: Describe the real-world problem without prescribing a solution.
    validations:
      required: true
  - type: textarea
    id: outcome
    attributes:
      label: Desired outcome and acceptance evidence
    validations:
      required: true
  - type: dropdown
    id: boundary
    attributes:
      label: Safety-sensitive boundary
      options:
        - Matching or result meaning
        - Provider routing or source data
        - Privacy or security
        - Visual or interaction only
        - Engineering infrastructure only
    validations:
      required: true
  - type: textarea
    id: non_goals
    attributes:
      label: Non-goals
    validations:
      required: true
```

- [ ] **Step 7: Add bounded dependency automation**

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    groups:
      development-dependencies:
        dependency-type: development
        update-types: [minor, patch]
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 5
    groups:
      actions:
        update-types: [minor, patch]
```

- [ ] **Step 8: Verify and commit the governance increment**

Run:

```powershell
. ./scripts/invoke-checked.ps1
git diff --check
Assert-NoRgMatches -Arguments @("-n", "develop branch|direct pushes are allowed|auto-merge runtime", ".github", "CONTRIBUTING.md", "AGENTS.md", "SECURITY.md") -FailureMessage "Forbidden governance language remains"
git status --short
```

Expected: `git diff --check` succeeds; `rg` returns no matches; `git status` lists only the files declared in this task.

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add .editorconfig .gitattributes AGENTS.md CONTRIBUTING.md SECURITY.md .github scripts/invoke-checked.ps1
git commit -m "chore: add repository governance"
git push -u origin chore/repository-governance
gh pr create --draft --fill --base main --head chore/repository-governance --title "chore: establish RedTag repository governance"
```

Complete the pull-request template for the draft titled `chore: establish RedTag repository governance` and self-review the complete diff. This bootstrap PR precedes CI, so confirm its declared files and `git diff --check` result directly, then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: the governance PR is merged with a merge commit, its branch is deleted, and local `main` contains the merged policy before repository settings are changed.

- [ ] **Step 9: Enable repository-native security controls after merge**

In GitHub repository settings, enable the dependency graph, Dependabot alerts, Dependabot security updates, private vulnerability reporting, secret scanning, and push protection. Confirm the Security tab exposes private reporting before relying on the direction in `SECURITY.md`. Record the enabled controls in the merged PR conversation; do not include secret values or alert payloads.

Create the Phase 1 `main` ruleset at the same checkpoint: require pull requests, require resolved conversations, require zero approvals while GreatlyDev is the only human maintainer, and block force pushes and branch deletion. Required status checks and the “branch must be current” option are added only after Task 2 has produced the first successful workflow run.

Configure the repository-wide merge settings at the same checkpoint: allow merge commits; keep squash available only for automated dependency or deliberately collapsed housekeeping PRs; disable rebase merges; enable automatic deletion of merged branches; and leave auto-merge off. Task 7 reconfirms these settings after all foundation checks exist.

### Task 2: Next.js and verification foundation

**Branch:** `chore/app-foundation`

**Files:**
- Create: `.nvmrc`
- Modify: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/setup/vitest.ts`
- Create: `tests/unit/foundation/project-contract.test.ts`
- Create: `tests/e2e/foundation.spec.ts`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/dependency-review.yml`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/page.module.css`
- Create: `src/app/globals.css`
- Create: `src/app/product-copy.ts`

**Interfaces:**
- Consumes: repository policy from Task 1.
- Produces: `pnpm` scripts, strict compilation, test runners, the root layout, and a browser-testable `/` route used by every later task.

- [ ] **Step 1: Create the branch and runtime contract**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c chore/app-foundation
git status -sb
```

Expected: `git status -sb` begins with `## chore/app-foundation` and reports no changes.

Create `.nvmrc`:

```text
24
```

Create `package.json`:

```json
{
  "name": "redtag",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.9.0",
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "next typegen && tsc --noEmit",
    "test:unit": "vitest run",
    "test:contracts": "vitest run tests/contracts --passWithNoTests",
    "test:security": "vitest run tests/security --passWithNoTests",
    "test:e2e:smoke": "playwright test tests/e2e/foundation.spec.ts",
    "test:e2e": "playwright test tests/e2e",
    "verify": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:contracts && pnpm test:security && pnpm build"
  }
}
```

Create `pnpm-workspace.yaml` with an explicit reviewed-build allowlist:

```yaml
packages:
  - .

strictDepBuilds: true
allowBuilds:
  esbuild: true
  sharp: true
  unrs-resolver: true
```

`esbuild` is required by the test/build toolchain, `sharp` is the selected image re-encoder, and `unrs-resolver` is used by the Next.js ESLint resolution stack. Review the resolved package owners, integrity entries, and install scripts in `pnpm-lock.yaml`; any additional lifecycle-script package causes installation to fail until it receives an explicit reviewed entry.

- [ ] **Step 2: Install and lock the exact dependency graph**

Run:

```powershell
. ./scripts/invoke-checked.ps1
corepack prepare pnpm@11.9.0 --activate
pnpm add --save-exact next@16.2.10 react@19.2.7 react-dom@19.2.7 zod@latest sharp@latest
pnpm add -D --save-exact typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest eslint@latest eslint-config-next@16.2.10 prettier@latest vitest@latest jsdom@latest @vitejs/plugin-react@latest @testing-library/react@latest @testing-library/jest-dom@latest @playwright/test@latest @axe-core/playwright@latest
pnpm add -D --save-exact pin-github-action@3.5.1
```

Expected: `pnpm-lock.yaml` exists, every direct dependency is recorded without a range operator, `package.json` retains the pinned Next/React versions, and `pnpm install --frozen-lockfile` succeeds.

- [ ] **Step 3: Add strict TypeScript, Next.js, ESLint, and formatting configuration**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mts", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "playwright-report/**", "test-results/**"]),
]);
```

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create `.prettierignore`:

```text
.next
node_modules
playwright-report
test-results
pnpm-lock.yaml
public/icons/*.png
public/sw.js
scripts/invoke-checked.ps1
docs/engineering/
docs/superpowers/
```

Append these generated paths to `.gitignore`:

```gitignore
next-env.d.ts
*.tsbuildinfo
public/sw.js
.vercel/
```

`next typegen` creates framework route types before `tsc`; framework declarations, incremental compiler state, the generated service worker, and local hosting metadata remain untracked build artifacts.

- [ ] **Step 4: Write the failing project-contract test**

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.ts"],
    restoreMocks: true,
  },
});
```

Create `tests/setup/vitest.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `tests/unit/foundation/project-contract.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { APP_NAME, APP_PROMISE } from "@/app/product-copy";

describe("project contract", () => {
  it("exposes the approved product identity without a safety claim", () => {
    expect(APP_NAME).toBe("RedTag");
    expect(APP_PROMISE).toBe("Scan a supported item. Verify the evidence. Know what to do next.");
    expect(APP_PROMISE.toLowerCase()).not.toContain("safe");
  });
});
```

- [ ] **Step 5: Run the test and verify the missing module failure**

Run: `pnpm test:unit tests/unit/foundation/project-contract.test.ts`

Expected: FAIL because `@/app/product-copy` does not exist.

- [ ] **Step 6: Add the minimal server-rendered application shell**

Create `src/app/product-copy.ts`:

```ts
export const APP_NAME = "RedTag";
export const APP_PROMISE = "Scan a supported item. Verify the evidence. Know what to do next.";
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { APP_NAME, APP_PROMISE } from "./product-copy";
import "./globals.css";

const bodyFont = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const monoFont = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_PROMISE,
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f0e7",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
import styles from "./page.module.css";
import { APP_NAME, APP_PROMISE } from "./product-copy";

export default function HomePage() {
  return (
    <main className={styles.shell}>
      <header className={styles.masthead}>
        <a className={styles.wordmark} href="#scan" aria-label="RedTag home">
          {APP_NAME}
        </a>
        <span className={styles.scope}>U.S. recall record guide</span>
      </header>
      <section id="scan" className={styles.hero} aria-labelledby="scan-heading">
        <p className={styles.eyebrow}>Universal Scan</p>
        <h1 id="scan-heading">Evidence first. Answers you can trace.</h1>
        <p>{APP_PROMISE}</p>
        <button type="button">Scan with camera</button>
        <button type="button">Choose from photos</button>
      </section>
    </main>
  );
}
```

Create `src/app/globals.css`:

```css
:root {
  --paper: #f5f0e7;
  --surface: #fffdf8;
  --ink: #1f2925;
  --muted: #6d746d;
  --line: #d9d1c4;
  --sage: #486154;
  --sage-soft: #dfe9df;
  --neutral-info: #53646b;
  --neutral-info-soft: #e3e9ea;
  --amber: #8a6422;
  --amber-ink: #6d4b12;
  --amber-soft: #f2dfb8;
  --recall: #b9473d;
  --recall-ink: #8f2f29;
  --recall-soft: #f3dcd7;
  --focus: #184d66;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --radius-control: 12px;
  --radius-card: 18px;
  --radius-hero: 24px;
  --shadow-elevated: 0 12px 36px rgba(31, 41, 37, 0.08);
  color-scheme: light;
  font-family: var(--font-body), Inter, system-ui, sans-serif;
  background: var(--paper);
  color: var(--ink);
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--paper);
}

body {
  margin: 0;
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Create `src/app/page.module.css`:

```css
.shell {
  width: min(100%, 76rem);
  min-height: 100vh;
  margin: 0 auto;
  padding: var(--space-4);
}

.masthead {
  display: flex;
  min-height: 3rem;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
}

.wordmark {
  color: var(--ink);
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.scope,
.eyebrow {
  color: var(--neutral-info);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero {
  display: grid;
  min-height: calc(100vh - 5rem);
  align-content: center;
  gap: var(--space-4);
  max-width: 48rem;
}

.hero h1 {
  max-width: 13ch;
  margin: 0;
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: clamp(2.4rem, 9vw, 5.5rem);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.hero p {
  max-width: 42rem;
  margin: 0;
  color: var(--neutral-info);
  font-size: 1.08rem;
  line-height: 1.55;
}

.hero button {
  width: fit-content;
  min-height: 3.25rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
  background: var(--ink);
  color: var(--paper);
  font-weight: 750;
}
```

- [ ] **Step 7: Run the unit test and production checks**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/foundation/project-contract.test.ts
pnpm typecheck
pnpm lint
pnpm build
git status --short
```

Expected: formatting is stable, the unit test passes, TypeScript and ESLint report no errors, Next.js produces a successful production build with `/` rendered, and `git status` contains no path outside the files declared for Task 2.

Commit the first coherent application checkpoint, push it, and open the draft PR before adding browser and hosted-CI behavior:

```powershell
. ./scripts/invoke-checked.ps1
git add .nvmrc .gitignore package.json pnpm-workspace.yaml pnpm-lock.yaml next.config.ts tsconfig.json eslint.config.mjs .prettierrc.json .prettierignore vitest.config.ts tests/setup tests/unit src
git commit -m "chore: scaffold the RedTag application"
git push -u origin chore/app-foundation
gh pr create --draft --fill --base main --head chore/app-foundation --title "chore: establish the RedTag application foundation"
```

Expected: the draft PR exists after a passing unit/type/lint/build checkpoint. Complete the repository pull-request template before requesting review.

- [ ] **Step 8: Add the failing narrow-mobile browser smoke**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : { webServer: {
        command: "pnpm dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
      } }),
  projects: [
    { name: "mobile-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
```

Create `tests/e2e/foundation.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("shows the primary scan action above the fold without serious accessibility findings", async ({ page }) => {
  await page.goto("/");
  const viewportHeight = page.viewportSize()?.height ?? 0;
  for (const name of ["Scan with camera", "Choose from photos"]) {
    const action = page.getByRole("button", { name });
    await expect(action).toBeVisible();
    const box = await action.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? viewportHeight) + (box?.height ?? 0)).toBeLessThanOrEqual(viewportHeight);
  }
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
});
```

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm exec playwright install chromium
pnpm test:e2e:smoke
```

Expected: both mobile and desktop projects pass. If the first baseline places the action below 844 CSS pixels, reduce hero spacing or type scale without changing the information hierarchy, then rerun.

- [ ] **Step 9: Add baseline pull-request checks before feature branches begin**

Create `.github/workflows/ci.yml`:

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  quality:
    name: ci-quality
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck

  tests:
    name: ci-tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit

  build:
    name: ci-build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  e2e-smoke:
    name: ci-e2e-smoke
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e:smoke
```

Create `.github/workflows/dependency-review.yml`:

```yaml
name: security

on:
  pull_request:

permissions:
  contents: read

jobs:
  dependency-review:
    name: security-dependency-review
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: actions/dependency-review-action@v5
        with:
          fail-on-severity: high
```

Resolve the reviewed major tags before committing:

```powershell
. ./scripts/invoke-checked.ps1
pnpm exec pin-github-action .github/workflows/ci.yml
pnpm exec pin-github-action .github/workflows/dependency-review.yml
Assert-NoRgMatches -Arguments @("-n", '^\s*-\s+uses:\s+[^#\s]+@v[0-9]', ".github/workflows") -FailureMessage "Mutable action tags remain"
```

Expected: the no-match assertion passes and every `uses:` line contains a 40-character SHA with its reviewed major in a comment.

- [ ] **Step 10: Format, verify, and commit the foundation**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm verify
pnpm test:e2e:smoke
git diff --check
```

Expected: every command exits zero.

Commit the browser and hosted verification harness separately from the already-published scaffold:

```powershell
. ./scripts/invoke-checked.ps1
git add package.json pnpm-lock.yaml playwright.config.ts tests/e2e .github/workflows
git commit -m "ci: establish the foundation verification harness"
git status --short
git push
```

Expected: the second commit succeeds and `git status --short` is empty before the branch is pushed.

Update the existing draft PR titled `chore: establish the RedTag application foundation` with the local verification results. Complete its template, self-review the full diff, resolve every conversation, then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: all five baseline checks are green, the PR is merged with a merge commit, the branch is deleted, and local `main` contains the verification foundation.

- [ ] **Step 11: Activate stable required checks after the first green run**

After the foundation PR completes and merges, update the existing `main` ruleset to require `ci-quality`, `ci-tests`, `ci-build`, `ci-e2e-smoke`, and `security-dependency-review`, then require branches to be current before merge. Confirm the next real feature PR is blocked while any one of those checks is pending.

### Task 3: Deterministic domain safety core

**Branch:** `feat/domain-safety-core`

**Files:**
- Create: `src/domain/providers.ts`
- Create: `src/domain/evidence.ts`
- Create: `src/domain/results.ts`
- Create: `src/domain/matching/compose-scan-summary.ts`
- Create: `src/domain/safety/copy-policy.ts`
- Create: `tests/unit/domain/compose-scan-summary.test.ts`
- Create: `tests/unit/domain/copy-policy.test.ts`

**Interfaces:**
- Consumes: no framework or network type; all inputs are immutable plain TypeScript values.
- Produces: `ProviderId`, `RetrievalStatus`, `ConfirmedIdentifier`, `RecordDecision`, `ScanSummary`, `composeScanSummary(input)`, `assertAppCopyAllowed(copy)`, and `formatNoMatchCopy(retrieval, retrievedAt)` for every provider and UI plan.

- [ ] **Step 0: Create the branch from the latest protected base**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c feat/domain-safety-core
git status -sb
```

Expected: `git status -sb` begins with `## feat/domain-safety-core` and reports no changes.

- [ ] **Step 1: Write the failing summary-precedence tests**

Create `tests/unit/domain/compose-scan-summary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { composeScanSummary } from "@/domain/matching/compose-scan-summary";
import type { DataMode } from "@/domain/providers";
import type { RecordDecision, ResultDecision } from "@/domain/results";

const completeRetrieval = {
  completeness: "complete" as const,
  requiredQueries: 1,
  completedQueries: 1,
  fullyCompletedProviderIds: ["cpsc"] as const,
  capped: false,
  truncated: false,
};

function decision(id: string, result: ResultDecision, dataMode: DataMode = "current_query"): RecordDecision {
  const common = {
    id,
    providerRecordId: `record-${id}`,
    sourceUrl: `https://example.gov/records/${id}`,
    matchedFields: [],
    conflictingFields: [],
    unknownFields: [],
    ruleVersion: "foundation-v1",
    limitations: [],
    retrieval: completeRetrieval,
    modelState: "model_ready" as const,
    assistanceMode: "assisted" as const,
    dataMode,
  };

  if (result === "vehicle_campaigns_found") {
    return {
      ...common,
      provider: "nhtsa",
      result,
      allowedActions: ["open_nhtsa_vin_lookup"],
    };
  }

  if (result === "possible_match") {
    return {
      ...common,
      provider: "cpsc",
      result,
      possibleMatchReason: "user_evidence_missing",
      allowedActions: ["add_evidence", "open_official_source"],
    };
  }

  return {
    ...common,
    provider: "cpsc",
    result,
    allowedActions: ["open_official_source"],
  };
}

describe("composeScanSummary", () => {
  it("keeps the workflow not evaluated when no provider completed", () => {
    const summary = composeScanSummary({
      decisions: [],
      retrieval: { ...completeRetrieval, completeness: "unavailable", completedQueries: 0, fullyCompletedProviderIds: [] },
      modelState: "model_unavailable",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("not_evaluated");
  });

  it("gives confirmed match precedence without deleting lower-precedence decisions", () => {
    const summary = composeScanSummary({
      decisions: [decision("possible", "possible_match"), decision("confirmed", "confirmed_match")],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("confirmed_match");
    expect(summary.decisionIds).toEqual(["possible", "confirmed"]);
    expect(summary.counts).toMatchObject({ confirmed_match: 1, possible_match: 1 });
  });

  it("gives possible match precedence over an identifier conflict", () => {
    const summary = composeScanSummary({
      decisions: [
        decision("conflict", "identifier_conflict", "recorded_response"),
        decision("possible", "possible_match", "recorded_response"),
      ],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "recorded_response",
    });

    expect(summary.state).toBe("possible_match");
    expect(summary.dataMode).toBe("recorded_response");
  });

  it("allows no match only after complete uncapped and untruncated retrieval", () => {
    const complete = composeScanSummary({
      decisions: [],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });
    const partial = composeScanSummary({
      decisions: [],
      retrieval: { ...completeRetrieval, completeness: "partial", fullyCompletedProviderIds: [], truncated: true },
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
    });

    expect(complete.state).toBe("no_match_found");
    expect(partial.state).toBe("not_evaluated");
  });

  it("preserves a valid record decision when another required query is incomplete", () => {
    const summary = composeScanSummary({
      decisions: [decision("confirmed", "confirmed_match")],
      retrieval: {
        ...completeRetrieval,
        completeness: "partial",
        requiredQueries: 2,
        completedQueries: 1,
        fullyCompletedProviderIds: [],
        truncated: true,
      },
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe("confirmed_match");
    expect(summary.retrieval.completeness).toBe("partial");
  });

  it("preserves deterministic pre-evaluation endings", () => {
    const summary = composeScanSummary({
      decisions: [],
      retrieval: {
        ...completeRetrieval,
        completeness: "unavailable",
        requiredQueries: 0,
        completedQueries: 0,
        fullyCompletedProviderIds: [],
      },
      modelState: "model_ready",
      assistanceMode: "manual_mode",
      dataMode: "current_query",
      preEvaluationState: "unsupported",
    });

    expect(summary.state).toBe("unsupported");
  });

  it.each([
    ["identifier_conflict", "identifier_conflict"],
    ["vehicle_campaigns_found", "vehicle_campaigns_found"],
  ] as const)("preserves the %s terminal family", (result, expected) => {
    const summary = composeScanSummary({
      decisions: [decision(result, result)],
      retrieval: completeRetrieval,
      modelState: "model_ready",
      assistanceMode: "assisted",
      dataMode: "current_query",
    });

    expect(summary.state).toBe(expected);
  });

  it("rejects a zero-query retrieval labeled complete", () => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: { ...completeRetrieval, requiredQueries: 0, completedQueries: 0 },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/complete retrieval/);
  });

  it.each([
    ["negative", { requiredQueries: -1, completedQueries: 0 }],
    ["fractional", { requiredQueries: 1, completedQueries: 0.5 }],
    ["inverted", { requiredQueries: 1, completedQueries: 2 }],
  ] as const)("rejects %s retrieval counts", (_label, counts) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: { ...completeRetrieval, ...counts },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/query counts/);
  });

  it.each([
    ["capped", { capped: true }],
    ["truncated", { truncated: true }],
    ["incomplete", { completedQueries: 0 }],
    ["unnamed", { fullyCompletedProviderIds: [] }],
  ] as const)("rejects a complete retrieval that is %s", (_label, override) => {
    expect(() =>
      composeScanSummary({
        decisions: [],
        retrieval: { ...completeRetrieval, ...override },
        modelState: "model_ready",
        assistanceMode: "manual_mode",
        dataMode: "current_query",
      }),
    ).toThrow(/complete retrieval/);
  });

  it("rejects stale pre-evaluation state after a record decision", () => {
    expect(() =>
      composeScanSummary({
        decisions: [decision("confirmed", "confirmed_match")],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
        preEvaluationState: "unsupported",
      }),
    ).toThrow(/pre-evaluation/);
  });

  it("rejects a decision whose data mode disagrees with the scan", () => {
    expect(() =>
      composeScanSummary({
        decisions: [decision("possible", "possible_match", "recorded_response")],
        retrieval: completeRetrieval,
        modelState: "model_ready",
        assistanceMode: "assisted",
        dataMode: "current_query",
      }),
    ).toThrow(/operational axes/);
  });
});
```

- [ ] **Step 2: Run the summary tests and verify the missing-module failure**

Run: `pnpm test:unit tests/unit/domain/compose-scan-summary.test.ts`

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 3: Define provider, evidence, and result contracts**

Create `src/domain/providers.ts`:

```ts
export const PROVIDER_IDS = ["cpsc", "fda_food", "nhtsa"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type RetrievalCompleteness = "complete" | "partial" | "unavailable";
export type ModelState = "model_ready" | "model_unavailable";
export type AssistanceMode = "assisted" | "manual_mode";
export type DataMode = "current_query" | "recorded_response";

export interface RetrievalStatus {
  readonly completeness: RetrievalCompleteness;
  readonly requiredQueries: number;
  readonly completedQueries: number;
  readonly fullyCompletedProviderIds: readonly ProviderId[];
  readonly capped: boolean;
  readonly truncated: boolean;
}
```

Create `src/domain/evidence.ts`:

```ts
export const IDENTIFIER_KINDS = [
  "brand",
  "product_name",
  "manufacturer",
  "product_type",
  "model",
  "upc_gtin",
  "lot_batch",
  "serial",
  "date",
  "size",
  "variant",
  "vin",
] as const;

export type IdentifierKind = (typeof IDENTIFIER_KINDS)[number];

export interface ConfirmedIdentifier {
  readonly id: string;
  readonly kind: IdentifierKind;
  readonly raw: string;
  readonly normalized: string;
  readonly userConfirmed: boolean;
  readonly sourceImageId?: string;
  readonly quotedText?: string;
  readonly ambiguityNote?: string;
}

export interface FieldComparison {
  readonly kind: IdentifierKind;
  readonly userValue: string;
  readonly officialValue: string | null;
  readonly provenance: string;
}
```

Create `src/domain/results.ts`:

```ts
import type { FieldComparison, IdentifierKind } from "./evidence";
import type { AssistanceMode, DataMode, ModelState, ProviderId, RetrievalStatus } from "./providers";

export type ResultDecision =
  | "confirmed_match"
  | "possible_match"
  | "identifier_conflict"
  | "vehicle_campaigns_found";

export type ScanState =
  | "not_evaluated"
  | ResultDecision
  | "no_match_found"
  | "insufficient_identifier"
  | "unsupported";

export type PossibleMatchReason = "user_evidence_missing" | "record_not_unit_verifiable";
export type AllowedAction = "add_evidence" | "retry_source" | "open_official_source" | "open_nhtsa_vin_lookup";

interface DecisionBase<P extends ProviderId> {
  readonly id: string;
  readonly provider: P;
  readonly providerRecordId: string;
  readonly providerProductEntryId?: string;
  readonly sourceUrl: string;
  readonly matchedFields: readonly FieldComparison[];
  readonly conflictingFields: readonly FieldComparison[];
  readonly unknownFields: readonly IdentifierKind[];
  readonly ruleVersion: string;
  readonly limitations: readonly string[];
  readonly allowedActions: readonly AllowedAction[];
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
}

type MatchProviderId = Exclude<ProviderId, "nhtsa">;

export type RecordDecision =
  | (DecisionBase<MatchProviderId> & {
      readonly result: "confirmed_match";
      readonly possibleMatchReason?: never;
    })
  | (DecisionBase<MatchProviderId> & {
      readonly result: "possible_match";
      readonly possibleMatchReason: PossibleMatchReason;
    })
  | (DecisionBase<MatchProviderId> & {
      readonly result: "identifier_conflict";
      readonly possibleMatchReason?: never;
    })
  | (DecisionBase<"nhtsa"> & {
      readonly result: "vehicle_campaigns_found";
      readonly possibleMatchReason?: never;
      readonly allowedActions: readonly ["open_nhtsa_vin_lookup", ...AllowedAction[]];
    });

export type DecisionCounts = Readonly<Record<ResultDecision, number>>;

export interface ScanSummary {
  readonly state: ScanState;
  readonly decisionIds: readonly string[];
  readonly counts: DecisionCounts;
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
  readonly summaryRuleVersion: "summary-v1";
}
```

- [ ] **Step 4: Implement the minimal lossless summary composer**

Create `src/domain/matching/compose-scan-summary.ts`:

```ts
import type { AssistanceMode, DataMode, ModelState, RetrievalStatus } from "../providers";
import type { DecisionCounts, RecordDecision, ResultDecision, ScanState, ScanSummary } from "../results";

export interface ComposeScanSummaryInput {
  readonly decisions: readonly RecordDecision[];
  readonly retrieval: RetrievalStatus;
  readonly modelState: ModelState;
  readonly assistanceMode: AssistanceMode;
  readonly dataMode: DataMode;
  readonly preEvaluationState?: "insufficient_identifier" | "unsupported";
}

const PRECEDENCE: readonly ResultDecision[] = [
  "confirmed_match",
  "possible_match",
  "identifier_conflict",
  "vehicle_campaigns_found",
];

function countDecisions(decisions: readonly RecordDecision[]): DecisionCounts {
  const counts: Record<ResultDecision, number> = {
    confirmed_match: 0,
    possible_match: 0,
    identifier_conflict: 0,
    vehicle_campaigns_found: 0,
  };

  for (const decision of decisions) counts[decision.result] += 1;
  return counts;
}

function validateInput(input: ComposeScanSummaryInput): void {
  const { retrieval } = input;
  const countsAreValid =
    Number.isInteger(retrieval.requiredQueries) &&
    Number.isInteger(retrieval.completedQueries) &&
    retrieval.requiredQueries >= 0 &&
    retrieval.completedQueries >= 0 &&
    retrieval.completedQueries <= retrieval.requiredQueries;
  if (!countsAreValid) throw new Error("Retrieval query counts are inconsistent");

  const completeIsValid =
    retrieval.completeness !== "complete" ||
    (retrieval.requiredQueries > 0 &&
      retrieval.completedQueries === retrieval.requiredQueries &&
      retrieval.fullyCompletedProviderIds.length > 0 &&
      !retrieval.capped &&
      !retrieval.truncated);
  if (!completeIsValid) throw new Error("A complete retrieval requires completed uncapped and untruncated queries");

  if (
    input.preEvaluationState &&
    (input.decisions.length > 0 || retrieval.completedQueries > 0 || retrieval.fullyCompletedProviderIds.length > 0)
  ) {
    throw new Error("A pre-evaluation state cannot coexist with provider evaluation");
  }

  const axesMatch = input.decisions.every(
    (decision) =>
      decision.modelState === input.modelState &&
      decision.assistanceMode === input.assistanceMode &&
      decision.dataMode === input.dataMode,
  );
  if (!axesMatch) throw new Error("Record-decision operational axes must match the scan summary");
}

function deriveState(input: ComposeScanSummaryInput, counts: DecisionCounts): ScanState {
  if (input.preEvaluationState) return input.preEvaluationState;
  const candidateState = PRECEDENCE.find((state) => counts[state] > 0);
  if (candidateState) return candidateState;

  if (input.retrieval.fullyCompletedProviderIds.length === 0) return "not_evaluated";

  const retrievalIsComplete =
    input.retrieval.completeness === "complete" &&
    input.retrieval.requiredQueries > 0 &&
    input.retrieval.requiredQueries === input.retrieval.completedQueries &&
    !input.retrieval.capped &&
    !input.retrieval.truncated;

  return retrievalIsComplete ? "no_match_found" : "not_evaluated";
}

export function composeScanSummary(input: ComposeScanSummaryInput): ScanSummary {
  validateInput(input);
  const counts = countDecisions(input.decisions);
  return {
    state: deriveState(input, counts),
    decisionIds: input.decisions.map(({ id }) => id),
    counts,
    retrieval: input.retrieval,
    modelState: input.modelState,
    assistanceMode: input.assistanceMode,
    dataMode: input.dataMode,
    summaryRuleVersion: "summary-v1",
  };
}
```

- [ ] **Step 5: Run the summary suite and commit the contracts**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/domain/compose-scan-summary.test.ts
```

Expected: all eighteen summary cases pass, including invalid query-count and falsely complete retrieval branches.

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add src/domain/providers.ts src/domain/evidence.ts src/domain/results.ts src/domain/matching tests/unit/domain/compose-scan-summary.test.ts
git commit -m "feat(domain): define deterministic result contracts"
git push -u origin feat/domain-safety-core
gh pr create --draft --fill --base main --head feat/domain-safety-core --title "feat(domain): establish RedTag safety contracts"
```

Expected: the draft PR is open after the deterministic contracts and all eighteen summary cases pass. Complete its repository template while the copy-policy work continues.

- [ ] **Step 6: Write the failing copy-policy tests**

Create `tests/unit/domain/copy-policy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assertAppCopyAllowed, formatNoMatchCopy } from "@/domain/safety/copy-policy";

describe("app-authored safety copy", () => {
  it.each([
    "This product is safe.",
    "All clear",
    "Not recalled",
    "No recalls found",
    "Real-time recall coverage",
    "Complete coverage",
    "AI verified",
    "CPSC approved",
    "Approved by FDA",
    "This VIN has an open recall.",
    "VIN 1HGCM82633A004352 has no open recalls.",
    "There is an open recall on this VIN.",
    "This VIN has an unrepaired recall.",
    "There are unrepaired recalls on this VIN.",
  ])("rejects prohibited language: %s", (copy) => {
    expect(() => assertAppCopyAllowed(copy)).toThrow(/Prohibited app-authored copy/);
  });

  it("allows the exact non-safety no-match template", () => {
    const retrieval = {
      completeness: "complete" as const,
      requiredQueries: 1,
      completedQueries: 1,
      fullyCompletedProviderIds: ["cpsc"] as const,
      capped: false,
      truncated: false,
    };
    const copy = formatNoMatchCopy(retrieval, new Date("2026-01-02T03:04:05.000Z"));
    expect(copy).toBe(
      "No matching record was found in all named sources that completed successfully as of 2026-01-02T03:04:05.000Z. This does not establish that the product is safe or unaffected. Sources completed: CPSC.",
    );
    expect(() => assertAppCopyAllowed(copy)).not.toThrow();
  });

  it.each([
    ["partial", { completeness: "partial", capped: false, truncated: false }],
    ["capped", { completeness: "complete", capped: true, truncated: false }],
    ["truncated", { completeness: "complete", capped: false, truncated: true }],
  ] as const)("refuses no-match copy for a %s retrieval", (_label, status) => {
    expect(() =>
      formatNoMatchCopy(
        {
          ...status,
          requiredQueries: 1,
          completedQueries: 1,
          fullyCompletedProviderIds: ["cpsc"],
        },
        new Date(),
      ),
    ).toThrow(/complete retrieval/);
  });

  it("requires at least one completed named source", () => {
    expect(() =>
      formatNoMatchCopy(
        {
          completeness: "complete",
          requiredQueries: 1,
          completedQueries: 1,
          fullyCompletedProviderIds: [],
          capped: false,
          truncated: false,
        },
        new Date(),
      ),
    ).toThrow(/completed source/);
  });
});
```

- [ ] **Step 7: Run the copy test and verify the missing-module failure**

Run: `pnpm test:unit tests/unit/domain/copy-policy.test.ts`

Expected: FAIL because `copy-policy.ts` does not exist.

- [ ] **Step 8: Implement the app-copy boundary and exact no-match formatter**

Create `src/domain/safety/copy-policy.ts`:

```ts
import type { ProviderId, RetrievalStatus } from "../providers";

const REQUIRED_NO_MATCH_DISCLAIMER = "This does not establish that the product is safe or unaffected.";

const PROVIDER_NAMES: Readonly<Record<ProviderId, string>> = {
  cpsc: "CPSC",
  fda_food: "FDA food enforcement",
  nhtsa: "NHTSA",
};

const PROHIBITED_APP_COPY: readonly RegExp[] = [
  /\ball clear\b/i,
  /\bnot recalled\b/i,
  /\bno recalls?\b/i,
  /\breal[- ]time\b/i,
  /\bcomplete coverage\b/i,
  /\bai verified\b/i,
  /\b(?:cpsc|fda|nhtsa)[- ]approved\b/i,
  /\bapproved by (?:cpsc|fda|nhtsa)\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?open recalls?\b/i,
  /\b(?:no\s+)?open recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bvin(?:\s+[a-hj-npr-z0-9-]{6,})?\s+(?:has|shows|carries)\s+(?:(?:an?|one or more|no)\s+)?unrepaired recalls?\b/i,
  /\bunrepaired recalls?\s+(?:for|on)\s+(?:(?:this|your|the|a specific)\s+)?vin\b/i,
  /\bsafe\b/i,
];

export function assertAppCopyAllowed(copy: string): void {
  const copyWithoutRequiredDisclaimer = copy.replace(REQUIRED_NO_MATCH_DISCLAIMER, "");
  const violation = PROHIBITED_APP_COPY.find((pattern) => pattern.test(copyWithoutRequiredDisclaimer));
  if (violation) throw new Error(`Prohibited app-authored copy matched ${violation.source}`);
}

export function formatNoMatchCopy(retrieval: RetrievalStatus, retrievedAt: Date): string {
  const isComplete =
    retrieval.completeness === "complete" &&
    retrieval.requiredQueries > 0 &&
    retrieval.requiredQueries === retrieval.completedQueries &&
    !retrieval.capped &&
    !retrieval.truncated;
  if (!isComplete || retrieval.fullyCompletedProviderIds.length === 0) {
    throw new Error("No-match copy requires at least one completed source and complete retrieval");
  }
  const names = retrieval.fullyCompletedProviderIds.map((provider) => PROVIDER_NAMES[provider]);
  const copy = `No matching record was found in all named sources that completed successfully as of ${retrievedAt.toISOString()}. This does not establish that the product is safe or unaffected. Sources completed: ${names.join(", ")}.`;

  return copy;
}
```

- [ ] **Step 9: Run the domain suite and verify type consistency**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/domain
pnpm typecheck
pnpm lint
```

Expected: every domain test passes and no type or lint error is reported.

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add src/domain/safety tests/unit/domain/copy-policy.test.ts
git commit -m "test(domain): enforce outcome and copy invariants"
git push
```

Push the second commit. The draft PR titled `feat(domain): establish RedTag safety contracts` was opened after the first passing domain commit; update its description to call out that the no-match disclaimer is a single approved exception to the general word-level copy scanner. Complete the template and self-review, then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: required checks are green, the contracts PR is merged with a merge commit, the branch is deleted, and the next task branches from the merged domain interfaces.

### Task 4: Ephemeral Universal Scan session

**Branch:** `feat/universal-scan-shell`

**Files:**
- Create: `src/features/scan/model/types.ts`
- Create: `src/features/scan/model/scan-reducer.ts`
- Create: `src/features/scan/sanitize-client-image.ts`
- Create: `src/features/scan/use-evidence-images.ts`
- Create: `src/features/scan/universal-scan.tsx`
- Create: `src/features/scan/universal-scan.module.css`
- Create: `src/features/scan/components/provider-rail.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.module.css`
- Create: `tests/unit/scan/scan-reducer.test.ts`
- Create: `tests/unit/scan/sanitize-client-image.test.ts`
- Create: `tests/unit/scan/use-evidence-images.test.tsx`
- Create: `tests/unit/scan/universal-scan.test.tsx`
- Create: `scripts/generate-privacy-fixture.mjs`
- Create: `tests/fixtures/images/exif-location.jpg`
- Create: `tests/e2e/image-privacy.spec.ts`
- Modify: `tests/e2e/foundation.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ProviderId` from `src/domain/providers.ts` and the global Calm Guardian tokens from Task 2.
- Produces: `ScanSessionState`, `scanReducer`, `initialScanSession`, and the client-only `UniversalScan` surface. The next plan adds API calls behind these feature boundaries without changing capture semantics.

- [ ] **Step 0: Create the branch from the latest protected base**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c feat/universal-scan-shell
git status -sb
```

Expected: `git status -sb` begins with `## feat/universal-scan-shell` and reports no changes.

- [ ] **Step 1: Write the failing scan-state tests**

Create `tests/unit/scan/scan-reducer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialScanSession, scanReducer } from "@/features/scan/model/scan-reducer";
import type { EvidenceImage } from "@/features/scan/model/types";

function image(id: string): EvidenceImage {
  return {
    id,
    name: `${id}.jpg`,
    mimeType: "image/jpeg",
    size: 1024,
    objectUrl: `blob:${id}`,
  };
}

describe("scanReducer", () => {
  it("keeps no more than two evidence images", () => {
    const state = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "photos",
      images: [image("one"), image("two"), image("three")],
    });

    expect(state.images.map(({ id }) => id)).toEqual(["one", "two"]);
    expect(state.notice).toBe("Two images maximum. Remove one before adding another.");
  });

  it("reports an oversized selection even when accepted files fit the remaining slots", () => {
    const state = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "photos",
      images: [image("one")],
      selectionExceeded: true,
    });

    expect(state.images.map(({ id }) => id)).toEqual(["one"]);
    expect(state.notice).toBe("Two images maximum. Remove one before adding another.");
  });

  it("keeps manual identifiers editable and advances only to evidence review", () => {
    const edited = scanReducer(initialScanSession(), { type: "manual_value_changed", value: "  ABC-123  " });
    const continued = scanReducer(edited, { type: "manual_submitted" });

    expect(continued.manualValue).toBe("ABC-123");
    expect(continued.stage).toBe("complete_proof");
    expect(continued.inputMode).toBe("manual");
  });

  it("does not submit an empty manual identifier", () => {
    const state = scanReducer(initialScanSession(), { type: "manual_submitted" });

    expect(state.stage).toBe("capture");
    expect(state.notice).toBe("Enter a model, UPC or GTIN, lot code, date, or VIN.");
  });

  it("resets every ephemeral field", () => {
    const withImage = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("one")],
    });

    expect(scanReducer(withImage, { type: "reset" })).toEqual(initialScanSession());
  });

  it("returns to capture when the final image is removed", () => {
    const withImage = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("one")],
    });
    const removed = scanReducer(withImage, { type: "image_removed", id: "one" });

    expect(removed.images).toEqual([]);
    expect(removed.stage).toBe("capture");
    expect(removed.inputMode).toBeNull();
  });

  it("preserves the active capture stage and mode when one image remains", () => {
    const withImages = scanReducer(initialScanSession(), {
      type: "images_added",
      inputMode: "camera",
      images: [image("one"), image("two")],
    });
    const removed = scanReducer(withImages, { type: "image_removed", id: "one" });

    expect(removed.images.map(({ id }) => id)).toEqual(["two"]);
    expect(removed.stage).toBe("understand");
    expect(removed.inputMode).toBe("camera");
  });

  it("demotes an emptied manual session and covers explicit notices", () => {
    const submitted = scanReducer(
      scanReducer(initialScanSession(), { type: "manual_value_changed", value: "ABC-123" }),
      { type: "manual_submitted" },
    );
    const emptied = scanReducer(submitted, { type: "manual_value_changed", value: "" });
    const noticed = scanReducer(emptied, { type: "notice_set", notice: "Try another photo." });
    const cleared = scanReducer(noticed, { type: "notice_cleared" });
    const routed = scanReducer(cleared, { type: "provider_selected", provider: "cpsc" });

    expect(emptied).toMatchObject({ stage: "capture", inputMode: null });
    expect(cleared.notice).toBeNull();
    expect(routed.selectedProvider).toBe("cpsc");
  });
});
```

- [ ] **Step 2: Run the reducer tests and verify the missing-module failure**

Run: `pnpm test:unit tests/unit/scan/scan-reducer.test.ts`

Expected: FAIL because the scan model does not exist.

- [ ] **Step 3: Define the scan-session types and pure reducer**

Create `src/features/scan/model/types.ts`:

```ts
import type { ProviderId } from "@/domain/providers";

export type ScanStage = "capture" | "understand" | "complete_proof" | "route" | "verify" | "act";
export type InputMode = "camera" | "photos" | "manual";

export interface EvidenceImage {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
  readonly objectUrl: string;
}

export interface ScanSessionState {
  readonly stage: ScanStage;
  readonly inputMode: InputMode | null;
  readonly images: readonly EvidenceImage[];
  readonly manualValue: string;
  readonly selectedProvider: ProviderId | null;
  readonly notice: string | null;
}

export type ScanSessionAction =
  | {
      readonly type: "images_added";
      readonly inputMode: "camera" | "photos";
      readonly images: readonly EvidenceImage[];
      readonly selectionExceeded?: boolean;
    }
  | { readonly type: "image_removed"; readonly id: string }
  | { readonly type: "manual_value_changed"; readonly value: string }
  | { readonly type: "manual_submitted" }
  | { readonly type: "provider_selected"; readonly provider: ProviderId }
  | { readonly type: "notice_set"; readonly notice: string }
  | { readonly type: "notice_cleared" }
  | { readonly type: "reset" };
```

Create `src/features/scan/model/scan-reducer.ts`:

```ts
import type { ScanSessionAction, ScanSessionState } from "./types";

export const MAX_EVIDENCE_IMAGES = 2;

export function initialScanSession(): ScanSessionState {
  return {
    stage: "capture",
    inputMode: null,
    images: [],
    manualValue: "",
    selectedProvider: null,
    notice: null,
  };
}

export function scanReducer(state: ScanSessionState, action: ScanSessionAction): ScanSessionState {
  switch (action.type) {
    case "images_added": {
      const combined = [...state.images, ...action.images];
      const exceedsLimit = action.selectionExceeded === true || combined.length > MAX_EVIDENCE_IMAGES;
      return {
        ...state,
        stage: "understand",
        inputMode: action.inputMode,
        images: combined.slice(0, MAX_EVIDENCE_IMAGES),
        notice: exceedsLimit ? "Two images maximum. Remove one before adding another." : null,
      };
    }
    case "image_removed": {
      const images = state.images.filter(({ id }) => id !== action.id);
      return {
        ...state,
        images,
        stage: images.length === 0 ? "capture" : state.stage,
        inputMode: images.length === 0 ? null : state.inputMode,
        notice: null,
      };
    }
    case "manual_value_changed": {
      const isEmptyManualSession = state.inputMode === "manual" && action.value.trim() === "";
      return {
        ...state,
        manualValue: action.value,
        stage: isEmptyManualSession ? "capture" : state.stage,
        inputMode: isEmptyManualSession ? null : state.inputMode,
        notice: null,
      };
    }
    case "manual_submitted": {
      const value = state.manualValue.trim();
      return value
        ? { ...state, stage: "complete_proof", inputMode: "manual", manualValue: value, notice: null }
        : { ...state, notice: "Enter a model, UPC or GTIN, lot code, date, or VIN." };
    }
    case "provider_selected":
      return { ...state, selectedProvider: action.provider, notice: null };
    case "notice_set":
      return { ...state, notice: action.notice };
    case "notice_cleared":
      return { ...state, notice: null };
    case "reset":
      return initialScanSession();
  }
}
```

- [ ] **Step 4: Run the reducer suite and commit the ephemeral model**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/scan/scan-reducer.test.ts
```

Expected: all eight reducer tests pass, including explicit selection overflow and one-image-remains branches.

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add src/features/scan/model tests/unit/scan/scan-reducer.test.ts
git commit -m "feat(scan): add the ephemeral scan session"
git push -u origin feat/universal-scan-shell
gh pr create --draft --fill --base main --head feat/universal-scan-shell --title "feat(scan): add camera photo and manual intake"
```

Expected: the draft PR is open with the eight passing reducer cases before image decoding or UI behavior is added.

- [ ] **Step 5: Add client-side metadata stripping and bounded image preparation**

Create `tests/unit/scan/sanitize-client-image.test.ts` before implementing the sanitizer:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeClientImage } from "@/features/scan/sanitize-client-image";

const createBitmap = vi.fn<(file: Blob, options?: ImageBitmapOptions) => Promise<ImageBitmap>>();

function decodedBitmap(width = 4096, height = 2048) {
  return { width, height, close: vi.fn() } as unknown as ImageBitmap;
}

function installCanvas(encoded: Blob | null, contextAvailable = true) {
  const context = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => (contextAvailable ? context : null)),
    toBlob: vi.fn((callback: BlobCallback) => callback(encoded)),
  } as unknown as HTMLCanvasElement;
  vi.spyOn(document, "createElement").mockReturnValue(canvas);
  return { canvas, context };
}

describe("sanitizeClientImage", () => {
  beforeEach(() => {
    createBitmap.mockReset();
    vi.stubGlobal("createImageBitmap", createBitmap);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rejects a source larger than 12 MB before decoding", async () => {
    const source = new File(["source"], "private.jpg", { type: "image/jpeg" });
    Object.defineProperty(source, "size", { value: 12 * 1024 * 1024 + 1 });

    await expect(sanitizeClientImage(source, 0)).rejects.toThrow("larger than 12 MB");
    expect(createBitmap).not.toHaveBeenCalled();
  });

  it("bounds the longest edge, re-encodes to JPEG, and assigns a generic name", async () => {
    const bitmap = decodedBitmap();
    createBitmap.mockResolvedValue(bitmap);
    const { canvas, context } = installCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

    const output = await sanitizeClientImage(new File(["source"], "private.png", { type: "image/png" }), 1);

    expect(canvas).toMatchObject({ width: 2048, height: 1024 });
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 2048, 1024);
    expect(output).toMatchObject({ name: "evidence-2.jpg", type: "image/jpeg", lastModified: 0 });
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it("rejects a re-encoded image larger than 8 MB", async () => {
    const bitmap = decodedBitmap(800, 600);
    createBitmap.mockResolvedValue(bitmap);
    const encoded = new Blob(["jpeg"], { type: "image/jpeg" });
    Object.defineProperty(encoded, "size", { value: 8 * 1024 * 1024 + 1 });
    installCanvas(encoded);

    await expect(sanitizeClientImage(new File(["source"], "private.jpg"), 0)).rejects.toThrow(
      "still larger than 8 MB",
    );
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it("returns an explicit fallback when the browser cannot decode the image", async () => {
    createBitmap.mockRejectedValue(new Error("decode failed"));

    await expect(sanitizeClientImage(new File(["source"], "private.heic"), 0)).rejects.toThrow(
      "could not prepare that photo",
    );
  });

  it("closes the bitmap when no private canvas context is available", async () => {
    const bitmap = decodedBitmap(800, 600);
    createBitmap.mockResolvedValue(bitmap);
    installCanvas(new Blob(["jpeg"], { type: "image/jpeg" }), false);

    await expect(sanitizeClientImage(new File(["source"], "private.jpg"), 0)).rejects.toThrow(
      "could not create a private image preview",
    );
    expect(bitmap.close).toHaveBeenCalledOnce();
  });

  it("fails closed when the browser encoder returns no blob", async () => {
    const bitmap = decodedBitmap(800, 600);
    createBitmap.mockResolvedValue(bitmap);
    installCanvas(null);

    await expect(sanitizeClientImage(new File(["source"], "private.jpg"), 0)).rejects.toThrow(
      "could not re-encode this image",
    );
    expect(bitmap.close).toHaveBeenCalledOnce();
  });
});
```

Create the failing lifecycle test `tests/unit/scan/use-evidence-images.test.tsx` before implementing the hook:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducer } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialScanSession, scanReducer } from "@/features/scan/model/scan-reducer";
import { sanitizeClientImage } from "@/features/scan/sanitize-client-image";
import { useEvidenceImages } from "@/features/scan/use-evidence-images";

vi.mock("@/features/scan/sanitize-client-image", () => ({
  ClientImageError: class ClientImageError extends Error {},
  sanitizeClientImage: vi.fn(),
}));

const sanitizeImage = vi.mocked(sanitizeClientImage);
const createObjectUrl = vi.fn<() => string>();
const revokeObjectUrl = vi.fn<(url: string) => void>();
type AddFiles = (files: readonly File[], mode: "camera" | "photos") => Promise<void>;
let addFilesFromHarness = null as AddFiles | null;

function Harness() {
  const [state, dispatch] = useReducer(scanReducer, undefined, initialScanSession);
  const { addFiles, removeImage, clearImages } = useEvidenceImages(state.images.length, dispatch);
  addFilesFromHarness = addFiles;
  const file = new File(["source"], "private-name.jpg", { type: "image/jpeg" });

  return (
    <div>
      <button type="button" onClick={() => void addFiles([file], "photos")}>Add</button>
      {state.images.map((image) => (
        <div key={image.id}>
          <span>{image.name}</span>
          <button type="button" onClick={() => removeImage(image)}>Remove</button>
        </div>
      ))}
      {state.notice ? <span role="status">{state.notice}</span> : null}
      <button type="button" onClick={() => clearImages(state.images)}>Clear</button>
    </div>
  );
}

describe("useEvidenceImages", () => {
  beforeEach(() => {
    addFilesFromHarness = null;
    sanitizeImage.mockReset().mockImplementation(async (_file: File, position: number) =>
      new File(["sanitized"], `evidence-${position + 1}.jpg`, { type: "image/jpeg", lastModified: 0 }),
    );
    createObjectUrl.mockReset().mockReturnValueOnce("blob:sanitized-1").mockReturnValueOnce("blob:sanitized-2");
    revokeObjectUrl.mockReset();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
  });

  it("uses sanitized names and revokes URLs on remove and clear", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("Evidence 1");
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:sanitized-1");

    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("Evidence 1");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:sanitized-2");
  });

  it("revokes a remaining URL when the feature unmounts", async () => {
    const view = render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("Evidence 1");
    view.unmount();
    await waitFor(() => expect(revokeObjectUrl).toHaveBeenCalledWith("blob:sanitized-1"));
  });

  it("reports the two-image limit when every slot is already occupied", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("Evidence 1");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await screen.findByText("Evidence 2");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Two images maximum. Remove one before adding another.",
    );
    expect(createObjectUrl).toHaveBeenCalledTimes(2);
  });

  it("does not create an object URL when sanitization finishes after unmount", async () => {
    let finishSanitizing: ((file: File) => void) | undefined;
    sanitizeImage.mockImplementationOnce(
      () => new Promise<File>((resolve) => {
        finishSanitizing = resolve;
      }),
    );
    const view = render(<Harness />);
    if (!addFilesFromHarness) throw new Error("Harness did not expose addFiles");
    const pending = addFilesFromHarness(
      [new File(["source"], "private-name.jpg", { type: "image/jpeg" })],
      "photos",
    );

    view.unmount();
    finishSanitizing?.(new File(["sanitized"], "evidence-1.jpg", { type: "image/jpeg" }));
    await pending;

    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("cancels an in-flight selection when the user resets", async () => {
    let finishSanitizing: ((file: File) => void) | undefined;
    sanitizeImage.mockImplementationOnce(
      () => new Promise<File>((resolve) => {
        finishSanitizing = resolve;
      }),
    );
    render(<Harness />);
    if (!addFilesFromHarness) throw new Error("Harness did not expose addFiles");
    const pending = addFilesFromHarness(
      [new File(["source"], "private-name.jpg", { type: "image/jpeg" })],
      "photos",
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    finishSanitizing?.(new File(["sanitized"], "evidence-1.jpg", { type: "image/jpeg" }));
    await pending;

    expect(createObjectUrl).not.toHaveBeenCalled();
    expect(screen.queryByText("Evidence 1")).not.toBeInTheDocument();
  });

  it("serializes rapid overlapping selections without leaking dropped previews", async () => {
    let finishFirst: ((file: File) => void) | undefined;
    sanitizeImage.mockImplementationOnce(
      () => new Promise<File>((resolve) => {
        finishFirst = resolve;
      }),
    );
    render(<Harness />);
    if (!addFilesFromHarness) throw new Error("Harness did not expose addFiles");
    const file = new File(["source"], "private-name.jpg", { type: "image/jpeg" });
    const first = addFilesFromHarness([file, file], "photos");
    const overlapping = addFilesFromHarness([file, file], "photos");

    await overlapping;
    finishFirst?.(new File(["sanitized"], "evidence-1.jpg", { type: "image/jpeg" }));
    await first;

    await screen.findByText("Evidence 2");
    expect(sanitizeImage).toHaveBeenCalledTimes(2);
    expect(createObjectUrl).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText(/Evidence [12]/)).toHaveLength(2);
  });
});
```

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm test:unit tests/unit/scan/sanitize-client-image.test.ts tests/unit/scan/use-evidence-images.test.tsx
```

Expected: FAIL because `sanitize-client-image.ts` and `use-evidence-images.ts` do not exist.

Create `src/features/scan/sanitize-client-image.ts`:

```ts
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;
const MAX_EDGE_PIXELS = 2048;
const JPEG_QUALITY = 0.9;

export class ClientImageError extends Error {}

function outputSize(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_EDGE_PIXELS / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ClientImageError("The browser could not re-encode this image."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

export async function sanitizeClientImage(file: File, position: number): Promise<File> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ClientImageError("That image is larger than 12 MB. Choose a smaller photo.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ClientImageError("This browser could not prepare that photo. Choose JPEG, PNG, or WebP, or enter details manually.");
  }

  try {
    const size = outputSize(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new ClientImageError("The browser could not create a private image preview.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    const sanitized = await canvasToBlob(canvas);
    if (sanitized.size > MAX_OUTPUT_BYTES) {
      throw new ClientImageError("The prepared image is still larger than 8 MB. Crop closer to the label and try again.");
    }

    return new File([sanitized], `evidence-${position + 1}.jpg`, {
      type: "image/jpeg",
      lastModified: 0,
    });
  } finally {
    bitmap.close();
  }
}
```

Run: `pnpm test:unit tests/unit/scan/sanitize-client-image.test.ts`

Expected: all six sanitizer tests pass, covering source/output byte caps, longest-edge resizing, generic JPEG output, decode failure, missing canvas context, and encoder failure.

This browser re-encoding is the first privacy boundary: object URLs are created only from the sanitized JPEG, never the source file. The later server route re-encodes again with Sharp before model processing; client processing is defense in depth, not a substitute for server validation.

Create `scripts/generate-privacy-fixture.mjs`:

```js
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const outputDirectory = fileURLToPath(new URL("../tests/fixtures/images/", import.meta.url));
const output = fileURLToPath(new URL("../tests/fixtures/images/exif-location.jpg", import.meta.url));
const svg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="640">
    <rect width="960" height="640" fill="#f5f0e7"/>
    <text x="70" y="230" font-family="Arial" font-size="58" fill="#1f2925">DEMO FIXTURE</text>
    <text x="70" y="310" font-family="Arial" font-size="34" fill="#53646b">NOT A CONSUMER PRODUCT</text>
    <text x="70" y="430" font-family="monospace" font-size="44" fill="#1f2925">MODEL RT-DEMO-01</text>
  </svg>
`);

await mkdir(outputDirectory, { recursive: true });
await sharp(svg)
  .jpeg({ quality: 92 })
  .withExif({ IFD0: { ImageDescription: "SENSITIVE-EXIF-SENTINEL" } })
  .toFile(output);
```

Run: `node scripts/generate-privacy-fixture.mjs`

Expected: `tests/fixtures/images/exif-location.jpg` is a self-created label fixture and contains the `SENSITIVE-EXIF-SENTINEL` marker before browser processing.

- [ ] **Step 6: Add the sanitized object-URL lifecycle hook**

Create `src/features/scan/use-evidence-images.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { MAX_EVIDENCE_IMAGES } from "./model/scan-reducer";
import type { EvidenceImage, InputMode, ScanSessionAction } from "./model/types";
import { ClientImageError, sanitizeClientImage } from "./sanitize-client-image";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const ACCEPTED_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;

function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type) || (file.type === "" && ACCEPTED_EXTENSION.test(file.name));
}

interface EvidenceImageController {
  readonly addFiles: (
    files: readonly File[],
    mode: Extract<InputMode, "camera" | "photos">,
  ) => Promise<void>;
  readonly removeImage: (image: EvidenceImage) => void;
  readonly clearImages: (images: readonly EvidenceImage[]) => void;
}

export function useEvidenceImages(
  imageCount: number,
  dispatch: (action: ScanSessionAction) => void,
): EvidenceImageController {
  const activeUrls = useRef(new Set<string>());
  const disposed = useRef(false);
  const operationGeneration = useRef(0);
  const activeOperation = useRef<number | null>(null);

  const revoke = useCallback((url: string) => {
    if (activeUrls.current.delete(url)) URL.revokeObjectURL(url);
  }, []);

  const addFiles = useCallback(
    async (files: readonly File[], mode: "camera" | "photos") => {
      if (activeOperation.current !== null) {
        dispatch({ type: "notice_set", notice: "Photos are already being prepared. Wait for that selection to finish." });
        return;
      }

      const operation = ++operationGeneration.current;
      activeOperation.current = operation;
      const existingCount = Math.max(imageCount, activeUrls.current.size);
      const available = Math.max(0, MAX_EVIDENCE_IMAGES - existingCount);
      const validFiles = files.filter(isAcceptedImage);
      const selectionExceeded = validFiles.length > available;
      const accepted: EvidenceImage[] = [];
      const revokeAccepted = () => accepted.forEach(({ objectUrl }) => revoke(objectUrl));
      let failure: string | null = files.length > 0 && validFiles.length === 0
        ? "That file type is not supported. Choose JPEG, PNG, WebP, HEIC, or HEIF, or enter details manually."
        : null;

      try {
        for (const [index, file] of validFiles.slice(0, available).entries()) {
          try {
            const sanitized = await sanitizeClientImage(file, existingCount + index);
            if (disposed.current || operationGeneration.current !== operation) {
              revokeAccepted();
              return;
            }
            const id = crypto.randomUUID();
            const objectUrl = URL.createObjectURL(sanitized);
            activeUrls.current.add(objectUrl);
            accepted.push({
              id,
              name: `Evidence ${existingCount + index + 1}`,
              mimeType: sanitized.type,
              size: sanitized.size,
              objectUrl,
            });
          } catch (error) {
            failure = error instanceof ClientImageError
              ? error.message
              : "The browser could not prepare that image. Enter the identifier manually or try another photo.";
          }
        }

        if (disposed.current || operationGeneration.current !== operation) {
          revokeAccepted();
          return;
        }
        if (accepted.length > 0) {
          dispatch({ type: "images_added", inputMode: mode, images: accepted, selectionExceeded });
        }
        if (selectionExceeded && accepted.length === 0 && !failure) {
          failure = "Two images maximum. Remove one before adding another.";
        }
        if (failure) dispatch({ type: "notice_set", notice: failure });
      } finally {
        if (activeOperation.current === operation) activeOperation.current = null;
      }
    },
    [dispatch, imageCount, revoke],
  );

  const removeImage = useCallback(
    (image: EvidenceImage) => {
      revoke(image.objectUrl);
      dispatch({ type: "image_removed", id: image.id });
    },
    [dispatch, revoke],
  );

  const clearImages = useCallback(
    (images: readonly EvidenceImage[]) => {
      operationGeneration.current += 1;
      activeOperation.current = null;
      images.forEach(({ objectUrl }) => revoke(objectUrl));
      for (const url of [...activeUrls.current]) revoke(url);
      dispatch({ type: "reset" });
    },
    [dispatch, revoke],
  );

  useEffect(() => {
    disposed.current = false;
    const urls = activeUrls.current;
    return () => {
      disposed.current = true;
      operationGeneration.current += 1;
      activeOperation.current = null;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  return { addFiles, removeImage, clearImages };
}
```

The hook never writes image bytes or identifiers to local storage, session storage, IndexedDB, Cache Storage, cookies, or telemetry.

Run: `pnpm test:unit tests/unit/scan/use-evidence-images.test.tsx`

Expected: all six hook tests pass; a full two-image session reports overflow without decoding another file; reset and unmount cancel in-flight work; overlapping selections are serialized; no source filename appears in state; every created object URL is revoked on remove, clear, cancellation, or unmount.

- [ ] **Step 7: Write the failing Universal Scan interaction contract**

Create `tests/unit/scan/universal-scan.test.tsx` before the provider rail or scan surface exists:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UniversalScan } from "@/features/scan/universal-scan";

const { addFiles } = vi.hoisted(() => ({ addFiles: vi.fn() }));

vi.mock("@/features/scan/use-evidence-images", () => ({
  useEvidenceImages: () => ({ addFiles, removeImage: vi.fn(), clearImages: vi.fn() }),
}));

describe("UniversalScan", () => {
  beforeEach(() => addFiles.mockReset());

  it("keeps manual entry quieter until requested and never queries a source", () => {
    render(<UniversalScan />);

    expect(screen.getByRole("button", { name: "Scan with camera" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Choose from photos" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("No source has been queried yet.");
    const manualReveal = screen.getByRole("button", { name: "Enter details manually" });
    expect(manualReveal).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Model or identifier")).not.toBeInTheDocument();

    fireEvent.click(manualReveal);
    expect(manualReveal).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByLabelText("Model or identifier"), { target: { value: "ABC-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("status")).toHaveTextContent("Details ready for evidence review");

    const foodProvider = screen.getByRole("radio", { name: /Food and infant formula/ });
    fireEvent.click(foodProvider);
    expect(foodProvider).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("No source has been queried yet");
  });

  it("routes desktop drops through the same bounded photo intake", () => {
    render(<UniversalScan />);
    const file = new File(["image"], "dropped.jpg", { type: "image/jpeg" });

    fireEvent.drop(screen.getByRole("group", { name: "Photo upload and drop area" }), {
      dataTransfer: { files: [file] },
    });

    expect(addFiles).toHaveBeenCalledWith([file], "photos");
  });
});
```

Run: `pnpm test:unit tests/unit/scan/universal-scan.test.tsx`

Expected: FAIL because `universal-scan.tsx` and the provider rail do not exist; the contract already requires a quiet manual reveal and a shared drag-and-drop intake.

- [ ] **Step 8: Add the neutral provider rail**

Create `src/features/scan/components/provider-rail.tsx`:

```tsx
import type { ProviderId } from "@/domain/providers";

const PROVIDERS: readonly { id: ProviderId; short: string; label: string; scope: string }[] = [
  { id: "cpsc", short: "CPSC", label: "Household and consumer products", scope: "CPSC recall notices" },
  { id: "fda_food", short: "FDA", label: "Food and infant formula", scope: "FDA enforcement records" },
  { id: "nhtsa", short: "NHTSA", label: "Cars and light vehicles", scope: "NHTSA vehicle-type campaigns" },
];

interface ProviderRailProps {
  readonly selected: ProviderId | null;
  readonly onSelect: (provider: ProviderId) => void;
}

export function ProviderRail({ selected, onSelect }: ProviderRailProps) {
  return (
    <fieldset aria-describedby="provider-note">
      <legend>Which kind of item are you checking?</legend>
      <div role="list">
        {PROVIDERS.map((provider) => (
          <label key={provider.id} role="listitem">
            <input
              type="radio"
              name="provider"
              value={provider.id}
              checked={selected === provider.id}
              onChange={() => onSelect(provider.id)}
            />
            <span aria-hidden="true">{provider.short}</span>
            <span>
              <strong>{provider.label}</strong>
              <small>{provider.scope}</small>
            </span>
          </label>
        ))}
      </div>
      <p id="provider-note">You can correct this selection before any official source is queried.</p>
    </fieldset>
  );
}
```

- [ ] **Step 9: Build the interactive capture/photo/manual surface**

Create `src/features/scan/universal-scan.tsx`:

```tsx
"use client";

import { useReducer, useRef, useState } from "react";
import { ProviderRail } from "./components/provider-rail";
import { initialScanSession, scanReducer } from "./model/scan-reducer";
import { useEvidenceImages } from "./use-evidence-images";
import styles from "./universal-scan.module.css";

export function UniversalScan() {
  const [state, dispatch] = useReducer(scanReducer, undefined, initialScanSession);
  const [manualOpen, setManualOpen] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const photosInput = useRef<HTMLInputElement>(null);
  const { addFiles, removeImage, clearImages } = useEvidenceImages(state.images.length, dispatch);

  return (
    <section className={styles.workspace} aria-labelledby="scan-heading">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Universal Scan</p>
        <h1 id="scan-heading">Evidence first. Answers you can trace.</h1>
        <p>Photograph a label, choose an existing image, or enter a decisive identifier.</p>
      </div>

      <div className={styles.capture}>
        <div
          className={styles.dropZone}
          role="group"
          aria-label="Photo upload and drop area"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            void addFiles(Array.from(event.dataTransfer.files), "photos");
          }}
        >
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => cameraInput.current?.click()}>
              Scan with camera
            </button>
            <button type="button" className={styles.secondary} onClick={() => photosInput.current?.click()}>
              Choose from photos
            </button>
            <input
              ref={cameraInput}
              className={styles.hiddenInput}
              type="file"
              tabIndex={-1}
              accept="image/*"
              capture="environment"
              aria-label="Take a product photo"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                event.currentTarget.value = "";
                void addFiles(files, "camera");
              }}
            />
            <input
              ref={photosInput}
              className={styles.hiddenInput}
              type="file"
              tabIndex={-1}
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              aria-label="Choose one or two product photos"
              onChange={(event) => {
                const files = Array.from(event.currentTarget.files ?? []);
                event.currentTarget.value = "";
                void addFiles(files, "photos");
              }}
            />
          </div>
          <p className={styles.dropHint}>or drop one or two product photos here</p>
        </div>

        <p className={styles.privacy}>Up to two images. RedTag does not save them in this browser.</p>

        {state.images.length > 0 ? (
          <div className={styles.evidence} aria-label="Selected evidence images">
            {state.images.map((image) => (
              <figure key={image.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- local ephemeral blob preview */}
                <img src={image.objectUrl} alt={`Selected evidence: ${image.name}`} />
                <figcaption>
                  <span>{image.name}</span>
                  <button type="button" onClick={() => removeImage(image)} aria-label={`Remove ${image.name}`}>
                    Remove
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className={styles.manualReveal}
          aria-expanded={manualOpen}
          aria-controls="manual-entry"
          onClick={() => setManualOpen((open) => !open)}
        >
          Enter details manually
        </button>

        {manualOpen ? (
          <form
            id="manual-entry"
            className={styles.manual}
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: "manual_submitted" });
            }}
          >
            <label htmlFor="manual-identifier">Model or identifier</label>
            <div>
              <input
                id="manual-identifier"
                value={state.manualValue}
                onChange={(event) => dispatch({ type: "manual_value_changed", value: event.currentTarget.value })}
                placeholder="Model, UPC/GTIN, lot, date, or VIN"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit">Continue</button>
            </div>
          </form>
        ) : null}

        <ProviderRail selected={state.selectedProvider} onSelect={(provider) => dispatch({ type: "provider_selected", provider })} />

        <p className={styles.status} role="status" aria-live="polite">
          {state.notice ??
            (state.stage === "complete_proof"
              ? "Details ready for evidence review. No source has been queried yet."
              : state.images.length > 0
                ? `${state.images.length} evidence image${state.images.length === 1 ? "" : "s"} selected. No source has been queried yet.`
                : "No source has been queried yet.")}
        </p>

        {state.images.length > 0 || state.manualValue ? (
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              clearImages(state.images);
              setManualOpen(false);
            }}
          >
            Start over
          </button>
        ) : null}
      </div>
    </section>
  );
}
```

Create `src/features/scan/universal-scan.module.css`:

```css
.workspace {
  display: grid;
  min-height: calc(100vh - 5rem);
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-8) 0;
}

.intro {
  display: grid;
  gap: var(--space-3);
}

.eyebrow {
  margin: 0;
  color: var(--neutral-info);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.intro h1 {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: clamp(2.45rem, 11vw, 5.8rem);
  line-height: 0.95;
  letter-spacing: -0.045em;
}

.intro > p:last-child {
  max-width: 36rem;
  margin: 0;
  color: var(--neutral-info);
  font-size: 1.05rem;
  line-height: 1.55;
}

.capture {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--line);
  border-radius: var(--radius-hero);
  background: color-mix(in srgb, var(--paper) 88%, white);
  box-shadow: var(--shadow-elevated);
}

.actions {
  display: grid;
  gap: var(--space-2);
}

.dropZone {
  display: grid;
  gap: var(--space-2);
}

.dropHint {
  display: none;
  margin: 0;
  color: var(--neutral-info);
  font-size: 0.82rem;
  text-align: center;
}

.actions button,
.manual button,
.manualReveal,
.reset {
  min-height: 3rem;
  border-radius: var(--radius-control);
  font-weight: 760;
}

.primary {
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--paper);
}

.secondary,
.manual button,
.reset {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
}

.manualReveal {
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--neutral-info);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.hiddenInput {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.privacy,
.status,
.capture fieldset p {
  margin: 0;
  color: var(--neutral-info);
  font-size: 0.85rem;
  line-height: 1.45;
}

.evidence {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.evidence figure {
  margin: 0;
}

.evidence img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-control);
  object-fit: cover;
}

.evidence figcaption {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding-top: var(--space-1);
  font-size: 0.78rem;
}

.evidence figcaption span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.evidence figcaption button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 0;
  background: transparent;
  color: var(--neutral-info);
  text-decoration: underline;
}

.manual {
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-1);
  border-top: 1px solid var(--line);
}

.manual label,
.capture legend {
  font-weight: 760;
}

.manual > div {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2);
}

.manual input {
  min-width: 0;
  min-height: 3rem;
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: white;
  color: var(--ink);
  font-family: var(--font-mono), "SFMono-Regular", Consolas, monospace;
}

.capture fieldset {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-3) 0 0;
  border: 0;
  border-top: 1px solid var(--line);
}

.capture fieldset [role="list"] {
  display: grid;
  gap: var(--space-2);
}

.capture fieldset label {
  display: grid;
  grid-template-columns: auto 3.8rem 1fr;
  min-height: 3rem;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  border-bottom: 1px solid var(--line);
}

.capture fieldset label > span:first-of-type {
  color: var(--neutral-info);
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.capture fieldset label > span:last-child {
  display: grid;
}

.capture fieldset small {
  color: var(--neutral-info);
}

.status {
  min-height: 2.5rem;
  padding: var(--space-3);
  border-left: 3px solid var(--neutral-info);
  background: color-mix(in srgb, var(--neutral-info) 7%, transparent);
}

.reset {
  width: fit-content;
  padding-inline: var(--space-4);
}

@media (min-width: 52rem) {
  .workspace {
    grid-template-columns: minmax(0, 1.1fr) minmax(22rem, 0.9fr);
    gap: clamp(var(--space-12), 6vw, var(--space-16));
    padding: var(--space-12) 0;
  }

  .dropZone {
    padding: var(--space-3);
    border: 1px dashed var(--line);
    border-radius: var(--radius-control);
  }

  .dropHint {
    display: block;
  }
}
```

- [ ] **Step 10: Replace the static hero with Universal Scan**

Replace `src/app/page.tsx` with:

```tsx
import { connection } from "next/server";
import { UniversalScan } from "@/features/scan/universal-scan";
import styles from "./page.module.css";
import { APP_NAME } from "./product-copy";

export default async function HomePage() {
  await connection();

  return (
    <main className={styles.shell}>
      <header className={styles.masthead}>
        <a className={styles.wordmark} href="#scan" aria-label="RedTag home">
          {APP_NAME}
        </a>
        <span className={styles.scope}>U.S. recall record guide</span>
      </header>
      <div id="scan">
        <UniversalScan />
      </div>
    </main>
  );
}
```

The request boundary is intentional: Task 6 adds a per-request nonce CSP, and Next.js can attach that nonce to framework scripts only when the document is dynamically rendered.

Replace `src/app/page.module.css` with:

```css
.shell {
  width: min(100% - 2rem, 76rem);
  min-height: 100vh;
  margin: 0 auto;
}

.masthead {
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
}

.wordmark {
  color: var(--ink);
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.scope {
  color: var(--neutral-info);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

- [ ] **Step 11: Extend the browser smoke for gallery upload, desktop drop, metadata removal, and manual recovery**

Add this import at the top of `tests/e2e/foundation.spec.ts`:

```ts
import { readFile } from "node:fs/promises";
```

Then append:

```ts
test("accepts up to two gallery images and can reset the ephemeral session", async ({ page }) => {
  await page.goto("/");
  const chooser = page.getByLabel("Choose one or two product photos");
  await chooser.setInputFiles(["tests/fixtures/images/exif-location.jpg", "tests/fixtures/images/exif-location.jpg"]);

  await expect(page.getByText("2 evidence images selected. No source has been queried yet.")).toBeVisible();
  await expect(page.getByText("Evidence 1")).toBeVisible();
  await expect(page.getByText("Evidence 2")).toBeVisible();
  await expect.poll(() => page.getByRole("img", { name: /Selected evidence/ }).first().evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByText("No source has been queried yet.")).toBeVisible();
});

test("accepts desktop drag-and-drop through the bounded photo path", async ({ page }) => {
  const encodedFixture = (await readFile("tests/fixtures/images/exif-location.jpg")).toString("base64");
  await page.goto("/");
  await page.getByRole("group", { name: "Photo upload and drop area" }).evaluate((dropZone, encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "dropped-evidence.jpg", { type: "image/jpeg" }));
    dropZone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, encodedFixture);

  await expect(page.getByRole("img", { name: "Selected evidence: Evidence 1" })).toBeVisible();
  await expect(page.getByText("dropped-evidence.jpg")).toHaveCount(0);
});

test("keeps manual entry explicit and source-free", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Enter details manually" }).click();
  await page.getByLabel("Model or identifier").fill("ABC-123");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("status")).toContainText("Details ready for evidence review");
  await expect(page.getByRole("status")).toContainText("No source has been queried yet");
});
```

Create `tests/e2e/image-privacy.spec.ts`:

```ts
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("creates previews only from bounded metadata-free JPEGs and revokes them on reset", async ({ page }) => {
  const sourceFixture = await readFile("tests/fixtures/images/exif-location.jpg");
  expect(sourceFixture.toString("latin1")).toContain("SENSITIVE-EXIF-SENTINEL");

  await page.goto("/");
  await page.getByLabel("Choose one or two product photos").setInputFiles("tests/fixtures/images/exif-location.jpg");

  const preview = page.getByRole("img", { name: "Selected evidence: Evidence 1" });
  await expect(preview).toBeVisible();
  await expect(page.getByText("exif-location.jpg")).toHaveCount(0);
  await expect.poll(() => preview.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const objectUrl = await preview.getAttribute("src");
  expect(objectUrl).toMatch(/^blob:/);

  const prepared = await page.evaluate(async (url) => {
    const blob = await (await fetch(url)).blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return {
      type: blob.type,
      size: blob.size,
      text: new TextDecoder("latin1").decode(bytes),
    };
  }, objectUrl as string);

  expect(prepared.type).toBe("image/jpeg");
  expect(prepared.size).toBeLessThanOrEqual(8 * 1024 * 1024);
  expect(prepared.text).not.toContain("SENSITIVE-EXIF-SENTINEL");

  await page.getByRole("button", { name: "Start over" }).click();
  const remainsFetchable = await page.evaluate(async (url) => {
    try {
      await fetch(url);
      return true;
    } catch {
      return false;
    }
  }, objectUrl as string);
  expect(remainsFetchable).toBe(false);
});
```

Change the `package.json` smoke command to include the privacy path:

```json
"test:e2e:smoke": "playwright test tests/e2e/foundation.spec.ts tests/e2e/image-privacy.spec.ts"
```

- [ ] **Step 12: Verify the complete scan shell**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/scan
pnpm typecheck
pnpm lint
pnpm test:e2e:smoke
pnpm build
```

Expected: every command exits zero; the 390x844 project keeps both capture actions visible without scrolling; manual entry remains collapsed until its quiet reveal is activated; desktop drag-and-drop produces sanitized generic evidence; and no element uses the recall-red token.

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add src/features src/app/page.tsx src/app/page.module.css scripts/generate-privacy-fixture.mjs tests/fixtures/images tests/unit/scan tests/e2e/foundation.spec.ts tests/e2e/image-privacy.spec.ts package.json
git commit -m "feat(scan): deliver the Universal Scan shell"
git push
```

Push the final commit to the existing draft PR titled `feat(scan): add camera photo and manual intake`. Attach 390x844 and 1440x900 screenshots, state explicitly that the foundation performs no model or provider request, complete the template, and self-review. Then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: required checks are green, the scan PR is merged with a merge commit, the branch is deleted, and local `main` contains the ephemeral capture boundary.

### Task 5: Server-gated safety-state gallery

**Branch:** `feat/result-presentation-foundation`

**Files:**
- Create: `src/features/results/presentation-fixture.ts`
- Create: `src/features/results/state-preview.tsx`
- Create: `src/features/results/state-preview.module.css`
- Create: `public/demo/evidence-label.svg`
- Create: `src/app/dev/state-gallery/page.tsx`
- Create: `src/app/dev/state-gallery/page.module.css`
- Create: `playwright.visual.config.ts`
- Create: `tests/unit/results/presentation-contract.test.tsx`
- Create: `tests/unit/results/presentation-policy.test.ts`
- Create: `tests/unit/results/presentation-copy.test.ts`
- Create: `tests/unit/results/state-preview.test.tsx`
- Create: `tests/visual/state-family.spec.ts`
- Create (generated and committed): `tests/visual/__screenshots__/redtag-state-family-phone.png`
- Create (generated and committed): `tests/visual/__screenshots__/redtag-state-family-desktop.png`
- Modify: `package.json`
- Modify: `tests/e2e/foundation.spec.ts`

**Interfaces:**
- Consumes: approved result copy, result states, Calm Guardian tokens, and the no-match formatter from Task 3.
- Produces: reusable `StatePreview` presentation primitives and a visual-review route available only when the server process explicitly sets `REDTAG_ENABLE_STATE_GALLERY=1`.

- [ ] **Step 0: Create the branch from the latest protected base**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c feat/result-presentation-foundation
git status -sb
```

Expected: `git status -sb` begins with `## feat/result-presentation-foundation` and reports no changes.

- [ ] **Step 1: Write the failing presentation-registry contract**

Create `tests/unit/results/presentation-contract.test.tsx` before the fixture registry exists:

```tsx
import { describe, expect, it } from "vitest";
import { assertAppCopyAllowed } from "@/domain/safety/copy-policy";
import { PRESENTATION_FIXTURES, presentationToneFor } from "@/features/results/presentation-fixture";

describe("presentation fixture contract", () => {
  it("covers the nine approved frames and derives emphasis from state", () => {
    expect(PRESENTATION_FIXTURES).toHaveLength(9);
    expect(PRESENTATION_FIXTURES.filter(({ state }) => state === "possible_match")).toHaveLength(3);

    const recallEmphasis = PRESENTATION_FIXTURES.filter((fixture) => presentationToneFor(fixture) === "confirmed");
    expect(recallEmphasis).toHaveLength(1);
    expect(recallEmphasis[0]?.state).toBe("confirmed_match");

    const vehicleCampaigns = PRESENTATION_FIXTURES.find(({ state }) => state === "vehicle_campaigns_found");
    expect(vehicleCampaigns?.provider).toBe("NHTSA");
    expect(vehicleCampaigns?.title).toBe("Campaigns associated with this vehicle type");
    expect(vehicleCampaigns?.nextAction.label).toBe("Open NHTSA’s official VIN lookup");
    expect(vehicleCampaigns?.officialSource.href).toBe("https://www.nhtsa.gov/nhtsa-datasets-and-apis");
    expect(vehicleCampaigns?.coverageNotes?.href).toBe("https://www.nhtsa.gov/recalls");
    expect(vehicleCampaigns && presentationToneFor(vehicleCampaigns)).toBe("neutral");

    const fdaRecorded = PRESENTATION_FIXTURES.find(({ id }) => id === "recorded-response");
    expect(fdaRecorded?.sourceUpdatedAt).toBe("2025-12-29");
    expect(fdaRecorded?.body).toContain("source last updated 2025-12-29");

    const recorded = PRESENTATION_FIXTURES.filter((fixture) => fixture.dataMode === "recorded_response");
    expect(recorded).toHaveLength(7);
    for (const fixture of recorded) {
      expect(fixture.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(fixture.capturedAt).not.toBe(fixture.retrievedAt);
    }
    expect(PRESENTATION_FIXTURES.every((fixture) => /^\d{4}-\d{2}-\d{2}T/.test(fixture.retrievedAt))).toBe(true);
  });

  it("keeps every registered title, body, source label, and action inside the app-copy policy", () => {
    for (const fixture of PRESENTATION_FIXTURES) {
      for (const copy of [fixture.title, fixture.body, fixture.officialSource.label, fixture.nextAction.label]) {
        expect(() => assertAppCopyAllowed(copy)).not.toThrow();
      }
      const coverageNotes = fixture.coverageNotes;
      if (coverageNotes) {
        expect(() => assertAppCopyAllowed(coverageNotes.label)).not.toThrow();
      }
    }
  });
});
```

Run: `pnpm test:unit tests/unit/results/presentation-contract.test.tsx`

Expected: FAIL because the presentation fixture module does not exist.

- [ ] **Step 2: Define the complete visual fixture family**

Create `src/features/results/presentation-fixture.ts`:

```ts
import type { ModelState, RetrievalCompleteness, RetrievalStatus } from "@/domain/providers";
import type { PossibleMatchReason, ScanState } from "@/domain/results";
import { formatNoMatchCopy } from "@/domain/safety/copy-policy";

export type PresentationTone = "confirmed" | "possible" | "neutral" | "unavailable";

export type PresentationNextAction =
  | { readonly kind: "internal"; readonly label: string }
  | { readonly kind: "external"; readonly label: string; readonly href: string };

export interface PresentationOfficialSource {
  readonly label: string;
  readonly href: string;
}

interface PresentationFixtureFields {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly recordLabel: string;
  readonly recordValue: string;
  readonly retrievedAt: string;
  readonly sourceUpdatedAt?: string;
  readonly retrieval: RetrievalCompleteness;
  readonly modelState: ModelState;
  readonly officialSource: PresentationOfficialSource;
  readonly nextAction: PresentationNextAction;
  readonly coverageNotes?: { readonly label: string; readonly href: string };
  readonly comparisons: readonly {
    readonly label: string;
    readonly submitted: string;
    readonly official: string;
    readonly status: "matched" | "missing" | "conflict";
  }[];
}

type PresentationFixtureBase = PresentationFixtureFields &
  (
    | { readonly dataMode: "current_query"; readonly capturedAt?: never }
    | { readonly dataMode: "recorded_response"; readonly capturedAt: string }
  );

type MatchPresentationProvider = "CPSC" | "FDA";
type PresentationProvider = MatchPresentationProvider | "NHTSA";

export type PresentationFixture =
  | (PresentationFixtureBase & {
      readonly state: "possible_match";
      readonly provider: MatchPresentationProvider;
      readonly possibleMatchReason: PossibleMatchReason;
    })
  | (PresentationFixtureBase & {
      readonly state: "confirmed_match" | "identifier_conflict";
      readonly provider: MatchPresentationProvider;
      readonly possibleMatchReason?: never;
    })
  | (PresentationFixtureBase & {
      readonly state: "vehicle_campaigns_found";
      readonly provider: "NHTSA";
      readonly possibleMatchReason?: never;
    })
  | (PresentationFixtureBase & {
      readonly state: Exclude<
        ScanState,
        "possible_match" | "confirmed_match" | "identifier_conflict" | "vehicle_campaigns_found"
      >;
      readonly provider: PresentationProvider;
      readonly possibleMatchReason?: never;
    });

export function presentationToneFor(
  fixture: Pick<PresentationFixture, "state" | "retrieval" | "modelState">,
): PresentationTone {
  if (fixture.state === "confirmed_match") return "confirmed";
  if (fixture.state === "possible_match") return "possible";
  if (fixture.retrieval === "unavailable" || fixture.modelState === "model_unavailable") return "unavailable";
  return "neutral";
}

const RETRIEVED_AT = new Date("2026-01-02T03:04:05.000Z");
const RECORDED_CAPTURED_AT = "2026-01-02T02:45:00.000Z";
const OFFICIAL_SOURCES = {
  cpsc: { label: "CPSC recall search", href: "https://www.cpsc.gov/Recalls" },
  fda: { label: "FDA food enforcement dataset", href: "https://open.fda.gov/apis/food/enforcement/" },
  nhtsa: { label: "NHTSA campaigns data", href: "https://www.nhtsa.gov/nhtsa-datasets-and-apis" },
} as const satisfies Readonly<Record<"cpsc" | "fda" | "nhtsa", PresentationOfficialSource>>;
const RECORDED_CPSC_RETRIEVAL: RetrievalStatus = {
  completeness: "complete",
  requiredQueries: 1,
  completedQueries: 1,
  fullyCompletedProviderIds: ["cpsc"],
  capped: false,
  truncated: false,
};

export const PRESENTATION_FIXTURES: readonly PresentationFixture[] = [
  {
    id: "cpsc-confirmed",
    state: "confirmed_match",
    title: "Identifiers match this published CPSC recall record",
    body: "The user-confirmed model and UPC align with the same product entry in the recorded fixture.",
    provider: "CPSC",
    recordLabel: "Recall number",
    recordValue: "DEMO-CPSC-001",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "external", label: "Review the official recall notice", href: "https://www.cpsc.gov/Recalls" },
    comparisons: [
      { label: "Model", submitted: "RT-DEMO-01", official: "RT-DEMO-01", status: "matched" },
      { label: "UPC", submitted: "012345678905", official: "012345678905", status: "matched" },
    ],
  },
  {
    id: "possible-missing",
    state: "possible_match",
    possibleMatchReason: "user_evidence_missing",
    title: "More proof needed",
    body: "A candidate record was found. Photograph the serial code beneath the product label to evaluate its published range.",
    provider: "CPSC",
    recordLabel: "Candidate recall",
    recordValue: "DEMO-CPSC-002",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "internal", label: "Add serial-code evidence" },
    comparisons: [
      { label: "Model", submitted: "RT-DEMO-02", official: "RT-DEMO-02", status: "matched" },
      { label: "Serial", submitted: "Not provided", official: "Published range", status: "missing" },
    ],
  },
  {
    id: "possible-record",
    state: "possible_match",
    possibleMatchReason: "record_not_unit_verifiable",
    title: "Official record lacks machine-verifiable unit detail — review the notice",
    body: "RedTag found a candidate record, but the published qualifier cannot be evaluated deterministically.",
    provider: "CPSC",
    recordLabel: "Candidate recall",
    recordValue: "DEMO-CPSC-003",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "external", label: "Review CPSC recall notices", href: "https://www.cpsc.gov/Recalls" },
    comparisons: [{ label: "Date code", submitted: "APR-26", official: "Unstructured qualifier", status: "missing" }],
  },
  {
    id: "identifier-conflict",
    state: "identifier_conflict",
    title: "Identifier conflict",
    body: "The confirmed model differs from the candidate record. Correct the submitted value or review the official notice.",
    provider: "CPSC",
    recordLabel: "Candidate recall",
    recordValue: "DEMO-CPSC-004",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "internal", label: "Correct the submitted model" },
    comparisons: [{ label: "Model", submitted: "RT-DEMO-04B", official: "RT-DEMO-04A", status: "conflict" }],
  },
  {
    id: "vehicle-campaigns",
    state: "vehicle_campaigns_found",
    title: "Campaigns associated with this vehicle type",
    body: "NHTSA returned campaigns associated with the decoded vehicle type. Use NHTSA’s official VIN lookup for vehicle-specific status.",
    provider: "NHTSA",
    recordLabel: "Decoded vehicle type",
    recordValue: "2020 Demo Motors Example",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.nhtsa,
    nextAction: { kind: "external", label: "Open NHTSA’s official VIN lookup", href: "https://www.nhtsa.gov/recalls" },
    coverageNotes: { label: "Read NHTSA coverage notes", href: "https://www.nhtsa.gov/recalls" },
    comparisons: [
      { label: "Model year", submitted: "2020", official: "2020", status: "matched" },
      { label: "Make", submitted: "Demo Motors", official: "Demo Motors", status: "matched" },
      { label: "Model", submitted: "Example", official: "Example", status: "matched" },
    ],
  },
  {
    id: "no-match",
    state: "no_match_found",
    title: "No matching record found",
    body: formatNoMatchCopy(RECORDED_CPSC_RETRIEVAL, RETRIEVED_AT),
    provider: "CPSC",
    recordLabel: "Completed source",
    recordValue: "CPSC",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "internal", label: "Check another identifier" },
    comparisons: [],
  },
  {
    id: "source-unavailable",
    state: "not_evaluated",
    title: "Official source unavailable",
    body: "CPSC did not complete a valid response. RedTag did not produce a record conclusion.",
    provider: "CPSC",
    recordLabel: "Source status",
    recordValue: "Unavailable",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "unavailable",
    modelState: "model_ready",
    dataMode: "current_query",
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "internal", label: "Retry the current provider query" },
    comparisons: [],
  },
  {
    id: "manual-mode",
    state: "not_evaluated",
    title: "Image assistance unavailable",
    body: "Your evidence remains in this session. Enter the category and decisive identifier manually to continue.",
    provider: "CPSC",
    recordLabel: "Model status",
    recordValue: "Manual mode",
    retrievedAt: RETRIEVED_AT.toISOString(),
    retrieval: "unavailable",
    modelState: "model_unavailable",
    dataMode: "current_query",
    officialSource: OFFICIAL_SOURCES.cpsc,
    nextAction: { kind: "internal", label: "Enter details manually" },
    comparisons: [],
  },
  {
    id: "recorded-response",
    state: "possible_match",
    possibleMatchReason: "user_evidence_missing",
    title: "More proof needed",
    body: "Lot code is still needed. Coverage shown: publicly releasable openFDA food-enforcement records from 2004 onward; source last updated 2025-12-29, updates are weekly, and this dataset does not track current lifecycle status.",
    provider: "FDA",
    recordLabel: "Enforcement report",
    recordValue: "DEMO-FDA-001",
    retrievedAt: RETRIEVED_AT.toISOString(),
    sourceUpdatedAt: "2025-12-29",
    retrieval: "complete",
    modelState: "model_ready",
    dataMode: "recorded_response",
    capturedAt: RECORDED_CAPTURED_AT,
    officialSource: OFFICIAL_SOURCES.fda,
    nextAction: { kind: "internal", label: "Add lot-code evidence" },
    comparisons: [{ label: "Lot", submitted: "Not provided", official: "Required by recorded product line", status: "missing" }],
  },
];
```

- [ ] **Step 3: Test the deterministic state-to-tone and copy policies**

Create `tests/unit/results/presentation-policy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { presentationToneFor } from "@/features/results/presentation-fixture";

describe("presentationToneFor", () => {
  it("reserves recall emphasis for deterministic confirmation", () => {
    expect(presentationToneFor({ state: "confirmed_match", retrieval: "partial", modelState: "model_ready" })).toBe("confirmed");
  });

  it("keeps possible matches amber regardless of data mode", () => {
    expect(presentationToneFor({ state: "possible_match", retrieval: "complete", modelState: "model_ready" })).toBe("possible");
  });

  it("uses unavailable treatment for operational failure", () => {
    expect(presentationToneFor({ state: "not_evaluated", retrieval: "unavailable", modelState: "model_ready" })).toBe("unavailable");
    expect(presentationToneFor({ state: "not_evaluated", retrieval: "complete", modelState: "model_unavailable" })).toBe("unavailable");
  });

  it("keeps no-match neutral", () => {
    expect(presentationToneFor({ state: "no_match_found", retrieval: "complete", modelState: "model_ready" })).toBe("neutral");
  });
});
```

Create `tests/unit/results/presentation-copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assertAppCopyAllowed } from "@/domain/safety/copy-policy";
import { PRESENTATION_FIXTURES } from "@/features/results/presentation-fixture";

describe("fixture outcome-copy registry", () => {
  it("allows every app-authored title, body, source label, and action", () => {
    for (const fixture of PRESENTATION_FIXTURES) {
      for (const copy of [fixture.title, fixture.body, fixture.officialSource.label, fixture.nextAction.label]) {
        expect(() => assertAppCopyAllowed(copy)).not.toThrow();
      }
      const coverageNotes = fixture.coverageNotes;
      if (coverageNotes) {
        expect(() => assertAppCopyAllowed(coverageNotes.label)).not.toThrow();
      }
    }
  });
});
```

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit tests/unit/results/presentation-contract.test.tsx tests/unit/results/presentation-policy.test.ts tests/unit/results/presentation-copy.test.ts
```

Expected: all presentation policy and copy-registry tests pass. A fixture cannot select its own tone.

Commit and publish the typed presentation policy before implementing the gallery surface:

```powershell
. ./scripts/invoke-checked.ps1
git add src/features/results/presentation-fixture.ts tests/unit/results/presentation-contract.test.tsx tests/unit/results/presentation-policy.test.ts tests/unit/results/presentation-copy.test.ts
git commit -m "feat(results): define safety-state presentation policy"
git push -u origin feat/result-presentation-foundation
gh pr create --draft --fill --base main --head feat/result-presentation-foundation --title "feat(results): add the gated safety-state gallery"
```

Expected: the draft PR is open with deterministic state-to-tone and copy-registry tests passing.

- [ ] **Step 4: Build the reusable evidence-sheet preview**

Create `tests/unit/results/state-preview.test.tsx` before the component exists:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PRESENTATION_FIXTURES } from "@/features/results/presentation-fixture";
import { StatePreview } from "@/features/results/state-preview";

describe("StatePreview", () => {
  it("anchors evidence, retrieval and capture provenance, official source, comparisons, and next action", () => {
    const fixture = PRESENTATION_FIXTURES.find(({ id }) => id === "cpsc-confirmed");
    if (!fixture) throw new Error("Confirmed fixture is required");

    render(<StatePreview fixture={fixture} />);

    const article = screen.getByRole("article");
    expect(article).toHaveAttribute("data-state", "confirmed_match");
    expect(article).toHaveAttribute("data-tone", "confirmed");
    expect(screen.getByRole("img", { name: /Submitted demo evidence label/ })).toBeVisible();
    expect(screen.getByText("Recorded Provider Response")).toBeVisible();
    expect(
      screen.getByText(
        "Recorded provider response — captured 2026-01-02T02:45:00.000Z, not a current provider query.",
      ),
    ).toBeVisible();
    expect(screen.getByText("2026-01-02T03:04:05.000Z")).toBeVisible();
    expect(screen.getAllByText("Match")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "CPSC recall search" })).toHaveAttribute(
      "href",
      "https://www.cpsc.gov/Recalls",
    );
    expect(screen.getByRole("link", { name: "Review the official recall notice" })).toHaveAttribute(
      "href",
      "https://www.cpsc.gov/Recalls",
    );
  });
});
```

Run: `pnpm test:unit tests/unit/results/state-preview.test.tsx`

Expected: FAIL because `state-preview.tsx` does not exist.

Create the self-authored visual fixture `public/demo/evidence-label.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-labelledby="title description">
  <title id="title">RedTag demo evidence label</title>
  <desc id="description">A neutral package-shaped demo fixture that is not a consumer product.</desc>
  <rect width="640" height="480" fill="#f5f0e7"/>
  <rect x="64" y="56" width="512" height="368" rx="18" fill="#fffdf8" stroke="#d9d1c4" stroke-width="4"/>
  <text x="104" y="150" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#1f2925">DEMO FIXTURE</text>
  <text x="104" y="205" font-family="Arial, sans-serif" font-size="24" fill="#53646b">NOT A CONSUMER PRODUCT</text>
  <path d="M104 260h324M104 310h248M104 360h286" stroke="#486154" stroke-width="18" stroke-linecap="round"/>
</svg>
```

Create `src/features/results/state-preview.tsx`:

```tsx
"use client";

import { presentationToneFor, type PresentationFixture } from "./presentation-fixture";
import styles from "./state-preview.module.css";

const COMPARISON_STATUS = { matched: "Match", missing: "Needed", conflict: "Conflict" } as const;

interface StatePreviewProps {
  readonly fixture: PresentationFixture;
  readonly onInternalAction?: (action: Extract<PresentationFixture["nextAction"], { kind: "internal" }>) => void;
}

export function StatePreview({ fixture, onInternalAction }: Readonly<StatePreviewProps>) {
  const isConfirmed = fixture.state === "confirmed_match";
  const tone = presentationToneFor(fixture);
  const nextAction = fixture.nextAction;
  const coverageNotes = fixture.coverageNotes;

  return (
    <article
      className={`${styles.sheet} ${styles[tone]}`}
      data-state={fixture.state}
      data-tone={tone}
      data-mode={fixture.dataMode}
      data-recall-emphasis={isConfirmed ? "true" : "false"}
      aria-labelledby={`${fixture.id}-title`}
    >
      <figure className={styles.evidence}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static self-created fixture */}
        <img src="/demo/evidence-label.svg" alt="Submitted demo evidence label; not a consumer product" />
        <figcaption>Submitted evidence · demo fixture</figcaption>
      </figure>

      <header className={styles.outcome}>
        <div>
          <span className={styles.provider}>{fixture.provider}</span>
          <span className={styles.mode}>
            {fixture.dataMode === "recorded_response" ? "Recorded Provider Response" : "Current Provider Query"}
          </span>
        </div>
        <h2 id={`${fixture.id}-title`}>{fixture.title}</h2>
        {fixture.dataMode === "recorded_response" ? (
          <p className={styles.recordedNotice}>
            Recorded provider response — captured {fixture.capturedAt}, not a current provider query.
          </p>
        ) : null}
        <p>{fixture.body}</p>
      </header>

      <dl className={styles.metadata}>
        <div>
          <dt>{fixture.recordLabel}</dt>
          <dd>{fixture.recordValue}</dd>
        </div>
        <div>
          <dt>Retrieval</dt>
          <dd>{fixture.retrieval}</dd>
        </div>
        <div>
          <dt>Retrieved by RedTag</dt>
          <dd>{fixture.retrievedAt}</dd>
        </div>
        <div>
          <dt>Assistance</dt>
          <dd>{fixture.modelState === "model_ready" ? "GPT-5.6 extraction available" : "Manual mode"}</dd>
        </div>
        {fixture.sourceUpdatedAt ? (
          <div>
            <dt>Source last updated</dt>
            <dd>{fixture.sourceUpdatedAt}</dd>
          </div>
        ) : null}
        <div>
          <dt>Official source</dt>
          <dd>
            <a href={fixture.officialSource.href} rel="noreferrer" target="_blank">
              {fixture.officialSource.label}
            </a>
          </dd>
        </div>
      </dl>

      {fixture.comparisons.length > 0 ? (
        <dl className={styles.comparisons} aria-label="Identifier comparison">
          {fixture.comparisons.map((comparison) => (
            <div className={styles.comparison} key={comparison.label} data-comparison={comparison.status}>
              <dt>
                <span>{comparison.label}</span>
                <span className={styles.comparisonStatus}>{COMPARISON_STATUS[comparison.status]}</span>
              </dt>
              <dd>
                <span>Submitted</span>
                <code>{comparison.submitted}</code>
              </dd>
              <dd>
                <span>Official record</span>
                <code>{comparison.official}</code>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <footer>
        {nextAction.kind === "external" ? (
          <a href={nextAction.href} rel="noreferrer" target="_blank">
            {nextAction.label}
          </a>
        ) : (
          <button type="button" onClick={() => onInternalAction?.(nextAction)}>
            {nextAction.label}
          </button>
        )}
        {coverageNotes ? (
          <a href={coverageNotes.href} rel="noreferrer" target="_blank">
            {coverageNotes.label}
          </a>
        ) : null}
      </footer>
    </article>
  );
}
```

Create `src/features/results/state-preview.module.css`:

```css
.sheet {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: var(--surface);
  color: var(--ink);
}

.evidence,
.outcome,
.metadata,
.comparisons,
.sheet footer {
  padding: var(--space-4);
}

.evidence {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  margin: 0;
  border-bottom: 1px solid var(--line);
}

.evidence img {
  width: 96px;
  height: 72px;
  border-radius: var(--radius-control);
  object-fit: cover;
}

.evidence figcaption {
  color: var(--neutral-info);
  font-size: 0.78rem;
  font-weight: 750;
}

.outcome {
  display: grid;
  gap: var(--space-2);
  border-top: 0.25rem solid var(--neutral-info);
}

.confirmed .outcome {
  border-top-color: var(--recall);
  background: var(--recall-soft);
}

.possible .outcome {
  border-top-color: var(--amber-ink);
  background: var(--amber-soft);
}

.neutral .outcome {
  background: var(--neutral-info-soft);
}

.unavailable .outcome {
  border-top-style: dashed;
}

.outcome > div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.provider,
.mode {
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mode {
  color: var(--neutral-info);
  text-align: right;
}

.outcome h2 {
  margin: 0;
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: clamp(1.45rem, 5vw, 2rem);
  line-height: 1.08;
}

.confirmed .outcome h2 {
  color: var(--recall-ink);
}

.possible .outcome h2 {
  color: var(--amber-ink);
}

.outcome p,
.metadata dd {
  margin: 0;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.recordedNotice {
  padding: var(--space-2) var(--space-3);
  border-left: 3px solid var(--neutral-info);
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 750;
}

.metadata a {
  color: var(--ink);
  font-weight: 750;
  text-underline-offset: 0.18em;
}

.metadata {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.metadata div {
  display: grid;
  grid-template-columns: minmax(7rem, 0.45fr) 1fr;
  gap: var(--space-4);
}

.metadata dt,
.comparison dd > span {
  color: var(--neutral-info);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.comparisons {
  display: grid;
  gap: 0;
}

.comparison {
  display: grid;
  grid-template-columns: minmax(7rem, 0.6fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-2);
  align-items: center;
}

.comparison {
  min-height: 3.25rem;
  border-top: 1px solid var(--line);
}

.comparison dt,
.comparison dd {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  margin: 0;
}

.comparison dt > span:first-child {
  font-weight: 800;
}

.comparisonStatus {
  color: var(--neutral-info);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.confirmed .comparison[data-comparison="matched"] .comparisonStatus {
  color: var(--recall-ink);
}

.comparison[data-comparison="missing"] .comparisonStatus {
  color: var(--amber-ink);
}

.comparison code {
  overflow-wrap: anywhere;
  font-family: var(--font-mono), "SFMono-Regular", Consolas, monospace;
  font-variant-numeric: tabular-nums;
}

.comparison[data-comparison="missing"] code:last-child {
  color: var(--amber-ink);
}

.sheet footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  border-top: 1px solid var(--line);
}

.sheet footer a,
.sheet footer button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  color: var(--ink);
  font-weight: 800;
  text-underline-offset: 0.25rem;
}

.sheet footer button {
  padding: 0;
  border: 0;
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

@media (max-width: 48rem) {
  .metadata div {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  .comparison {
    grid-template-columns: 1fr;
    gap: var(--space-1);
    padding: var(--space-2) 0;
  }
}
```

Run: `pnpm test:unit tests/unit/results`

Expected: every presentation-registry, policy, copy, and `StatePreview` test passes.

- [ ] **Step 5: Add the server-only environment gate**

Create `src/app/dev/state-gallery/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRESENTATION_FIXTURES } from "@/features/results/presentation-fixture";
import { StatePreview } from "@/features/results/state-preview";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function StateGalleryPage() {
  if (process.env.NODE_ENV === "production" || process.env.REDTAG_ENABLE_STATE_GALLERY !== "1") notFound();

  return (
    <main className={styles.gallery}>
      <header>
        <p>Internal visual review</p>
        <h1>Safety-state family</h1>
        <strong>Fixture data only — no live provider query</strong>
      </header>
      <div className={styles.grid}>
        {PRESENTATION_FIXTURES.map((fixture) => (
          <StatePreview key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </main>
  );
}
```

Create `src/app/dev/state-gallery/page.module.css`:

```css
.gallery {
  width: min(100% - 2rem, 96rem);
  margin: 0 auto;
  padding: var(--space-8) 0 var(--space-16);
}

.gallery > header {
  display: grid;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--line);
}

.gallery > header p,
.gallery > header h1 {
  margin: 0;
}

.gallery > header p,
.gallery > header strong {
  color: var(--neutral-info);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.gallery > header h1 {
  font-family: var(--font-display), "Iowan Old Style", Georgia, serif;
  font-size: clamp(2.2rem, 6vw, 4.8rem);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 72rem) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
```

- [ ] **Step 6: Prove the gallery is inaccessible by default**

Append to `tests/e2e/foundation.spec.ts`:

```ts
test("does not expose the internal state gallery by default", async ({ page }) => {
  const response = await page.goto("/dev/state-gallery");
  expect(response?.status()).toBe(404);
});
```

Run: `pnpm test:e2e:smoke`

Expected: the internal route returns 404 in the normal development and production configuration.

- [ ] **Step 7: Add the explicit visual-test runner**

Create `playwright.visual.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}-{projectName}{ext}",
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 } },
  use: { baseURL: "http://127.0.0.1:3000", colorScheme: "light" },
  webServer: {
    command: "pnpm dev",
    env: { REDTAG_ENABLE_STATE_GALLERY: "1" },
    url: "http://127.0.0.1:3000/dev/state-gallery",
    reuseExistingServer: false,
  },
  projects: [
    { name: "phone", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
```

Create `tests/visual/state-family.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("renders nine fixture frames and reserves recall emphasis for confirmation", async ({ page }) => {
  await page.goto("/dev/state-gallery");

  await expect(page.getByRole("article")).toHaveCount(9);
  await expect(page.locator('[data-recall-emphasis="true"]')).toHaveCount(1);
  await expect(page.locator('[data-recall-emphasis="true"]')).toHaveAttribute("data-state", "confirmed_match");
  await expect(page.locator('[data-state="possible_match"]:not([data-tone="possible"])')).toHaveCount(0);
  await expect(page.locator('[data-state="vehicle_campaigns_found"]')).toHaveAttribute("data-tone", "neutral");
  await expect(page.getByText("Fixture data only — no live provider query")).toBeVisible();
  await expect(page).toHaveScreenshot("redtag-state-family.png", { fullPage: true });
});

test("keeps the safety-state family structurally intact at 200 percent text", async ({ page }) => {
  await page.goto("/dev/state-gallery");
  await page.evaluate(() => document.documentElement.style.fontSize = "200%");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  for (const article of await page.getByRole("article").all()) {
    const box = await article.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  }
  await expect(page.getByRole("img", { name: "Submitted demo evidence label; not a consumer product" }).first()).toBeVisible();
});
```

Add this script to `package.json`:

```json
"test:visual": "playwright test --config playwright.visual.config.ts"
```

- [ ] **Step 8: Generate and inspect the initial visual baselines**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test:e2e:smoke
pnpm test:visual --update-snapshots
pnpm test:visual
```

Expected: normal E2E receives a 404 from the gallery; the explicit visual runner sees nine frames; the vehicle-campaign frame remains neutral; exactly one article has recall emphasis; phone and desktop screenshots are stable.

Inspect both generated PNGs side by side. Reject the baseline if red appears outside the confirmed fixture, if neutral no-match resembles clearance, if the recorded badge is not visible, or if comparison values cannot be read at 200% text zoom.

- [ ] **Step 9: Commit presentation code and approved baselines**

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add src/features/results src/app/dev public/demo playwright.visual.config.ts tests/unit/results/state-preview.test.tsx tests/visual tests/e2e/foundation.spec.ts package.json
git commit -m "feat(results): establish distinct safety-state presentation"
git push
```

Update the existing draft PR titled `feat(results): add the gated safety-state gallery`. Include the state-family screenshots, explicitly confirm that `/dev/state-gallery` returns 404 without the server-only flag, complete the template, and self-review. Then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: required checks are green, the presentation PR is merged with a merge commit, the branch is deleted, and local `main` contains the reviewed state family.

### Task 6: Installable and accessible PWA foundation

**Branch:** `feat/pwa-accessibility-foundation`

**Files:**
- Create: `src/app/manifest.ts`
- Create: `src/shared/service-worker-registration.tsx`
- Create: `src/shared/install-guidance.tsx`
- Create: `src/shared/install-guidance.module.css`
- Create: `src/proxy.ts`
- Modify: `src/app/layout.tsx`
- Create: `public/icon-source.svg`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `public/offline.html`
- Create: `public/sw.template.js`
- Generate (ignored): `public/sw.js`
- Create: `scripts/generate-icons.mjs`
- Create: `scripts/generate-service-worker.mjs`
- Create: `playwright.pwa.config.ts`
- Create: `tests/unit/pwa/pwa-policy.test.ts`
- Create: `tests/unit/pwa/install-guidance.test.ts`
- Create: `tests/unit/pwa/security-headers.test.ts`
- Create: `tests/e2e/pwa.spec.ts`
- Modify: `tests/e2e/foundation.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: root layout and static application shell from Tasks 2 and 4.
- Produces: `/manifest.webmanifest`, `/sw.js`, generated 192/512 PNG icons, a cache policy that later scan APIs must remain outside, and separately tested iOS Add-to-Home-Screen guidance.

- [ ] **Step 0: Create the branch from the latest protected base**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c feat/pwa-accessibility-foundation
git status -sb
```

Expected: `git status -sb` begins with `## feat/pwa-accessibility-foundation` and reports no changes.

- [ ] **Step 1: Write the failing installable-shell policy contract**

Create `tests/unit/pwa/pwa-policy.test.ts` before the manifest, worker, or registration leaf exists:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

describe("installable shell policy", () => {
  it("publishes the approved standalone identity", () => {
    expect(manifest()).toMatchObject({
      name: "RedTag — Universal Scan",
      short_name: "RedTag",
      start_url: "/",
      display: "standalone",
    });
  });

  it("versions a static-only cache and keeps APIs ahead of navigation handling", () => {
    const worker = source("../../../public/sw.template.js");
    const staticPaths = worker.match(/const STATIC_PATHS = new Set\(\[([\s\S]*?)\]\);/)?.[1];
    expect(worker).toContain('const CACHE_NAME = "redtag-shell-__REDTAG_BUILD_ID__"');
    expect(staticPaths?.match(/"\/[^\"]+"/g)).toEqual([
      '"/offline.html"',
      '"/manifest.webmanifest"',
      '"/icons/icon-192.png"',
      '"/icons/icon-512.png"',
    ]);
    expect(worker).toContain('url.pathname.startsWith("/api/")');
    expect(worker).toContain('request.mode === "navigate"');
    expect(worker.indexOf('url.pathname.startsWith("/api/")')).toBeLessThan(
      worker.indexOf('request.mode === "navigate"'),
    );
  });

  it("registers only in production and bypasses the HTTP cache for worker updates", () => {
    const registration = source("../../../src/shared/service-worker-registration.tsx");
    expect(registration).toContain('process.env.NODE_ENV !== "production"');
    expect(registration).toContain('updateViaCache: "none"');
  });

  it("mounts platform-specific install guidance without replacing Chromium installability", () => {
    const layout = source("../../../src/app/layout.tsx");
    const guidanceStyles = source("../../../src/shared/install-guidance.module.css");
    expect(layout).toContain('import { InstallGuidance } from "@/shared/install-guidance"');
    expect(layout).toContain("<InstallGuidance />");
    expect(guidanceStyles).not.toContain("position: fixed");
  });
});
```

Create `tests/unit/pwa/install-guidance.test.ts` before its module exists:

```ts
import { describe, expect, it } from "vitest";
import { IOS_INSTALL_GUIDANCE, installGuidanceFor } from "@/shared/install-guidance";

const iphone = {
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
  platform: "iPhone",
  maxTouchPoints: 5,
  standalone: false,
};

describe("platform install guidance", () => {
  it("returns explicit iOS Add-to-Home-Screen steps", () => {
    expect(installGuidanceFor(iphone)).toBe(IOS_INSTALL_GUIDANCE);
    expect(IOS_INSTALL_GUIDANCE).toBe("On iPhone or iPad, tap Share, then choose Add to Home Screen.");
  });

  it("recognizes iPadOS desktop-mode identification", () => {
    expect(installGuidanceFor({ ...iphone, userAgent: "Mozilla/5.0 Macintosh AppleWebKit/605.1.15", platform: "MacIntel" })).toBe(
      IOS_INSTALL_GUIDANCE,
    );
  });

  it("stays hidden when already installed or on a desktop browser", () => {
    expect(installGuidanceFor({ ...iphone, standalone: true })).toBeNull();
    expect(
      installGuidanceFor({ userAgent: "Mozilla/5.0 Windows Chrome/140", platform: "Win32", maxTouchPoints: 0, standalone: false }),
    ).toBeNull();
  });
});
```

Run: `pnpm test:unit tests/unit/pwa/pwa-policy.test.ts tests/unit/pwa/install-guidance.test.ts`

Expected: FAIL because the manifest, service-worker template, registration module, and iOS install-guidance module do not exist.

- [ ] **Step 2: Add a self-created neutral icon source and deterministic generator**

Create `public/icon-source.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title">
  <title id="title">RedTag</title>
  <rect width="512" height="512" rx="112" fill="#1f2925"/>
  <path d="M108 128h218l78 78v178H108z" fill="#f5f0e7"/>
  <circle cx="332" cy="190" r="23" fill="#1f2925"/>
  <path d="M172 252h168M172 306h116" stroke="#53646b" stroke-width="24" stroke-linecap="round"/>
</svg>
```

Create `scripts/generate-icons.mjs`:

```js
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const source = fileURLToPath(new URL("../public/icon-source.svg", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../public/icons/", import.meta.url));
await mkdir(outputDirectory, { recursive: true });

for (const size of [192, 512]) {
  const output = fileURLToPath(new URL(`../public/icons/icon-${size}.png`, import.meta.url));
  await sharp(source)
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true })
    .toFile(output);
}
```

Add this script to `package.json`:

```json
"icons:generate": "node scripts/generate-icons.mjs"
```

Run: `pnpm icons:generate`

Expected: both PNG files exist, are exactly square, and are visually identical to the original neutral SVG at their target sizes.

- [ ] **Step 3: Add the web manifest**

Create `src/app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RedTag — Universal Scan",
    short_name: "RedTag",
    description: "Scan a supported item. Verify the evidence. Know what to do next.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e7",
    theme_color: "#f5f0e7",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
```

- [ ] **Step 4: Add the explicit shell-only service worker**

Create `public/offline.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#f5f0e7" />
    <title>RedTag is offline</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; box-sizing: border-box; background: #f5f0e7; color: #1f2925; font-family: system-ui, sans-serif; }
      main { width: min(100%, 36rem); }
      h1 { font-family: Georgia, serif; font-size: clamp(2rem, 8vw, 4rem); line-height: 1; }
      p { line-height: 1.6; }
      a { color: #1f2925; font-weight: 750; }
    </style>
  </head>
  <body>
    <main>
      <p>RedTag · offline</p>
      <h1>A source check needs a connection.</h1>
      <p>Your browser cannot query an official source while offline. Reconnect, then return to start a new scan.</p>
      <a href="/">Try RedTag again</a>
    </main>
  </body>
</html>
```

Create `public/sw.template.js`:

```js
const CACHE_NAME = "redtag-shell-__REDTAG_BUILD_ID__";
const STATIC_PATHS = new Set(["/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll([...STATIC_PATHS])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith("redtag-shell-") && name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }

  if (STATIC_PATHS.has(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
  }
});
```

Create `scripts/generate-service-worker.mjs`:

```js
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const templatePath = fileURLToPath(new URL("../public/sw.template.js", import.meta.url));
const outputPath = fileURLToPath(new URL("../public/sw.js", import.meta.url));
const environmentId = process.env.REDTAG_BUILD_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
const gitId = environmentId ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const buildId = gitId.slice(0, 40);

if (!/^[a-zA-Z0-9._-]{7,40}$/.test(buildId)) throw new Error("REDTAG_BUILD_ID must be a stable 7-40 character build identifier");

const template = await readFile(templatePath, "utf8");
await writeFile(outputPath, template.replaceAll("__REDTAG_BUILD_ID__", buildId), "utf8");
```

Add these scripts to `package.json`:

```json
"pwa:generate": "node scripts/generate-service-worker.mjs",
"prebuild": "pnpm pwa:generate"
```

Run:

```powershell
. ./scripts/invoke-checked.ps1
$env:REDTAG_BUILD_ID='foundation-test'
try { pnpm pwa:generate } finally { Remove-Item Env:REDTAG_BUILD_ID -ErrorAction SilentlyContinue }
```

Expected: ignored `public/sw.js` contains `redtag-shell-foundation-test`, contains no `__REDTAG_BUILD_ID__`, never caches `/`, and keeps `/api/` outside every response handler. Each production commit therefore receives a new cache namespace, while navigation remains network-first with a static offline fallback.

- [ ] **Step 5: Register the service worker at a client-only leaf**

Create `src/shared/service-worker-registration.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  }, []);

  return null;
}
```

Create `src/shared/install-guidance.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./install-guidance.module.css";

export const IOS_INSTALL_GUIDANCE = "On iPhone or iPad, tap Share, then choose Add to Home Screen.";

interface InstallEnvironment {
  readonly userAgent: string;
  readonly platform: string;
  readonly maxTouchPoints: number;
  readonly standalone: boolean;
}

export function installGuidanceFor(environment: InstallEnvironment): string | null {
  const iOSDevice =
    /iPad|iPhone|iPod/.test(environment.userAgent) ||
    (environment.platform === "MacIntel" && environment.maxTouchPoints > 1);
  return iOSDevice && !environment.standalone ? IOS_INSTALL_GUIDANCE : null;
}

export function InstallGuidance() {
  const [guidance, setGuidance] = useState<string | null>(null);

  useEffect(() => {
    const iosNavigator = navigator as Navigator & { readonly standalone?: boolean };
    setGuidance(
      installGuidanceFor({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
        standalone: window.matchMedia("(display-mode: standalone)").matches || iosNavigator.standalone === true,
      }),
    );
  }, []);

  if (!guidance) return null;
  return (
    <aside className={styles.guidance} role="note" aria-label="Install RedTag on iPhone or iPad">
      <strong>Install RedTag</strong>
      <span>{guidance}</span>
    </aside>
  );
}
```

Create `src/shared/install-guidance.module.css`:

```css
.guidance {
  display: grid;
  gap: 0.25rem;
  width: min(calc(100% - 2rem), 32rem);
  margin: 0 auto 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
  background: var(--surface);
  box-shadow: var(--shadow-elevated);
  color: var(--ink);
  font-size: 0.85rem;
  line-height: 1.45;
}
```

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { InstallGuidance } from "@/shared/install-guidance";
import { ServiceWorkerRegistration } from "@/shared/service-worker-registration";
import { APP_NAME, APP_PROMISE } from "./product-copy";
import "./globals.css";

const bodyFont = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const monoFont = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_PROMISE,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f5f0e7",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>
        {children}
        <InstallGuidance />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
```

Verify and publish the first installable-shell checkpoint before adding transport policy and browser assertions:

```powershell
. ./scripts/invoke-checked.ps1
pnpm icons:generate
$env:REDTAG_BUILD_ID='foundation-test'
try { pnpm pwa:generate } finally { Remove-Item Env:REDTAG_BUILD_ID -ErrorAction SilentlyContinue }
pnpm format
pnpm format:check
pnpm test:unit tests/unit/pwa/pwa-policy.test.ts tests/unit/pwa/install-guidance.test.ts
pnpm typecheck
pnpm build
git add package.json scripts/generate-icons.mjs scripts/generate-service-worker.mjs public/icon-source.svg public/icons public/offline.html public/sw.template.js src/app/manifest.ts src/app/layout.tsx src/shared tests/unit/pwa/pwa-policy.test.ts tests/unit/pwa/install-guidance.test.ts
git commit -m "feat(pwa): add the versioned installable shell"
git push -u origin feat/pwa-accessibility-foundation
gh pr create --draft --fill --base main --head feat/pwa-accessibility-foundation --title "feat(pwa): add the accessible installable foundation"
```

Expected: the installable-shell and iOS-guidance policies pass, Chromium installability remains manifest/service-worker based, the generated worker remains ignored, the build succeeds, and the draft PR is open before proxy and E2E changes begin.

- [ ] **Step 6: Write the failing document-security contract**

Create `tests/unit/pwa/security-headers.test.ts` before the proxy exists:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const proxySource = readFileSync(
  fileURLToPath(new URL("../../../src/proxy.ts", import.meta.url)),
  "utf8",
);
const pageSource = readFileSync(
  fileURLToPath(new URL("../../../src/app/page.tsx", import.meta.url)),
  "utf8",
);

describe("document security policy", () => {
  it("declares the required isolation and same-origin boundaries", () => {
    for (const directive of [
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "connect-src 'self'",
      "img-src 'self' blob: data:",
    ]) {
      expect(proxySource).toContain(directive);
    }
  });

  it("limits relaxed script/style policy to development and emits production HSTS", () => {
    expect(proxySource).toContain('process.env.NODE_ENV === "development"');
    expect(proxySource).toContain('process.env.NODE_ENV === "production"');
    expect(proxySource).toContain("max-age=63072000; includeSubDomains; preload");
  });

  it("request-renders the public document so Next.js can attach the nonce", () => {
    expect(pageSource).toContain('import { connection } from "next/server"');
    expect(pageSource).toContain("await connection()");
  });
});
```

Run: `pnpm test:unit tests/unit/pwa/security-headers.test.ts`

Expected: FAIL because `src/proxy.ts` does not exist.

- [ ] **Step 7: Add nonce-aware content security and production transport policy**

Create `src/proxy.ts`:

```ts
import { Buffer } from "node:buffer";
import { NextResponse, type NextRequest } from "next/server";

function contentSecurityPolicy(nonce: string): string {
  const developmentScript = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  const developmentStyle = process.env.NODE_ENV === "development" ? " 'unsafe-inline'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScript}`,
    `style-src 'self' 'nonce-${nonce}'${developmentStyle}`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|icons|offline.html|sw.js|manifest.webmanifest|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
```

The nonce changes per document request, is forwarded only as an internal request header for Next.js to apply to framework scripts/styles, and is never written to logs. Browser `connect-src` remains same-origin because OpenAI and government providers are server-only.

Run: `pnpm test:unit tests/unit/pwa/security-headers.test.ts`

Expected: all three document-security contract cases pass, including the dynamic document boundary required for nonce injection.

- [ ] **Step 8: Write the production PWA, cache, and header checks**

Create `playwright.pwa.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm start",
    env: { REDTAG_ENABLE_STATE_GALLERY: "1" },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
  },
});
```

Create `tests/e2e/pwa.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("publishes an installable manifest and controls the page", async ({ page }) => {
  await page.goto("/offline.html");
  await page.evaluate(async () => void (await caches.open("redtag-shell-obsolete")));
  const home = await page.goto("/");
  expect(home).not.toBeNull();
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: "RedTag — Universal Scan",
    display: "standalone",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192" },
      { src: "/icons/icon-512.png", sizes: "512x512" },
    ],
  });
  await expect(page.getByRole("note", { name: "Install RedTag on iPhone or iPad" })).toHaveCount(0);

  const policy = home?.headers()["content-security-policy"] ?? "";
  expect(policy).toContain("script-src 'self' 'nonce-");
  expect(policy).toContain("object-src 'none'");
  expect(policy).toContain("base-uri 'self'");
  expect(policy).toContain("form-action 'self'");
  expect(policy).toContain("frame-ancestors 'none'");
  expect(policy).toContain("connect-src 'self'");
  expect(policy).not.toContain("unsafe-eval");
  expect(home?.headers()["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains; preload");

  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  const scriptNonces = await page.locator("script[nonce]").evaluateAll((scripts) =>
    scripts.map((script) => (script as HTMLScriptElement).nonce),
  );
  expect(scriptNonces.length).toBeGreaterThan(0);
  expect(new Set(scriptNonces)).toEqual(new Set([nonce]));

  await page.getByRole("button", { name: "Enter details manually" }).click();
  await page.getByLabel("Model or identifier").fill("ABC-123");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("status")).toContainText("Details ready for evidence review");

  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.reload();
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).includes("redtag-shell-obsolete"))).toBe(false);

  const gallery = await page.request.get("/dev/state-gallery");
  expect(gallery.status()).toBe(404);
});

test("keeps API requests and identifiers out of Cache Storage", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.evaluate(async () => {
    await fetch("/api/scan/extract", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cacheProbe: "SENSITIVE-BODY-SENTINEL" }),
    });
  });

  const cacheContents = await page.evaluate(async () => {
    const urls: string[] = [];
    const bodies: string[] = [];
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName);
      for (const request of await cache.keys()) {
        urls.push(request.url);
        const response = await cache.match(request);
        if (response) bodies.push(await response.clone().text());
      }
    }
    return { urls, bodies };
  });

  expect(cacheContents.urls).not.toEqual(expect.arrayContaining([expect.stringContaining("/api/")]));
  expect([...cacheContents.urls, ...cacheContents.bodies].join("\n")).not.toContain("SENSITIVE-BODY-SENTINEL");
  expect(cacheContents.urls.every((url) => ["/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"].includes(new URL(url).pathname))).toBe(true);
  expect(cacheContents.urls.some((url) => new URL(url).pathname === "/")).toBe(false);
});
```

Add this script to `package.json`:

```json
"test:pwa": "pnpm build && playwright test --config playwright.pwa.config.ts tests/e2e/pwa.spec.ts"
```

- [ ] **Step 9: Add keyboard, 200% text, and reduced-motion smoke checks**

Append to `tests/e2e/foundation.spec.ts`:

```ts
test("keeps the capture path usable with keyboard and 200 percent text", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.documentElement.style.fontSize = "200%");
  await expect(page.getByRole("button", { name: "Scan with camera" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("RedTag home")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Scan with camera" })).toBeFocused();
});

test.use({ reducedMotion: "reduce" });
test("preserves meaning with reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Evidence first. Answers you can trace." })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("No source has been queried yet");
});
```

- [ ] **Step 10: Verify installability, cache boundaries, and accessibility**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:unit
pnpm test:e2e:smoke
pnpm test:pwa
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all commands exit zero; the production worker deletes the obsolete cache; Cache Storage contains only the four generated-cache paths; `/`, `/api/`, and the body sentinel are absent; the worker controls a reloaded production Chromium page; deterministic unit cases cover iPhone/iPad guidance while desktop Chromium keeps it hidden; the document CSP nonce matches every nonce-bearing framework script and the scan UI hydrates under that policy; the production gallery remains 404 even with its flag set; keyboard and 200% text checks pass.

- [ ] **Step 11: Commit the installable foundation**

Commit:

```powershell
. ./scripts/invoke-checked.ps1
git add package.json src/proxy.ts playwright.pwa.config.ts tests/unit/pwa/security-headers.test.ts tests/e2e
git commit -m "test(pwa): enforce offline and security boundaries"
git push
```

Update the existing draft PR titled `feat(pwa): add the accessible installable foundation`. Include the Cache Storage assertion result, confirm that image/API/provider data is outside the service-worker allowlist, complete the template, and self-review. Then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: required checks are green, the PWA PR is merged with a merge commit, the branch is deleted, and local `main` contains the production-tested cache and accessibility boundary.

### Task 7: Release-quality and security gates

**Branch:** `ci/release-quality-gates`

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/dependency-review.yml`
- Create: `.github/workflows/codeql.yml`
- Modify: `vitest.config.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/contracts/foundation/app-contract.test.ts`
- Create: `tests/security/foundation-boundaries.test.ts`

**Interfaces:**
- Consumes: every verification command established by Tasks 2-6.
- Produces: globally unique check names `ci-quality`, `ci-tests`, `ci-build`, `ci-e2e-smoke`, and `security-dependency-review` for the `main` ruleset.

- [ ] **Step 0: Create the branch from the latest protected base**

Run:

```powershell
. ./scripts/invoke-checked.ps1
if (git status --porcelain) { throw "Current branch must be clean before switching" }
git switch main
git pull --ff-only origin main
if (git status --porcelain) { throw "main must be clean before branching" }
git switch -c ci/release-quality-gates
git status -sb
```

Expected: `git status -sb` begins with `## ci/release-quality-gates` and reports no changes.

- [ ] **Step 1: Add focused coverage for pure safety behavior**

Install the Vitest V8 coverage provider:

```powershell
. ./scripts/invoke-checked.ps1
pnpm add -D --save-exact @vitest/coverage-v8@latest
```

Replace `vitest.config.ts` with:

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts", "src/features/scan/model/**/*.ts"],
      exclude: ["src/domain/evidence.ts", "src/domain/providers.ts", "src/domain/results.ts", "src/features/scan/model/types.ts"],
      reporter: ["text", "json-summary"],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
```

Add this script to `package.json`:

```json
"test:coverage": "vitest run tests/unit --coverage.enabled"
```

Run: `pnpm test:coverage`

Expected: all unit tests pass and every configured threshold is met by the concrete summary, reducer, and copy-policy cases in this plan; presentation policy remains covered by its focused unit and contract suites.

- [ ] **Step 2: Replace empty gates with real contract and security suites**

Create `tests/contracts/foundation/app-contract.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { PROVIDER_IDS } from "@/domain/providers";
import { PRESENTATION_FIXTURES } from "@/features/results/presentation-fixture";

describe("foundation application contract", () => {
  it("publishes the approved provider registry and PWA identity", () => {
    expect(PROVIDER_IDS).toEqual(["cpsc", "fda_food", "nhtsa"]);
    expect(manifest()).toMatchObject({
      name: "RedTag — Universal Scan",
      display: "standalone",
      start_url: "/",
    });
  });

  it("requires a reason for every possible-match presentation", () => {
    const possible = PRESENTATION_FIXTURES.filter((fixture) => fixture.state === "possible_match");
    expect(possible.length).toBeGreaterThan(0);
    expect(possible.every((fixture) => Boolean(fixture.possibleMatchReason))).toBe(true);
  });
});
```

Create `tests/security/foundation-boundaries.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}

describe("foundation security boundaries", () => {
  it("keeps navigation and APIs out of the service-worker static allowlist", () => {
    const worker = source("../../public/sw.template.js");
    const allowlist = worker.match(/const STATIC_PATHS = new Set\(\[([\s\S]*?)\]\);/)?.[1];
    expect(allowlist?.match(/"\/[^\"]+"/g)).toEqual([
      '"/offline.html"',
      '"/manifest.webmanifest"',
      '"/icons/icon-192.png"',
      '"/icons/icon-512.png"',
    ]);
    expect(worker).toContain('url.pathname.startsWith("/api/")');
    expect(worker).toContain('request.mode === "navigate"');
    expect(worker.indexOf('url.pathname.startsWith("/api/")')).toBeLessThan(worker.indexOf('request.mode === "navigate"'));
  });

  it("creates object URLs only after client sanitization and declares no browser persistence", () => {
    const hook = source("../../src/features/scan/use-evidence-images.ts");
    expect(hook.indexOf("await sanitizeClientImage")).toBeLessThan(hook.indexOf("URL.createObjectURL(sanitized)"));
    expect(hook).not.toMatch(/localStorage|sessionStorage|indexedDB|caches\.open/);
  });

  it("ships the required document security directives", () => {
    const proxy = source("../../src/proxy.ts");
    const page = source("../../src/app/page.tsx");
    for (const directive of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) {
      expect(proxy).toContain(directive);
    }
    expect(page).toContain('import { connection } from "next/server"');
    expect(page).toContain("await connection()");
  });
});
```

Replace the temporary package scripts with real gates:

```json
"test:contracts": "vitest run tests/contracts",
"test:security": "vitest run tests/security"
```

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm format
pnpm format:check
pnpm test:contracts
pnpm test:security
```

Expected: both contract cases and all three security-boundary cases pass; neither command permits an empty suite.

Commit and publish the local quality gates before changing hosted workflows:

```powershell
. ./scripts/invoke-checked.ps1
git add package.json pnpm-lock.yaml vitest.config.ts tests/contracts tests/security
git commit -m "test: add foundation quality gates"
git push -u origin ci/release-quality-gates
gh pr create --draft --fill --base main --head ci/release-quality-gates --title "ci: add RedTag pull-request gates"
```

Expected: the draft PR is open with real coverage, contract, and security suites passing locally.

- [ ] **Step 3: Upgrade the fixture-only CI workflow**

Replace `.github/workflows/ci.yml`:

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true
  NEXT_TELEMETRY_DISABLED: 1

jobs:
  quality:
    name: ci-quality
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck

  tests:
    name: ci-tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - run: pnpm test:contracts
      - run: pnpm test:security

  build:
    name: ci-build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  e2e-smoke:
    name: ci-e2e-smoke
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
        with:
          version: 11.9.0
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e:smoke
      - run: pnpm test:pwa
      - name: Upload browser diagnostics
        if: failure()
        uses: actions/upload-artifact@v6
        with:
          name: playwright-diagnostics-${{ github.run_id }}
          path: test-results
          if-no-files-found: warn
          retention-days: 7
```

The workflow contains no OpenAI key, provider key, live model call, mutable government API call, or recorded-response fallback.

- [ ] **Step 4: Retain dependency-diff review**

Replace `.github/workflows/dependency-review.yml`:

```yaml
name: security

on:
  pull_request:

permissions:
  contents: read

jobs:
  dependency-review:
    name: security-dependency-review
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: actions/dependency-review-action@v5
        with:
          fail-on-severity: high
```

- [ ] **Step 5: Add non-blocking CodeQL analysis on trusted refs**

Create `.github/workflows/codeql.yml`:

```yaml
name: codeql

on:
  push:
    branches: [main]
  schedule:
    - cron: "23 8 * * 1"
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

jobs:
  analyze:
    name: analyze-javascript-typescript
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: github/codeql-action/init@v4
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v4
```

CodeQL is deliberately absent from `pull_request` until its runtime and signal are stable. Dependency review remains the blocking security diff check.

- [ ] **Step 6: Resolve every action tag to an immutable commit SHA**

Use the reviewed `pin-github-action@3.5.1` already locked in Task 2, run it against the three workflows, then review every replacement:

```powershell
. ./scripts/invoke-checked.ps1
pnpm exec pin-github-action .github/workflows/ci.yml
pnpm exec pin-github-action .github/workflows/dependency-review.yml
pnpm exec pin-github-action .github/workflows/codeql.yml
Assert-NoRgMatches -Arguments @("-n", '^\s*-\s+uses:\s+[^#\s]+@v[0-9]', ".github/workflows") -FailureMessage "Mutable action tags remain"
```

Expected: the pinning command replaces every `@vN` with a 40-character commit SHA and retains a version comment; the no-match assertion passes. Compare the resolved repository and major version with each original action before committing.

- [ ] **Step 7: Run the exact local equivalents**

Run:

```powershell
. ./scripts/invoke-checked.ps1
pnpm install --frozen-lockfile
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:contracts
pnpm test:security
pnpm build
pnpm test:e2e:smoke
pnpm test:pwa
```

Expected: every command exits zero. No test requires an external secret or live third-party response.

- [ ] **Step 8: Commit and prove the workflows on GitHub**

Commit the hosted workflow upgrade as the second coherent checkpoint:

```powershell
. ./scripts/invoke-checked.ps1
git add .github/workflows
git commit -m "ci: add pull-request quality and security gates"
git push
```

Update the existing draft PR titled `ci: add RedTag pull-request gates`. Wait for all five stable checks to complete on GitHub, record their links in the PR description, and correct any workflow-only failure in a new focused commit. Complete the template and self-review, then run:

```powershell
. ./scripts/invoke-checked.ps1
gh pr ready
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only origin main
```

Expected: all five required checks are green, the quality-gates PR is merged with a merge commit, its branch is deleted, and local `main` is ready for the foundation completion gate.

- [ ] **Step 9: Confirm the protected `main` rules and repository settings**

Confirm the `main` branch ruleset exactly as follows:

- target branch: `main`;
- require a pull request before merging;
- required approvals: `0` while GreatlyDev is the only human maintainer;
- require conversation resolution;
- require branches to be current before merging;
- block force pushes and deletion;
- require `ci-quality`, `ci-tests`, `ci-build`, `ci-e2e-smoke`, and `security-dependency-review`.

Confirm these separate repository-wide pull-request settings:

- allow merge commits;
- disable rebase merges;
- retain squash only for automated dependency or deliberately collapsed housekeeping PRs;
- enable automatic deletion of merged branches; and
- leave auto-merge off.

Verify the rules on the next planned pull request by confirming GitHub blocks merge while one required check is pending. Record that observation in the real PR rather than creating a throwaway change.

## Foundation completion gate

After Tasks 1-7 are merged, start from a fresh checkout of `main` and run:

```powershell
. ./scripts/invoke-checked.ps1
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:contracts
pnpm test:security
pnpm build
pnpm test:e2e:smoke
pnpm test:pwa
pnpm test:visual
```

Expected:

- clean installation under Node 24;
- every command exits zero;
- the primary scan action is above the fold at 390x844;
- camera, photo-picker, desktop-drop, and quiet manual inputs preserve a one-item/two-image ephemeral session;
- the default build returns 404 for `/dev/state-gallery`;
- the explicit visual runner shows all nine fixture frames, keeps `vehicle_campaigns_found` neutral, and applies recall emphasis only to `confirmed_match`;
- no API or sensitive sentinel appears in Cache Storage;
- iPhone/iPad install guidance is deterministic and remains in document flow, while desktop Chromium keeps it hidden;
- all required GitHub checks are green; and
- `git status --short` is empty after verification.

## Spec coverage and deferred boundaries

This plan fully covers repository workflow, framework/tooling, pure operational/result axes, no-match precedence, prohibited app copy, mobile capture/photo/manual intake, two-image ephemeral state, Calm Guardian foundation, server-gated visual review, PWA installability, shell-only caching, keyboard/accessibility smoke, reduced motion, and CI.

The following approved requirements are intentionally assigned to later executable plans because they need stable foundation interfaces:

- GPT-5.6 vision Structured Outputs, bounded missing-evidence guidance, prompt-injection resistance, `store: false`, and manual fallback;
- server-side image re-encoding, EXIF proof, request limits, rate limits, telemetry redaction, and temporary-reference expiry;
- CPSC, FDA, vPIC, and NHTSA adapters, provenance, completeness, matching rules, and official links;
- recorded raw provider snapshots and explicit user-selected Recorded Provider Response mode;
- NHTSA-only five-minute vehicle-type campaign caching;
- the fifteen-path release matrix; physical-phone HTTPS attestation; live-source release checks; rendered phone/tablet/laptop/additional-desktop smoke; functional `insufficient_identifier`, `unsupported`, and partial-provider/outage smoke; post-P0 targeted property suites; public deployment; README; demo assets; and submission video.

No deferred boundary is simulated or claimed complete by this foundation.
