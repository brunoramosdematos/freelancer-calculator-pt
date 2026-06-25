# Vite and Vitest Toolchain Remediation — 2026-06-25

## Scope

- Repository: `brunoramosdematos/freelancer-calculator-pt`.
- Starting SHA: `e7ece9214c5be9e39106b94df2dab2e2339bb091`.
- Implementation SHA: `e5e08c62713365070f5443d6d866c776465994fd`.
- Local Node.js: `v24.14.0`.
- Local npm: `11.16.0`.
- Production URL: `https://freelancerpt.brunomatos.dev/`.

Intentionally changed:

| Package | Before | After |
| --- | ---: | ---: |
| `vite` | 5.0.12 | 7.3.6 |
| `vitest` | 1.2.1 | 4.1.9 |
| `@vitejs/plugin-vue` | 5.0.3 | 6.0.7 |
| `typescript` | 4.9.5 | 5.9.3 |
| `@types/node` | 18.11.18 | 24.13.2 |
| `msw` | 2.1.3 | removed |
| `rollup` | 4.9.6 | 4.62.2 |
| `esbuild` | 0.19.11 | 0.28.1 |

Explicitly excluded: Cypress, Tailwind, ESLint, Vue runtime, Pinia, Vue Router,
Chart.js, Sass, package name, package version, fiscal logic, UI behavior, URL
format, saved-simulation format, GitHub Pages architecture and production
domain.

No application runtime file under `src/` changed.

## Before

Installed toolchain:

- `vite@5.0.12`
- `vitest@1.2.1`
- `@vitejs/plugin-vue@5.0.3`
- `rollup@4.9.6`
- `esbuild@0.19.11`
- `typescript@4.9.5`
- `@types/node@18.11.18`
- `msw@2.1.3`

Baseline command results:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | 549 packages installed; 32 vulnerabilities reported in full tree |
| `npm run audit:prod` | 0 | production audit clean |
| `npm audit --omit=dev --json` | 0 | 0 vulnerabilities |
| `npm audit --json` | 1 | 32 total: 4 low, 10 moderate, 15 high, 3 critical |
| `npm audit signatures` | 0 | passed |
| `npm run vitest -- --run` | 0 | 2 files, 92 tests passed |
| `npm run build` | 0 | Vite 5.0.12 build passed |
| `npm run verify:production-build` | 0 | production artifact verified |
| `npm run cy:e2e:run` | 0 | 6 specs, 105 tests passed |
| `npx tsc --noEmit` | 1 | unsupported baseline diagnostic |

Relevant vulnerable paths before:

- Direct `vite` advisories, including paths through Vite's development/build
  server and transitive `esbuild`.
- Direct `vitest` advisories, including critical API/UI-server advisories.
- Transitive `rollup` advisory through Vite.
- MSW development-tooling paths: `msw > @bundled-es-modules/cookie`, `msw >
  chokidar`, `msw > path-to-regexp`, and `msw > inquirer > external-editor >
  tmp`.

Baseline artifact metadata:

| File | Raw bytes | Gzip bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `favicon.svg` | 775 | 458 | `a36b79d4696918776e7dcd201ddb27fd0d3716c31ac70048036f8008293e57e3` |
| `index.html` | 1,992 | 626 | `85be4b534efa184808318a76e853d4da321970f77eb9d7bad3d56d32e30da749` |
| `robots.txt` | 81 | 96 | `58c144de55e1a79c7d482b0780366d4db7b45b318846a958ae4b47d2ff12655b` |
| `sitemap.xml` | 179 | 159 | `beb6963fd8d9d454e2c915b44a2575034d9b5190c2b83c8cc7d003c50c1b9269` |
| `assets/index-Ke9NscWn.css` | 33,598 | 6,441 | `f69af5fe5f94b89316c4741c351a9edf89509ff9c7f659b7396f898b4f8bee73` |
| `assets/index-sLkUeQuZ.js` | 396,058 | 136,906 | `28959ab1d9a69466ccdce50c5a08345d3678222ab5db1a9463957ff172ecda1f` |

Baseline title: `Freelancer Calculator Portugal | IRS & Social Security`.
Baseline canonical: `https://freelancerpt.brunomatos.dev/`.
Baseline assets: `/assets/index-sLkUeQuZ.js`,
`/assets/index-Ke9NscWn.css`.

## MSW usage audit

Tracked repository searches covered `src`, `cypress`, `scripts`, test
configuration, Vite/Vitest configuration, package scripts and repository-wide
`git grep` searches for:

- imports from `msw` or `msw/node`;
- `setupServer`;
- `setupWorker`;
- `http.get` / `http.post`;
- `rest.get` / `rest.post`;
- handlers and mock-server setup;
- package scripts invoking MSW.

No application, unit-test, Cypress, support-file, setup-file or script usage was
found. The only tracked references outside package metadata were historical
security documentation. The direct `msw` dev dependency was removed instead of
being retained or updated solely to satisfy `@vitest/mocker`'s optional peer.

## Version selection

Live npm registry queries selected the newest stable compatible set available
during execution:

- `vite@7.3.6`
- `vitest@4.1.9`
- `@vitejs/plugin-vue@6.0.7`
- `typescript@5.9.3`
- `@types/node@24.13.2`

Compatibility evidence:

- Vite 7.3.6 requires Node `^20.19.0 || >=22.12.0`; Node 24 satisfies this.
- Vitest 4.1.9 requires Node `^20.0.0 || ^22.0.0 || >=24.0.0` and peers on
  `vite ^6 || ^7 || ^8`; Vite 7.3.6 satisfies this.
- `@vitejs/plugin-vue@6.0.7` peers on `vite ^5 || ^6 || ^7 || ^8` and
  `vue ^3.2.25`; the current Vue runtime `3.2.45` satisfies this.
- `@vitest/mocker@4.1.9` has an optional peer on `msw ^2.4.9`; removing unused
  direct MSW avoids an invalid peer while preserving no application behavior.
- TypeScript remained within major 5 and `@types/node` remained within major 24.

Vite 8 was excluded because its Rolldown/Oxc/Lightning CSS migration was
explicitly out of scope.

Official migration references reviewed:

- Vite 5 to 6 migration:
  `https://v6.vite.dev/guide/migration.html`
- Vite 6 to 7 migration:
  `https://v7.vite.dev/guide/migration.html`
- Vitest migration guide:
  `https://vitest.dev/guide/migration.html`
- Vitest 2 and 3 archived migration guides:
  `https://v2.vitest.dev/guide/migration`
  and `https://v3.vitest.dev/guide/migration`

## Migration

Package changes:

- Upgraded Vite, Vitest and `@vitejs/plugin-vue` as a compatible group.
- Upgraded TypeScript and Node typings to satisfy modern Vite/Vitest typing
  expectations under Node 24.
- Removed unused direct `msw`.
- Allowed npm to resolve Vite's newer `rollup` and `esbuild` transitives
  normally.
- No overrides, aliases, `--force` or `--legacy-peer-deps` were used.

Vite configuration:

- Preserved `base: "/"`.
- Replaced `__dirname`/`path.resolve` aliasing with
  `fileURLToPath(new URL("./src", import.meta.url))`.
- Normalized optional `PORT`: valid numeric values become a number; missing or
  invalid values leave Vite's default port behavior.
- Added explicit `build.target`:
  `["es2020", "edge88", "firefox78", "chrome87", "safari14"]`.

Browser-target preservation:

- Vite 7 changed its default from Vite 5's `modules` target to
  `baseline-widely-available`.
- Vite 5 source resolved `modules` to `es2020`, Edge 88, Firefox 78, Chrome 87
  and Safari 14.
- The Vite 7 migration guide documents the default browser raise from Chrome
  87 to 107, Edge 88 to 107, Firefox 78 to 104 and Safari 14 to 16.
- The old target is now explicit so this dependency remediation does not make a
  product decision to raise browser support.

Vitest configuration:

- Switched `defineConfig` import to `vitest/config`.
- Removed obsolete triple-slash Vitest reference.
- Preserved Vue plugin, globals, jsdom and `@` alias.
- Added `include: ["src/**/*.spec.ts"]`.
- Added explicit Cypress exclusion with `cypress/**` and `**/*.cy.ts`.
- No pool, worker, isolation, concurrency or timeout behavior was changed.
- Existing `mockRestore()` spy usage continued to pass under Vitest 4 without
  test-harness changes.

TypeScript:

- `moduleResolution` changed from `node` to `bundler` so TypeScript 5 can
  resolve modern Vite/Vitest package exports.
- No `skipLibCheck`, suppressions, `any` casts, application source changes or
  `vue-tsc` dependency were added.
- `npx tsc --noEmit` remains diagnostic-only. Node disposable-symbol and
  `WeakKey` errors from the TypeScript 4.9 baseline disappeared. Remaining
  failures are dependency declaration issues (`@babel/types`, Pinia d.ts) and
  existing unsupported Vue SFC module declarations.

Custom Cypress runner:

- `scripts/run-cypress-e2e.mjs` continued to use Vite's `createServer`.
- Vite 7 started on port 8261 with `strictPort`.
- Cypress received the configured `baseUrl`.
- The server closed and Cypress exit code was preserved.
- No Cypress version or runner rewrite was required.

## After

Installed versions after fresh `npm ci`:

- `vite@7.3.6`
- `vitest@4.1.9`
- `@vitejs/plugin-vue@6.0.7`
- `rollup@4.62.2`
- `esbuild@0.28.1`
- `typescript@5.9.3`
- `@types/node@24.13.2`
- `msw`: not installed as a direct dependency

Final command results:

| Command | Exit | Result |
| --- | ---: | --- |
| `node --version` / `npm --version` | 0 | `v24.14.0` / `11.16.0` |
| `npm ci` | 0 | 489 packages installed; lockfile reproducible |
| `npx vite --version` | 0 | `vite/7.3.6 win32-x64 node-v24.14.0` |
| `npx vitest --version` | 0 | `vitest/4.1.9 win32-x64 node-v24.14.0` |
| `npx tsc --version` | 0 | `Version 5.9.3` |
| `npm ls vite vitest @vitejs/plugin-vue msw typescript @types/node rollup esbuild` | 0 | no invalid, unmet or extraneous peers |
| `npm run audit:prod` | 0 | production audit clean |
| `npm audit --omit=dev --json` | 0 | 0 vulnerabilities |
| `npm audit --json` | 1 | 22 total: 0 low, 8 moderate, 12 high, 2 critical |
| `npm audit signatures` | 0 | passed |
| `npm outdated --json` | 1 | outdated packages remain outside scope |
| `npm run vitest -- --run` | 0 | 2 files, 92 tests passed |
| `npm run build` | 0 | Vite 7.3.6 build passed |
| `npm run verify:production-build` | 0 | production artifact verified |
| `npm run cy:e2e:run` | 0 | 6 specs, 105 tests passed |
| `npx tsc --noEmit` | 1 | diagnostic-only, still not a clean project typecheck |

Final complete-tree audit totals:

- info: 0
- low: 0
- moderate: 8
- high: 12
- critical: 2
- total: 22

Final production-only audit totals:

- total: 0

Removed advisory paths:

- Direct `vite`.
- Direct `vitest`.
- Vite's vulnerable `rollup` path.
- Vite's vulnerable `esbuild` path.
- Direct `msw` and its transitive cookie, watcher, route-pattern and temp-file
  paths.

Remaining high/critical development findings:

- `@cypress/request` - critical
- `form-data` - critical
- `axios` - high
- `braces` - high
- `cross-spawn` - high
- `editorconfig` - high
- `flatted` - high
- `glob` - high
- `immutable` - high
- `lodash` - high
- `minimatch` - high
- `picomatch` - high
- `tmp` - high
- `ws` - high

Functional fiscal checks:

| Scenario | Result |
| --- | ---: |
| 2024, EUR 60,000 annual gross, individual | IRS EUR 12,576.22 |
| 2024, EUR 60,000 annual gross, joint single-income | IRS EUR 8,608.78998 |
| 2024, EUR 60,000 annual gross, joint single-income with dependents aged 2 and 5 | IRS EUR 7,108.78998 |
| 2026, EUR 11,000 monthly, SS 0% | EUR 1,379.34984/month |
| 2026, EUR 11,000 monthly, SS -20% | EUR 1,318.24/month |
| 2026, EUR 11,000 monthly, SS -25% | EUR 1,235.85/month |

## Artifact comparison

Final title: `Freelancer Calculator Portugal | IRS & Social Security`.
Final canonical: `https://freelancerpt.brunomatos.dev/`.
Final assets: `/assets/index-CShlC_Aq.js`, `/assets/index-CCTCWyl7.css`.

| File | Raw bytes | Gzip bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `favicon.svg` | 775 | 458 | `a36b79d4696918776e7dcd201ddb27fd0d3716c31ac70048036f8008293e57e3` |
| `index.html` | 1,992 | 625 | `d6a7424309d9a8fa396f014dd0810578a01c6d3465a063da6605c2d18a5160f7` |
| `robots.txt` | 81 | 96 | `58c144de55e1a79c7d482b0780366d4db7b45b318846a958ae4b47d2ff12655b` |
| `sitemap.xml` | 179 | 159 | `beb6963fd8d9d454e2c915b44a2575034d9b5190c2b83c8cc7d003c50c1b9269` |
| `assets/index-CCTCWyl7.css` | 33,574 | 6,441 | `7be4e91463d565c67fe64ac38663e1199bae8ce8e1ada53045c6c7ceb0e75da8` |
| `assets/index-CShlC_Aq.js` | 394,422 | 136,205 | `9b723c6bb730d35846b5a43ed8a94a7c5b3a2a86fe54f6d2326706ee3ab80067` |

Size deltas:

- Total JavaScript: 396,058 -> 394,422 bytes, delta -1,636 raw and -701 gzip.
- Total CSS: 33,598 -> 33,574 bytes, delta -24 raw and 0 gzip.
- `index.html`, `robots.txt`, `sitemap.xml`, and `favicon.svg` path set remain
  unchanged except `index.html` references the new hashed asset names.
- No source maps were published.
- No unexpected chunk was introduced.
- No Cypress/Vitest/createServer strings were found in the final JS bundle.
  A `node:` substring match was inspected and came from minified application
  text, not Node runtime code.

CSS structural comparison:

- Selector count: 452 before, 452 after.
- Unique selectors: 444 before, 444 after.
- Declarations: 838 before, 838 after.
- Media-rule count: 12 before, 12 after.
- No selectors were lost.
- Media-rule differences were whitespace-only minification changes such as
  `(min-width: 640px)` -> `(min-width:640px)`.

## CI status

The known starting workflow `28138339233` for
`e7ece9214c5be9e39106b94df2dab2e2339bb091` remains successful:

- `production-audit`: success
- `vitest`: success
- `cypress-run`: success
- `deploy`: success

The final pushed workflow must run after this documentation commit exists. Its
job statuses, Pages artifact ID/digest and production smoke check are recorded
in the final execution report for this remediation.

## Residual risks

- Cypress/request stack remains the main critical development-tooling cluster.
- Tailwind/lint/glob tooling remains outside this execution.
- ESLint ecosystem remains outside this execution.
- Plain `npx tsc --noEmit` is still not a supported clean typecheck path; a
  future typecheck execution should add Vue SFC declarations and resolve
  dependency declaration gaps deliberately.
- Vite 8 remains a separate future migration involving Rolldown/Oxc/Lightning
  CSS decisions.

## Rollback

Rollback target:

- Revert implementation commit
  `e5e08c62713365070f5443d6d866c776465994fd`.

Expected direct package versions after rollback:

| Package | Version after rollback |
| --- | ---: |
| `vite` | 5.0.12 |
| `vitest` | 1.2.1 |
| `@vitejs/plugin-vue` | 5.0.3 |
| `typescript` | 4.9.5 |
| `@types/node` | 18.11.18 |
| `msw` | 2.1.3 |

Verification commands after rollback:

```bash
npm ci
npm run audit:prod
npm run vitest -- --run
npm run build
npm run verify:production-build
npm run cy:e2e:run
npm audit --omit=dev --json
npm audit --json
```

Rollback would reintroduce the direct Vite/Vitest findings and the unused
direct MSW dependency.

## Conclusion

The direct Vite and Vitest security findings are remediated on a Vite 7 /
Vitest 4 toolchain. The production dependency audit remains clean. MSW was
removed after confirming it was unused in tracked source, tests, Cypress support
and scripts.

The complete npm dependency tree is not clean. Remaining high and critical
findings are development/test/tooling risks and should be addressed next in a
focused Cypress/request remediation, followed by Tailwind/ESLint/tooling
remediations.

## Addendum - 2026-06-25, Cypress toolchain

The Cypress/request remediation is documented in
[NPM_CYPRESS_REMEDIATION_2026-06-25.md](NPM_CYPRESS_REMEDIATION_2026-06-25.md).
That execution upgraded Cypress to 15.18.0, removed the
`start-server-and-test > wait-on > axios` path, eliminated complete-tree
critical findings, and kept the production dependency audit clean.

The Vite/Vitest totals above remain a historical snapshot. Tailwind, Sass,
ESLint, `jsdom > ws` and other moderate/high development-tooling findings
remain unresolved.
