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

<!-- Record provider, a sanitized canonical official-source URL with no identifiers, sensitive query parameters, or temporary tokens, captured-at metadata, and hash when applicable. -->

## Deployment and rollback

- Environment or migration impact:
- Rollback procedure:

## Self-review

- [ ] I reviewed the full diff, including generated and configuration files.
- [ ] I added tests before behavioral implementation, or this PR contains no behavioral change.
- [ ] Failures and incomplete retrieval cannot become `no_match_found`.
- [ ] Logs, traces, cache keys, and cache values contain no sensitive identifiers.
- [ ] User-facing copy preserves provider limitations and avoids safety clearance.
