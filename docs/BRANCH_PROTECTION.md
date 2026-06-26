# Branch Protection

## Purpose

Branch protection should preserve a trustworthy `main` branch without weakening
release velocity through ad hoc bypasses. These settings are manual maintainer
steps and are not changed by automation in this repository.

## Recommended Settings For `main`

- Require a pull request before merging.
- Require approvals, at least one approval when collaborators exist.
- Require conversation resolution.
- Require status checks to pass.
- Require branches to be up to date before merge when practical.
- Disallow force pushes.
- Disallow deletions.
- Consider requiring signed commits later.
- Consider requiring linear history later.

## Required Status Checks

Require these pre-deploy checks:

- `quality`
- `vitest`
- `cypress-run`
- `production-audit`
- `accessibility-performance`

The `deploy` job normally runs only on `main`, so it is not usually required for
pull requests. All pre-deploy gates should be required.

## GitHub UI Steps

1. Open repository settings.
2. Go to Branches.
3. Add or edit a branch protection rule for `main`.
4. Enable pull request, conversation resolution and status-check requirements.
5. Select the required status checks listed above.
6. Disable force pushes and deletions.
7. Save the rule.

## Renamed Checks

When a required check is renamed, update the branch protection rule in the
GitHub UI immediately after the workflow change lands. Keep old and new names
temporarily only when GitHub requires it during transition.

## Emergency Security Fixes

For emergency fixes, keep the same gates in place. Use a small pull request,
prioritize review, and avoid broad refactors. If a gate fails, fix the cause or
document an explicit maintainer decision in the pull request.

Do not weaken gates just to merge faster.
