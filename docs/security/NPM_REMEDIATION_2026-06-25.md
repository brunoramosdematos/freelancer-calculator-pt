# npm Production Dependency Remediation — 2026-06-25

## Scope

- Repository: `brunoramosdematos/freelancer-calculator-pt`.
- Starting SHA: `f07b308cdd0a5fa30da7da7a0de974bb41fe4ce6`.
- Final SHA: `e7ece9214c5be9e39106b94df2dab2e2339bb091`.
- Execution timestamp: `2026-06-25T00:07:36Z`.
- Local Node.js: `v24.14.0`.
- Local npm: `11.16.0`.
- Lockfile version: `3`.
- Packages intentionally changed: `postcss`.
- Transitive packages naturally changed by `postcss`: `nanoid`,
  `picocolors`, `source-map-js`.
- Conditional package attempted and reverted: `@types/node`.
- Explicitly excluded from this execution: Vite, Vitest, Cypress, Tailwind,
  ESLint, Vue, Pinia, TypeScript, and broader application modernization.
- No files under `src/` were modified.

## Before

Baseline command state before dependency changes:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | 549 packages installed; 34 vulnerabilities reported. |
| `npm run vitest -- --run` | 0 | 2 files passed; 92 tests passed. |
| `npm run build` | 0 | Vite build passed; 396 modules transformed. |
| `npm run verify:production-build` | 0 | Production artifact verified. |
| `npm run cy:e2e:run` | 0 | 6 specs passed; 105 tests passed. |
| `npm audit --json` | 1 | Expected non-zero with findings present. |
| `npm audit --omit=dev --json` | 1 | Expected non-zero with production findings present. |
| `npm outdated --json` | 1 | Expected non-zero with outdated packages present. |
| `npm audit signatures` | 0 | 549 signatures and 12 attestations verified. |

Baseline complete audit totals:

| Scope | Total | Info | Low | Moderate | High | Critical |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Complete tree | 34 | 0 | 4 | 12 | 15 | 3 |
| Production-only tree | 2 | 0 | 0 | 2 | 0 | 0 |

Baseline vulnerable package counts:

| Scope | Direct vulnerable packages | Transitive vulnerable packages |
| --- | ---: | ---: |
| Complete tree | 3 | 31 |
| Production-only tree | 1 | 1 |

Relevant baseline package versions:

| Package | Version | Path |
| --- | ---: | --- |
| `postcss` | 8.4.33 | Direct dev dependency; also deduped through Vite, Tailwind, and Vue compiler paths. |
| `nanoid` | 3.3.7 | `postcss > nanoid`. |
| `@types/node` | 18.11.18 | Direct dev dependency. |

Production advisory paths:

| Package | Advisory | Severity | Vulnerable range |
| --- | --- | --- | --- |
| `postcss` | `GHSA-qx2v-qp2m-jg93` - XSS via unescaped `</style>` in CSS stringify output | Moderate | `<8.5.10` |
| `nanoid` | `GHSA-mwcw-c2x4-8c55` - predictable results with non-integer values | Moderate | `<3.3.8` |

## Remediation

The npm registry was queried during execution:

| Query | Result |
| --- | --- |
| `npm view postcss version` | `8.5.15` |
| `npm view nanoid version` | `5.1.16` |
| `npm view nanoid@3 version --json` | Latest 3.x line includes `3.3.15`. |
| `npm view postcss@8.5.15 dependencies --json` | `nanoid: ^3.3.12`, `picocolors: ^1.1.1`, `source-map-js: ^1.2.1`. |

Selected PostCSS version:

- `postcss@8.5.15`.
- Reason: newest stable release in PostCSS major version 8 at execution time;
  it is above the fixed audit range `<8.5.10`.
- No PostCSS major upgrade was performed.

Resulting transitive versions:

| Package | Before | After | Reason |
| --- | ---: | ---: | --- |
| `postcss` | 8.4.33 | 8.5.15 | Direct targeted update. |
| `nanoid` | 3.3.7 | 3.3.15 | Resolved naturally from `postcss@8.5.15` range `^3.3.12`. |
| `picocolors` | 1.0.0 | 1.1.1 | Resolved naturally from `postcss@8.5.15`. |
| `source-map-js` | 1.0.2 | 1.2.1 | Resolved naturally from `postcss@8.5.15`. |

No `overrides` entry was added. `nanoid` was not added as a direct
dependency.

`@types/node` outcome:

- Registry query found latest Node 24 type release: `@types/node@24.13.2`.
- Attempted update: `npm install --save-dev @types/node@24.13.2`.
- `npm run build` passed and `npm run vitest -- --run` passed.
- `npx tsc --noEmit` failed with TypeScript 4.9 compatibility errors from the
  Node 24 type package, including missing `esnext.disposable`, `Disposable`,
  `AsyncDisposable`, and `Symbol.asyncDispose` support.
- The `@types/node` change was reverted only for that package.
- Final retained version: `@types/node@18.11.18` with declaration range
  `^18.11.9`.
- Node 24 typings should be handled later with the TypeScript/toolchain
  migration. No `skipLibCheck` or type weakening was added.

Lockfile changes were limited to root package metadata for `postcss`, the
`postcss` package entry, and the transitive packages naturally selected by
`postcss@8.5.15`: `nanoid`, `picocolors`, and `source-map-js`.

## Artifact Comparison

Baseline `dist` was preserved outside the repository before dependency
changes. The post-remediation build produced byte-for-byte identical output:

| Path | Size | SHA-256 | Comparison |
| --- | ---: | --- | --- |
| `assets/index-Ke9NscWn.css` | 33598 | `f69af5fe5f94b89316c4741c351a9edf89509ff9c7f659b7396f898b4f8bee73` | Same |
| `assets/index-sLkUeQuZ.js` | 396058 | `28959ab1d9a69466ccdce50c5a08345d3678222ab5db1a9463957ff172ecda1f` | Same |
| `favicon.svg` | 775 | `a36b79d4696918776e7dcd201ddb27fd0d3716c31ac70048036f8008293e57e3` | Same |
| `index.html` | 1992 | `85be4b534efa184808318a76e853d4da321970f77eb9d7bad3d56d32e30da749` | Same |
| `robots.txt` | 81 | `58c144de55e1a79c7d482b0780366d4db7b45b318846a958ae4b47d2ff12655b` | Same |
| `sitemap.xml` | 179 | `beb6963fd8d9d454e2c915b44a2575034d9b5190c2b83c8cc7d003c50c1b9269` | Same |

No CSS, JavaScript, metadata, robots, sitemap, runtime dependency, source map,
layout, or visual output change was detected by artifact hashing.

## After

Post-remediation audit totals:

| Scope | Total | Info | Low | Moderate | High | Critical | Exit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Complete tree | 32 | 0 | 4 | 10 | 15 | 3 | 1 |
| Production-only tree | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Post-remediation vulnerable package counts:

| Scope | Direct vulnerable packages | Transitive vulnerable packages |
| --- | ---: | ---: |
| Complete tree | 2 | 30 |
| Production-only tree | 0 | 0 |

The production dependency audit is clean:

```text
npm run audit:prod
found 0 vulnerabilities
```

Remaining high and critical development findings:

| Package | Severity | Direct | Range |
| --- | --- | --- | --- |
| `@cypress/request` | Critical | No | `<=3.0.10` |
| `form-data` | Critical | No | `<=2.5.5 || 4.0.0 - 4.0.5` |
| `vitest` | Critical | Yes | `<=3.2.5` |
| `axios` | High | No | `1.0.0 - 1.15.2` |
| `braces` | High | No | `<3.0.3` |
| `cross-spawn` | High | No | `7.0.0 - 7.0.4` |
| `editorconfig` | High | No | `1.0.3 - 1.0.4 || 2.0.0` |
| `flatted` | High | No | `<=3.4.1` |
| `glob` | High | No | `10.2.0 - 10.4.5` |
| `immutable` | High | No | `4.0.0-rc.1 - 4.3.7` |
| `lodash` | High | No | `<=4.17.23` |
| `minimatch` | High | No | `<=3.1.3 || 9.0.0 - 9.0.6` |
| `path-to-regexp` | High | No | `4.0.0 - 6.2.2` |
| `picomatch` | High | No | `<=2.3.1` |
| `rollup` | High | No | `4.0.0 - 4.58.0` |
| `tmp` | High | No | `<=0.2.5` |
| `vite` | High | Yes | `<=6.4.2` |
| `ws` | High | No | `8.0.0 - 8.20.1` |

`npm audit signatures` after remediation:

```text
audited 549 packages in 4s
549 packages have verified registry signatures
13 packages have verified attestations
```

`npm outdated --json` remains non-zero, with 24 direct outdated package names
after `postcss` is no longer outdated.

`npx tsc --noEmit` was run for visibility and exited `1`. After reverting
`@types/node` to 18.11.18, the Node 24 disposable-symbol errors disappeared,
but the repository still does not have a supported plain `tsc --noEmit`
typecheck path. Remaining errors include missing Vue SFC module declarations,
missing transitive declaration packages such as `@babel/types`, Vite/Rollup
declaration resolution, and an existing `vite.config.ts` overload mismatch.
No TypeScript, tsconfig, Vue, or source-code migration was performed in this
execution.

## CI gate

New package script:

```json
"audit:prod": "npm audit --omit=dev --audit-level=moderate"
```

New workflow job: `production-audit`.

The job:

- runs on `ubuntu-latest`;
- checks out the repository;
- uses `actions/setup-node@v4` with `node-version: 24`;
- uses npm cache;
- installs with `npm ci --ignore-scripts`;
- runs `npm run audit:prod`.

The deploy dependency chain is now:

```text
vitest + cypress-run + production-audit -> deploy
```

The CI gate blocks moderate-or-higher production dependency advisories. It
does not make the complete development-tooling audit blocking because known
development findings remain scheduled for later remediation.

## Residual risk

- Vite/Vitest: direct development/build tooling findings remain, including
  critical `vitest` advisories and high `vite` advisories. These require a
  focused Vite/Vitest migration.
- Cypress/request: critical `@cypress/request` and `form-data` paths remain in
  E2E tooling. These are not shipped to production and should be remediated in
  a Cypress-specific update.
- MSW/Tailwind: globbing, watcher, and route-pattern advisories remain in
  build/test tooling. They are not browser runtime dependencies.
- ESLint/tooling: lint/config/cache advisories remain development-only and
  should be handled in a separate lint/toolchain update.
- `@types/node`: Node 24 typings are deferred because latest `@types/node@24`
  is incompatible with the current TypeScript 4.9 validation path.

Lifecycle-script maintainers from npm metadata:

| Package | Version | Lifecycle script | Maintainers from npm metadata |
| --- | ---: | --- | --- |
| `vue-demi` | 0.14.6 | `postinstall: node ./scripts/postinstall.js` | `posva`, `antfu` |
| `vue-demi` | 0.13.11 | `postinstall: node ./scripts/postinstall.js` | `antfu` |
| `cypress` | 13.6.3 | `postinstall: node index.js --exec install` | `cypress-npm-publisher`, `chrisbreiding`, `brian-mann`, `ryanthemanuel`, `mjhenkes`, `atofstryker`, `tbiethman`, `emilyrohrbough`, `dkasper`, `mschile`, `mike-plummer`, `astone123` |
| `esbuild` | 0.19.11 | `postinstall: node install.js` | `evanw`, `esbuild` |
| `msw` | 2.1.3 | `postinstall: node -e "try{require('./config/scripts/postinstall')}catch(e){}"` | `kettanaito` |
| `fsevents` | 2.3.3 | `install: node-gyp rebuild` | `pipobscure`, `paulmillr` |

## Rollback

Rollback target:

- Revert the focused remediation commit
  `e7ece9214c5be9e39106b94df2dab2e2339bb091`, which contains this document and
  the `postcss`/workflow changes.

Expected package versions after rollback:

| Package | Version after rollback |
| --- | ---: |
| `postcss` | 8.4.33 |
| `nanoid` | 3.3.7 |
| `picocolors` | 1.0.0 |
| `source-map-js` | 1.0.2 |
| `@types/node` | 18.11.18 |

Verification commands after rollback:

```bash
npm ci
npm run vitest -- --run
npm run build
npm run verify:production-build
npm run cy:e2e:run
npm audit --omit=dev --json
```

The rollback would reintroduce the two historical production-tree advisories
for `postcss` and `nanoid`.

## Conclusion

The production dependency tree is clean after the targeted PostCSS 8.x
remediation. `nanoid` was resolved naturally through PostCSS without an
override or direct dependency addition. The generated production artifact is
byte-for-byte identical to the baseline artifact.

The complete development dependency tree is not clean. The remaining high and
critical findings are development, test, lint, or build-toolchain risks and
should be handled in the next focused Vite/Vitest/Cypress/toolchain
remediation execution.

## Addendum - 2026-06-25

The Vite/Vitest-focused remediation is documented in
[NPM_TOOLCHAIN_REMEDIATION_2026-06-25.md](NPM_TOOLCHAIN_REMEDIATION_2026-06-25.md).
That execution remediated the direct `vite` and `vitest` findings, removed the
unused direct `msw` dependency, and kept the production dependency audit clean.

The audit totals and residual-risk text above remain a historical snapshot of
the production-dependency remediation execution. Cypress/request, Tailwind,
ESLint and other development-tooling findings remain unresolved and must stay
tracked separately.

## Addendum - 2026-06-25, Cypress toolchain

The Cypress-focused remediation is documented in
[NPM_CYPRESS_REMEDIATION_2026-06-25.md](NPM_CYPRESS_REMEDIATION_2026-06-25.md).
That execution removed the Cypress/request critical path, removed the
`start-server-and-test > wait-on > axios` path, added a complete-tree critical
audit gate, and kept the production dependency audit clean.

The audit totals above remain a historical snapshot of the
production-dependency remediation execution. Tailwind, Sass, ESLint,
`jsdom > ws` and other development-tooling findings remain unresolved and must
stay tracked separately.
