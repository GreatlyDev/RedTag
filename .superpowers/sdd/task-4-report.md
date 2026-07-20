# Task 4 implementation report

## Scope and files changed

Implemented the client-only Universal Scan foundation with no model call and no government-provider call.

- `src/features/scan/model/types.ts`: typed scan stages, input modes, `ProductCategory`, ephemeral `EvidenceImage`, session state, and actions.
- `src/features/scan/model/scan-reducer.ts`: pure two-image-bounded reducer with coherent mixed manual/image transitions and category confirmation.
- `src/features/scan/sanitize-client-image.ts`: client source/output byte limits, decoded-dimension guard, resize, JPEG re-encode, generic filenames, and guaranteed bitmap closure.
- `src/features/scan/use-evidence-images.ts`: sanitized-file retention, generic monotonic labels, object-URL lifecycle, overlap/cancellation handling, and 15-minute expiry.
- `src/features/scan/components/category-selector.tsx`: category confirmation UI and deterministic-routing boundary copy.
- `src/features/scan/universal-scan.tsx` and `.module.css`: mobile-first camera/photo/drop/manual shell, evidence previews, status announcements, and neutral Calm Guardian presentation.
- `src/app/page.tsx` and `page.module.css`: dynamic `connection()` boundary while retaining the external banner, Next `Link` home route, and application promise.
- `scripts/generate-privacy-fixture.mjs` and `tests/fixtures/images/exif-location.jpg`: self-created fixture with unique EXIF sentinel and actual IFD3 GPS latitude/longitude fields.
- `tests/unit/scan/*.test.ts(x)`: reducer, sanitizer, URL lifecycle, TTL, overlap, Strict Mode, mixed-file, category, and interaction coverage.
- `tests/e2e/foundation.spec.ts` and `tests/e2e/image-privacy.spec.ts`: preserved foundation assertions plus intake, generic-label, EXIF/GPS removal, and revocation coverage.
- `package.json`: smoke command includes the privacy spec.

## RED/GREEN evidence

### Reducer and session model

- RED: `pnpm test:unit tests/unit/scan/scan-reducer.test.ts` failed with an unresolved `@/features/scan/model/scan-reducer` import.
- GREEN: 1 file, 10/10 tests passed.
- Covers two-image cap, explicit overflow, manual trim/submit, empty input, mixed manual+image clearing, removal transitions, reset, notices, and typed category confirmation without provider selection.

### Image sanitizer and evidence lifecycle

- RED: focused sanitizer/hook command failed both suites because `sanitize-client-image` and `use-evidence-images` did not exist.
- First GREEN iteration exposed two test-isolation failures because this repository does not globally install Testing Library cleanup; explicit cleanup was added.
- Additional RED: controller-requested accumulated-overlap revocation and React Strict Mode replay tests failed 2/8 for the expected missing behaviors.
- GREEN: 2 files, 15/15 tests passed (7 sanitizer, 8 lifecycle).
- Covers source/output caps, resize/JPEG/generic name, HEIC/HEIF fallback copy, decoded-dimension rejection, bitmap closure, monotonic labels, mixed valid+unsupported input, 15-minute fake-timer expiry, neutral recovery, cancellation, overlap, reset, unmount, and exactly-once revocation.

### Universal Scan UI

- RED: `pnpm test:unit tests/unit/scan/universal-scan.test.tsx` failed on the missing scan surface.
- GREEN: 1 file, 3/3 tests passed; focused typecheck also passed.
- Covers exact visible `APP_PROMISE`, quiet manual reveal, no-query status, typed category confirmation/deterministic routing copy, shared drop intake, and hidden source filenames.
- Review follow-up: replaced a text separator with a CSS-drawn `aria-hidden` arrow and clarified that sanitized previews exist in memory but are not written to browser storage; the UI suite remained 3/3.

### Browser privacy fixture

- RED: the new fixture-dependent browser paths failed with `ENOENT` before the fixture existed.
- Fixture generation: Sharp produced a self-created JPEG containing `SENSITIVE-EXIF-SENTINEL` plus `GPSLatitude`, `GPSLatitudeRef`, `GPSLongitude`, and `GPSLongitudeRef` in IFD3.
- Browser run after generation emitted ten completion dots for all mobile/desktop cases but the checked shell timed out during Playwright-managed Next dev-server teardown before a final summary or exit code. This is **not recorded as a passing gate**. The controller owns the clean manually managed server rerun.

## Verification results

Commands were run after `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force`, `$env:CI = '1'`, and dot-sourcing `scripts/invoke-checked.ps1`.

- `pnpm format`: PASS.
- `pnpm format:check`: PASS.
- `pnpm lint`: PASS, zero warnings after moving test-harness exposure into an effect and capturing the URL set for cleanup.
- `pnpm typecheck`: PASS (`next typegen` and `tsc --noEmit`).
- `pnpm test:unit`: PASS, 7 files and 160/160 tests.
- `pnpm test:contracts`: PASS, no current contract test files (`--passWithNoTests`).
- `pnpm test:security`: PASS, no current security test files (`--passWithNoTests`).
- `pnpm build`: initial sandboxed attempt failed only because existing `next/font` configuration could not reach Google Fonts; approved network retry PASS, production compilation and TypeScript complete.
- `pnpm test:e2e:smoke`: INCONCLUSIVE in this worker. Ten dots were emitted, but no final Playwright summary/clean exit preceded the 318.8-second shell timeout during web-server teardown. A prior RED run correctly failed on the absent fixture.

## Commits

- `3207e6dfff7575482384e20dfc9a46dfa32842c5` ? `feat(scan): add the ephemeral scan session`
- Final scan-shell commit: recorded after this report is committed.

## Deviations and risks

- The Task 4 amendment superseded generated brief provider-selection names with user-confirmed product categories. No `selectedProvider`, `provider_selected`, `ProviderRail`, or provider call exists in feature code.
- The dedicated patch editor repeatedly hung on a small new file. The controller authorized validated in-memory unified diffs using `git apply --check` before `git apply` for remaining edits.
- The first fixture generation printed non-fatal fontconfig cache warnings; the JPEG was generated successfully.
- Playwright-managed server teardown did not provide a clean exit in this worker. Do not treat the emitted completion dots as the required E2E pass; obtain a bounded clean run with a manually managed hidden server and `PLAYWRIGHT_BASE_URL`.
- Live OpenAI and government-provider calls were not made, as required.
- Temporary `debug.log` and `test-results` artifacts from timed-out browser runs were inspected/removed and are not staged.

## Visual and accessibility notes

- Header remains outside `main` as the banner landmark; `RedTag home` remains a Next `Link` to `/`.
- The exact approved application promise is visible.
- Primary, manual, reset, radio-row, and evidence-removal controls meet or exceed 44 CSS pixels (48 pixels for primary form controls).
- Global visible focus treatment and reduced-motion handling remain active.
- Async state uses a polite live status region; category radios use a fieldset/legend and explanatory description.
- Pre-query UI uses paper, ink, sage, and neutral-information tokens only. Recall-red and safety-green signals are absent.
- Original source filenames never render; evidence labels are generic and monotonic.
- Browser rendering was functionally exercised at 390x844 and 1440x900. Final screenshot/visual sign-off remains with the controller.
