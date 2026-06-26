# Quality Gates

This project uses local and CI gates to keep releases reproducible.

## Local Commands

- `npm run format:check` checks Prettier formatting without writing files.
- `npm run format` applies Prettier formatting.
- `npm run lint` runs the non-destructive ESLint gate.
- `npm run lint:fix` applies safe ESLint fixes.
- `npm run typecheck` runs the supported Vue-aware TypeScript gate through
  `vue-tsc --noEmit`.
- `npm run vitest -- --run` runs unit tests.
- `npm run cy:e2e:run` runs Cypress end-to-end tests.
- `npm run cy:a11y` runs the dedicated Cypress axe accessibility suite.
- `npm run build` builds production assets.
- `npm run verify:production-build` checks the production artifact.
- `npm run verify:bundle-budget` checks production asset sizes, hashes, chunk
  count and absence of test/runtime leakage.
- `npm run lighthouse:ci` runs desktop Lighthouse smoke checks against local
  production preview URLs.
- `npm run verify:release-readiness` verifies release governance files,
  changelog structure, CODEOWNERS, issue templates, workflow jobs and required
  package scripts.
- `npm run check` runs production audit, critical audit, formatting, lint,
  typecheck, Vitest, build and production verification.
- `npm run check:e2e` runs `check` plus Cypress.
- `npm run check:release` runs `check`, bundle budget verification, Lighthouse,
  Cypress E2E, Cypress axe accessibility checks and release-readiness
  verification.

## Vue Type Checking

`npm run typecheck` is authoritative. It understands Vue single-file
components, templates and component props.

Plain `npx tsc --noEmit` is diagnostic-only in this repository. It is useful
for spotting TypeScript ecosystem issues, but it is not the release gate
because Vue SFCs require Vue-aware type checking.

`skipLibCheck` is enabled so dependency declaration files do not block the
application type gate. Application code is still checked by `vue-tsc`.

## CI Structure

The GitHub Actions workflow runs on Node 24. The deploy dependency chain is:

```text
quality + vitest + cypress-run + production-audit + accessibility-performance -> deploy
```

The `quality` job runs:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
```

The deploy job still builds, verifies and uploads `dist` to GitHub Pages.

The release validation workflow in `.github/workflows/release.yml` runs on
manual dispatch and `v*.*.*` tags. It runs `npm run check:release`, prints
release metadata and runs the complete npm audit as non-blocking context for
known development-only findings. It does not deploy. GitHub Pages deployment
remains in `.github/workflows/workflow.yml`.

The `accessibility-performance` job runs:

```bash
npm ci
npm run build
npm run verify:production-build
npm run verify:bundle-budget
npm run lighthouse:ci
npm run cy:a11y
```

This keeps bundle budgets, Lighthouse smoke checks and axe accessibility
coverage visible as a dedicated CI gate.

## Handling Failures

Format failures should be fixed with `npm run format` and a careful diff
review. Lint failures should be fixed with small source changes or by adjusting
rules when a rule creates noise without protecting behavior. Typecheck failures
should be handled with precise types and without changing fiscal formulas.

## Future Gates

Good future additions include mobile Lighthouse once it is stable in CI, deeper
manual accessibility checklists and a stricter warning policy once the codebase
is ready for it.
