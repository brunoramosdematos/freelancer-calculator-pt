# Cypress Toolchain Remediation — 2026-06-25

## Scope

- Repository: `brunoramosdematos/freelancer-calculator-pt`.
- Starting SHA: `d0ccd05b5433e12078f0cd918e5e020fd1a82dbb`.
- Implementation SHA: `22d68ea262625b4563b57bb7ffd713c836e4ddb0`.
- Local Node.js: `v24.14.0`.
- Local npm: `11.16.0`.
- Production URL: `https://freelancerpt.brunomatos.dev/`.

Intentionally changed:

| Package or tool | Before | After |
| --- | ---: | ---: |
| `cypress` package | 13.6.3 | 15.18.0 |
| Cypress binary | 13.6.3 | 15.18.0 |
| Cypress Electron | 25.8.4 | 37.6.0 |
| Cypress bundled Node | 18.15.0 | 22.19.0 |
| `@cypress/request` | 3.0.1 | 4.0.1 |
| `form-data` in Cypress path | 2.3.3 | 4.0.6 |
| `tmp` in Cypress path | 0.2.1 | 0.2.7 |
| `lodash` in Cypress path | 4.17.21 | 4.18.1 |
| `start-server-and-test` | 2.0.3 | removed |
| `wait-on` | 7.2.0 | removed |
| `axios` | 1.6.5 | removed |
| `cypress-io/github-action` | v6 | v7.4.0 |

Explicitly excluded: Vite, Vitest, TypeScript, `@types/node`, Vue, Pinia, Vue
Router, Tailwind, ESLint, Sass, PostCSS, production domain, GitHub Pages
architecture, application package name/version, fiscal formulas, UI behavior,
URL format and saved-simulation format.

No application runtime file under `src/` changed.

## Before

Baseline command results:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | 489 packages; 22 vulnerabilities |
| `npm run audit:prod` | 0 | production audit clean |
| `npm audit --omit=dev --json` | 0 | 0 vulnerabilities |
| `npm audit --json` | 1 | 22 total: 0 low, 8 moderate, 12 high, 2 critical |
| `npm audit signatures` | 0 | 489 packages with verified registry signatures; 36 attestations |
| `npm run vitest -- --run` | 0 | 2 files, 92 tests passed |
| `npm run build` | 0 | production build passed |
| `npm run verify:production-build` | 0 | production artifact verified |
| `npm run cy:e2e:run` | 0 | 6 specs, 105 tests passed |
| `npx tsc --noEmit` | 2 | diagnostic-only baseline |

Relevant vulnerable paths before:

- `cypress > @cypress/request@3.0.1 > form-data@2.3.3`.
- `cypress > tmp@0.2.1`.
- `cypress > lodash@4.17.21`.
- `start-server-and-test@2.0.3 > wait-on@7.2.0 > axios@1.6.5`.
- `wait-on > axios > form-data@4.0.0`, `follow-redirects`, `joi`, `qs` and
  `lodash`.

The two critical complete-tree findings were `@cypress/request` and
`form-data`. The production dependency tree was already clean.

Baseline Cypress details:

- Cypress package: `13.6.3`.
- Cypress binary: `13.6.3`.
- Electron: `25.8.4`.
- Bundled Node: `18.15.0`.
- Detected local browsers: Chrome `149.0.7827.197`, Edge `149.0.4022.80`,
  Firefox `152.0.2`.

Baseline artifact metadata:

| File | Raw bytes | Gzip bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `assets/index-CCTCWyl7.css` | 33,574 | 6,441 | `7be4e91463d565c67fe64ac38663e1199bae8ce8e1ada53045c6c7ceb0e75da8` |
| `assets/index-CShlC_Aq.js` | 394,422 | 136,205 | `9b723c6bb730d35846b5a43ed8a94a7c5b3a2a86fe54f6d2326706ee3ab80067` |
| `favicon.svg` | 775 | 458 | `a36b79d4696918776e7dcd201ddb27fd0d3716c31ac70048036f8008293e57e3` |
| `index.html` | 1,992 | 625 | `d6a7424309d9a8fa396f014dd0810578a01c6d3465a063da6605c2d18a5160f7` |
| `robots.txt` | 81 | 96 | `58c144de55e1a79c7d482b0780366d4db7b45b318846a958ae4b47d2ff12655b` |
| `sitemap.xml` | 179 | 159 | `beb6963fd8d9d454e2c915b44a2575034d9b5190c2b83c8cc7d003c50c1b9269` |

Baseline title: `Freelancer Calculator Portugal | IRS & Social Security`.
Baseline canonical: `https://freelancerpt.brunomatos.dev/`.
Baseline assets: `/assets/index-CShlC_Aq.js`,
`/assets/index-CCTCWyl7.css`.

## Migration Review

Official references reviewed:

- Cypress migration guide, including Cypress 14 and Cypress 15.
- Cypress 15.18.0 changelog.
- Cypress Module API reference.
- `cypress-io/github-action` README and v7 releases.

Cypress 14 items reviewed:

- Node 18+ install requirement: not a blocker; project runs Node 24.
- Updated browser support: local/CI use modern Electron/Chrome-compatible
  browsers.
- `cy.origin()` and `document.domain` changes: no tracked usage.
- Selector Playground API rename: no `Cypress.SelectorPlayground` or
  `Cypress.ElementSelector` usage.
- Webpack 4 and Cypress webpack preprocessor removal: no Cypress webpack
  preprocessor, component testing, or custom file preprocessor usage.

Cypress 15 items reviewed:

- Node 20, 22 and 24+ support: selected Cypress 15.18.0 supports Node 24.
- `cy.exec()` result `code` renamed to `exitCode`: no `cy.exec()` usage.
- `Cypress.env()` deprecation and `allowCypressEnv`: no tracked
  `Cypress.env()` usage or installed Cypress plugin requiring it.
- `resourceType` and deprecated experiment searches: no relevant usage.
- Cypress 15.18.0 dependency updates include Electron `37.6.0`, bundled Node
  `22.19.0` and Chromium `138.0.7204.251`.

Repository searches covered:

- `Cypress.env(`, `cy.exec(`, `.its("code")`, `.its('code')`;
- `Cypress.SelectorPlayground`, `Cypress.ElementSelector`;
- `resourceType`, `cy.origin(`, `document.domain`;
- `webpack`, `@cypress/webpack-preprocessor`, `file:preprocessor`;
- component testing configuration, custom reporters, browser-specific config
  and deprecated experiments;
- `start-server-and-test`, `wait-on`, `axios`.

The only product-test compatibility change was in
`cypress/e2e/test_simulator_to_url_parameters.cy.ts`: the old assertion
checked that the whole URL did not contain the character `0`. With the required
IPv4 base URL, `127.0.0.1` made that host-dependent. The assertion now checks
the hash route for absence of `income=0`, preserving the product assertion that
zero income must not be written as `income=0`.

## Remediation

Selected Cypress version:

- `npm view cypress version` returned `15.18.0`.
- `npm view cypress@15 version --json` showed `15.18.0` as the newest stable
  15.x release.
- `npm view cypress@15.18.0 engines --json` returned
  `^20.1.0 || ^22.0.0 || >=24.0.0`.

Selected GitHub Action version:

- `cypress-io/github-action@v7.4.0`, the latest stable v7 release found in the
  official releases page during execution.
- The action README states v7 supports Node 22, 24 and 26, uses `node24`, and
  remains compatible with Cypress 10 and above.

Runner changes:

- `scripts/run-cypress-e2e.mjs` now uses the official Cypress Node Module API:
  `cypress.run()` for headless mode and `cypress.open()` for interactive mode.
- The script supports:
  - `node scripts/run-cypress-e2e.mjs run`;
  - `node scripts/run-cypress-e2e.mjs open`;
  - omitted mode defaults to `run`.
- `CYPRESS_PORT` is validated as an integer in the range `1..65535`.
- The Vite server binds explicitly to `127.0.0.1`, defaults to port `8261`,
  and uses `strictPort: true`.
- The runner passes `http://127.0.0.1:<port>` as Cypress `baseUrl`.
- The Vite server is closed after Cypress finishes, if Cypress fails to start,
  and on SIGINT/SIGTERM where practical.
- The runner uses `posixExitCodes` and exits `0` only when all tests pass.
- A Vite stdin-end behavior was handled by creating the Vite server with
  `CI=true` only during `createServer`; without this, Cypress spawning closed
  stdin and Vite called `process.exit()` before the Module API returned.

`start-server-and-test` removal:

- The only live usage was the `cy:e2e:open` package script.
- The direct dev dependency was removed.
- `wait-on`, `axios`, `joi`, `follow-redirects`, `qs` and the old related
  vulnerable paths disappeared through normal lockfile resolution.
- No new server-wait dependency was added.

Cypress hardening:

- `cypress.config.ts` now uses `http://127.0.0.1:8261`.
- `allowCypressEnv: false` was added after confirming there are no tracked
  `Cypress.env()` calls and no installed Cypress plugin requiring that API.

Lockfile changes:

- Expected Cypress subtree updates were introduced.
- `@cypress/request` resolved to `4.0.1`.
- `form-data` resolved to `4.0.6`.
- `tmp` resolved to `0.2.7`.
- `lodash` resolved to `4.18.1`.
- The `start-server-and-test` / `wait-on` / `axios` execution chain was
  removed.
- Lockfile version remains `3`.
- No npm overrides, `--force`, `--legacy-peer-deps` or unrelated direct
  dependency range changes were used.

## After

Final Cypress details:

- Cypress package: `15.18.0`.
- Cypress binary: `15.18.0`.
- Electron: `37.6.0`.
- Bundled Node: `22.19.0`.
- Cypress run browser: Electron `138.0.7204.251`.
- Detected local browsers: Chrome `149.0.7827.197`, Edge `149.0.4022.80`,
  Firefox `152.0.2`.

Final command results after deleting `node_modules` and running fresh
`npm ci`:

| Command | Exit | Result |
| --- | ---: | --- |
| `node --version` | 0 | `v24.14.0` |
| `npm --version` | 0 | `11.16.0` |
| `npm ci` | 0 | 483 packages; 13 vulnerabilities |
| `npx cypress install` | 0 | Cypress 15.18.0 already installed in cache |
| `npx cypress verify` | 0 | Cypress verified |
| `npx cypress version` | 0 | package/binary 15.18.0; Electron 37.6.0; bundled Node 22.19.0 |
| `npx cypress info` | 0 | Chrome, Edge and Firefox detected |
| `npm run audit:prod` | 0 | production audit clean |
| `npm run audit:critical` | 0 | complete-tree critical count zero |
| `npm audit --omit=dev --json` | 0 | 0 vulnerabilities |
| `npm audit --json` | 1 | 13 total: 0 low, 4 moderate, 9 high, 0 critical |
| `npm audit signatures` | 0 | 483 packages with verified registry signatures; 38 attestations |
| `npm outdated --json` | 1 | outdated packages remain outside this execution |
| `npm run vitest -- --run` | 0 | 2 files, 92 tests passed |
| `npm run build` | 0 | production build passed |
| `npm run verify:production-build` | 0 | production artifact verified |
| `npm run cy:e2e:run` | 0 | 6 specs, 105 tests passed |
| `npx tsc --noEmit` | 2 | diagnostic-only; no new Cypress type category |

Remaining complete-tree findings:

- Moderate: `ajv`, `brace-expansion`, `js-yaml`, `micromatch`.
- High: `braces`, `cross-spawn`, `editorconfig`, `flatted`, `glob`,
  `immutable`, `minimatch`, `picomatch`, `ws`.

Removed findings:

- `@cypress/request` critical path.
- Vulnerable `form-data` critical path through Cypress/request.
- Vulnerable `form-data` path through `start-server-and-test > wait-on >
  axios`.
- `axios`, `follow-redirects`, `joi`, `qs`, old `lodash`, old `tmp` and
  related wait-on paths.

Typecheck diagnostic:

- Remaining categories are the known missing `@babel/types` declarations,
  Pinia declaration issue and existing Vue SFC module declaration support.
- No Cypress type-definition error category was introduced.

Functional fiscal checks:

| Scenario | Result |
| --- | ---: |
| 2024, EUR 60,000 annual gross, individual IRS | `12576.22` |
| 2024, EUR 60,000 annual gross, joint single-income IRS | `8608.78998` |
| 2024, EUR 60,000 annual gross, joint single-income with dependents aged 2 and 5 IRS | `7108.78998` |
| 2026, EUR 11,000 monthly, SS 0% | `1379.3498399999999` |
| 2026, EUR 11,000 monthly, SS -20% | `1318.24` |
| 2026, EUR 11,000 monthly, SS -25% | `1235.8499999999997` |

`npm run cy:e2e:run` released port `8261` after completion:
`port_8261_listening=false`.

Open-mode validation was not executed in this unattended Codex run because
`cypress.open()` launches an interactive GUI and waits for the user to close it.
Headless run mode and CI are the deployment gates.

## Artifact Comparison

The final production artifact is byte-for-byte identical to the baseline.

| File | Raw bytes | Gzip bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `assets/index-CCTCWyl7.css` | 33,574 | 6,441 | `7be4e91463d565c67fe64ac38663e1199bae8ce8e1ada53045c6c7ceb0e75da8` |
| `assets/index-CShlC_Aq.js` | 394,422 | 136,205 | `9b723c6bb730d35846b5a43ed8a94a7c5b3a2a86fe54f6d2326706ee3ab80067` |
| `favicon.svg` | 775 | 458 | `a36b79d4696918776e7dcd201ddb27fd0d3716c31ac70048036f8008293e57e3` |
| `index.html` | 1,992 | 625 | `d6a7424309d9a8fa396f014dd0810578a01c6d3465a063da6605c2d18a5160f7` |
| `robots.txt` | 81 | 96 | `58c144de55e1a79c7d482b0780366d4db7b45b318846a958ae4b47d2ff12655b` |
| `sitemap.xml` | 179 | 159 | `beb6963fd8d9d454e2c915b44a2575034d9b5190c2b83c8cc7d003c50c1b9269` |

Final title: `Freelancer Calculator Portugal | IRS & Social Security`.
Final canonical: `https://freelancerpt.brunomatos.dev/`.
Final assets: `/assets/index-CShlC_Aq.js`,
`/assets/index-CCTCWyl7.css`.

No source map or unexpected runtime asset was introduced.

## CI Gates

Package scripts:

- `audit:prod`: `npm audit --omit=dev --audit-level=moderate`.
- `audit:critical`: `npm audit --audit-level=critical`.

Workflow changes:

- `cypress-run` now uses `cypress-io/github-action@v7.4.0`.
- The Cypress action starts Vite with:
  `npm run dev -- --host 127.0.0.1 --port 8261 --strictPort`.
- The Cypress action waits on:
  `http://127.0.0.1:8261`.
- The production audit job still uses `npm ci --ignore-scripts`.
- The production audit job now runs both:
  - `npm run audit:prod`;
  - `npm run audit:critical`.

Deploy dependency chain remains:

`vitest + cypress-run + production-audit -> deploy`.

## Residual Risks

The complete dependency tree is not clean. Remaining findings are
development/tooling risks and should stay in separate focused remediations:

- Tailwind and PostCSS ecosystem dependents that pull `braces`/`picomatch`.
- Sass and style tooling.
- ESLint/config/glob/minimatch/editorconfig tooling.
- `jsdom > ws`.
- `@vue/test-utils`/glob paths.
- Diagnostic `tsc --noEmit` remains non-zero for existing Vue/dependency
  declaration categories.

## Rollback

Rollback target:

- Revert implementation commit
  `22d68ea262625b4563b57bb7ffd713c836e4ddb0`.

Expected package/tool versions after rollback:

- `cypress@13.6.3`.
- Cypress binary `13.6.3`.
- Electron `25.8.4`.
- Cypress bundled Node `18.15.0`.
- `start-server-and-test@2.0.3`.
- `cypress-io/github-action@v6`.

Verification commands after rollback:

```sh
npm ci
npm run audit:prod
npm audit --json
npm run vitest -- --run
npm run build
npm run verify:production-build
npm run cy:e2e:run
```

## Conclusion

The Cypress/request critical findings were removed. The
`start-server-and-test` / `wait-on` / `axios` path was removed. The complete
dependency tree has zero critical findings, while moderate/high development
tooling findings remain. The production dependency audit remains clean and the
production artifact is byte-for-byte unchanged.

The project is ready to move from dependency maintenance to the dependent-age
UX improvement execution.
