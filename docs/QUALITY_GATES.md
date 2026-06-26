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
- `npm run build` builds production assets.
- `npm run verify:production-build` checks the production artifact.
- `npm run check` runs production audit, critical audit, formatting, lint,
  typecheck, Vitest, build and production verification.
- `npm run check:e2e` runs `check` plus Cypress.

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
quality + vitest + cypress-run + production-audit -> deploy
```

The `quality` job runs:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
```

The deploy job still builds, verifies and uploads `dist` to GitHub Pages.

## Handling Failures

Format failures should be fixed with `npm run format` and a careful diff
review. Lint failures should be fixed with small source changes or by adjusting
rules when a rule creates noise without protecting behavior. Typecheck failures
should be handled with precise types and without changing fiscal formulas.

## Future Gates

Good future additions include accessibility regression checks, bundle budgets,
Lighthouse smoke checks and a stricter warning policy once the codebase is
ready for it.
