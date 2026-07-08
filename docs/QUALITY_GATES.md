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
- `npm run verify:bundle-budget` checks production asset sizes, hashes,
  initial-versus-lazy JavaScript chunks, chunk count and absence of
  test/runtime leakage.
- `npm run lighthouse:ci` runs desktop Lighthouse smoke checks against local
  production preview URLs.
- `npm run verify:release-readiness` verifies release governance files,
  versioned release notes, changelog structure, CODEOWNERS, issue templates,
  workflow jobs and required package scripts.
- `npm run check` runs production audit, critical audit, formatting, lint,
  typecheck, Vitest, build and production verification through the Node-based
  gate runner.
- `npm run check:e2e` runs `check` plus Cypress.
- `npm run check:release` runs `check`, bundle budget verification,
  Lighthouse, Cypress E2E, Cypress axe accessibility checks and
  release-readiness verification through the Node-based gate runner.

## Gate Runner

`npm run check` and `npm run check:release` are orchestrated by
`scripts/run-gates.mjs`. The runner avoids fragile shell chains and nested npm
processes so local Windows release checks behave the same way as Linux CI.

The runner enforces Node 24 at startup and prints the active Node executable,
Node version, V8 version, platform, npm CLI path and the first PATH entries.
Child steps are launched through the current Node executable and npm CLI
(`process.execPath` plus `npm_execpath`, or the npm CLI bundled beside the
current Node runtime). Audit gates call `npm audit` directly through that resolved
npm CLI instead of re-entering `npm run audit:*`, so nested audit commands cannot
fall back to another npm installation from PATH. This prevents a Windows shell from
accidentally using a global Node 26 installation while the parent gate is running
under Node 24.

Each step prints a numbered boundary such as `=== [3/13] format:check ===`,
the exact command, duration, exit code and signal. On failure the runner stops
immediately and reports the failing step and command. Component commands remain
available and can still be run individually when investigating a specific gate.

On Windows, a child process that exits with the native access-violation code
`3221225477` / `-1073741819` is retried once, because these crashes have been
observed intermittently while the same component gate passes in isolation.
Lighthouse is retried once on Windows because local browser performance scores
can fluctuate by a point at the threshold. Cypress gates are also retried once on
Windows after a non-zero exit because the local Electron browser runner can fail
intermittently even when the same specs pass on rerun. Cypress E2E has a ten-minute per-attempt timeout because Windows runs it
as separate spec runs; Cypress axe keeps a four-minute timeout. When either timeout
is hit, the runner terminates the child process tree before retrying or failing. The Cypress wrapper runs headless checks
with `numTestsKeptInMemory=0` and `experimentalMemoryManagement=true` to reduce
Electron renderer memory pressure during long local suites. On Windows, E2E specs
are also run as separate Cypress spec runs so one long Electron session does not
carry renderer state across the full suite. A failed Windows spec run is retried
once before the E2E command fails. Persistent command failures, assertion
failures and lint/type/test failures still stop the gate.

For targeted debugging, a single component can be run through the same
orchestrator:

```bash
node scripts/run-gates.mjs component lint
```

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

The bundle budget gate reads `dist/index.html` to classify module scripts and
`modulepreload` JavaScript links as initial assets. Other JavaScript files are
reported as lazy chunks, so intentional route/chart splitting is allowed while
accidental growth of the first simulator path still fails the gate.

## Handling Failures

Format failures should be fixed with `npm run format` and a careful diff
review. Lint failures should be fixed with small source changes or by adjusting
rules when a rule creates noise without protecting behavior. Typecheck failures
should be handled with precise types and without changing fiscal formulas.

## Cross-Platform Formatting

The repository stores text files with LF line endings. `.gitattributes`
enforces this policy across operating systems, including Windows checkouts that
use Git's global `core.autocrlf=true` setting. `.editorconfig` and Prettier use
the same LF policy.

Run `npm run format:check` before opening a pull request. If formatting drift
is reported, run `npm run format`, inspect the diff and commit only formatting
changes that belong to the current task.

After pulling the `.gitattributes` policy into an existing Windows working
tree, local files may still be stale. Run `git add --renormalize .` to refresh
the index, then run `npm run format` if the working tree still contains CRLF
files. A clean checkout also applies the policy from the start.

## Future Gates

Good future additions include mobile Lighthouse once it is stable in CI, deeper
manual accessibility checklists and a stricter warning policy once the codebase
is ready for it.
