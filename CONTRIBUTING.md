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
