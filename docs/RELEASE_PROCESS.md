# Release Process

## Purpose

Releases are public checkpoints of the web application. They are not npm
publishing events.

## Release Types

- Routine maintenance.
- Product feature.
- Tax-year or tax-rule update.
- Security fix.

## Pre-Release Checklist

- Working tree is clean.
- Local `main` is up to date with `origin/main`.
- `package.json` version is reviewed.
- `CHANGELOG.md` is updated.
- Release notes are drafted from the changelog.
- All quality gates pass locally.
- GitHub Actions are green.
- Production smoke checks pass after deployment.
- Dependency audits have no unexpected regressions.
- No unsupported tax-rule change is included.

## Required Local Commands

Run:

```bash
npm ci
npm run check:release
npm audit --json
npx tsc --noEmit
```

`npm run typecheck` is the authoritative Vue-aware TypeScript gate. Plain
`npx tsc --noEmit` is diagnostic-only in this repository because Vue single-file
components require Vue-aware type checking.

## GitHub Actions

The normal deployment workflow must complete these jobs:

- `quality`
- `vitest`
- `cypress-run`
- `production-audit`
- `accessibility-performance`
- `deploy`

The release validation workflow can also be run manually before tagging.

## Tagging

The intended tag commands are:

```bash
git tag -a v0.5.0 -m "v0.5.0"
git push origin v0.5.0
```

Create a tag only after `main` is green and production is verified. Do not tag
unvalidated commits.

## GitHub Release

Use the title format `vMAJOR.MINOR.PATCH`.

Release notes should come from `CHANGELOG.md` and include:

- deployment URL;
- release type;
- known limitations;
- tax disclaimer;
- affected tax years when fiscal rules change.

## Post-Release Checks

- Production URL loads successfully.
- Canonical URL is correct.
- Language switching works.
- Theme switching works.
- One representative calculation works.
- Saved simulations still open.
- GitHub Release links to `CHANGELOG.md`.

## Rollback

Rollback for GitHub Pages is a normal revert on `main` followed by deployment.
Revert the release commit when appropriate.

Do not rewrite public tags unless absolutely necessary. If a tag points to a bad
release, prefer creating a patch release that corrects the issue.
