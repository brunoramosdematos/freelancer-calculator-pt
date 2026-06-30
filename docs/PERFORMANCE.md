# Performance

Performance checks are release gates for the static production build. They are
designed to catch accidental bundle growth, test-code leakage and major
runtime regressions without depending on external services.

## Bundle Budget

Run the bundle budget gate after a production build:

```bash
npm run build
npm run verify:bundle-budget
```

The budget script uses Node built-ins only. It reads `dist`, gzip-compresses
each artifact with `zlib.gzipSync`, computes SHA-256 digests, and fails on
budget or content violations.

Current limits:

- initial JavaScript raw size <= 420,000 bytes;
- initial JavaScript gzip size <= 140,000 bytes;
- total JavaScript raw size <= 570,000 bytes;
- total JavaScript gzip size <= 190,000 bytes;
- largest JavaScript asset raw size <= 550,000 bytes;
- largest JavaScript asset gzip size <= 185,000 bytes;
- total CSS raw size <= 45,000 bytes;
- total CSS gzip size <= 12,000 bytes;
- `index.html` raw size <= 9,000 bytes;
- JavaScript chunk count <= 5;
- no source maps;
- no Cypress, cypress-axe, axe-core, Vitest or Node runtime strings in built
  HTML, CSS or JavaScript.

The script classifies initial JavaScript from `dist/index.html`: module
scripts and any `rel="modulepreload"` JavaScript links count as initial.
Remaining JavaScript files are expected lazy chunks and are reported
separately. This keeps the first simulator path small while still tracking the
complete production artifact.

The optimized post-v0.5.0 build measures:

- initial JS: `assets/index-_PtXUjFE.js`, 286,094 bytes raw, 89,071 bytes
  gzip;
- lazy chart JS: `assets/Chart-Crtl2Bve.js`, 218,590 bytes raw, 75,815 bytes
  gzip;
- lazy About route JS: `assets/AboutView-Bl8kdYjh.js`, 1,267 bytes raw, 638
  bytes gzip;
- lazy Simulations route JS: `assets/SimulationsView-fQJXqHBo.js`, 2,945
  bytes raw, 1,404 bytes gzip;
- total JS: 508,896 bytes raw, 166,928 bytes gzip;
- CSS: `assets/index-BsK4JYMG.css`, 32,237 bytes raw, 6,515 bytes gzip;
- `index.html`: 3,043 bytes raw.

The v0.5.0 baseline had one JavaScript chunk,
`assets/index-DNnVxyUy.js`, at 501,719 bytes raw and 164,237 bytes gzip.
The optimized build reduces initial JavaScript by 215,625 bytes raw and 75,166
bytes gzip while keeping total JavaScript within the modest post-split budget.

## Lazy Loading

The simulator route remains the eager entry point. The income breakdown chart
is loaded through an async Vue component only after the chart disclosure is
opened, which keeps Chart.js and `chartjs-plugin-datalabels` out of the initial
bundle. Closing the disclosure still unmounts the chart content so Chart.vue's
existing cleanup can destroy the canvas instance.

Secondary routes are split with Vue Router dynamic imports:

- `/#/about` loads `AboutView` on demand;
- `/#/simulations` loads `SimulationsView` on demand.

The built `index.html` contains no `modulepreload` links for the chart or route
chunks, so they are not preloaded on the landing simulator route.

The printable report preview is also lazy-loaded behind the active simulator's
export action. The first measured report-export build added
`assets/ReportPreviewDialog-DvR23iSH.js` as a lazy chunk at 15,074 bytes raw
and 4,890 bytes gzip. Compared with the pre-feature baseline from this
execution, initial JavaScript increased from 92,031 bytes gzip to 93,523 bytes
gzip, CSS increased from 6,711 bytes gzip to 7,091 bytes gzip, and the JavaScript
chunk count intentionally moved from 4 to 5 while staying within the total
JavaScript budget.

## Lighthouse Smoke

Run the local Lighthouse smoke check after a production build:

```bash
npm run lighthouse:ci
```

The script:

- requires an existing `dist/index.html`;
- starts `vite preview` on `127.0.0.1:4173` with `--strictPort`;
- launches the project-local Lighthouse dependency against local URLs;
- uses desktop emulation;
- closes Chrome and the preview server on success, failure, SIGINT or SIGTERM.

Checked URLs:

- `/#/`;
- `/#/?income=60000`;
- `/#/about`.

Current thresholds:

- performance >= 0.55;
- accessibility >= 0.90;
- best practices >= 0.90;
- SEO >= 0.90.

The performance threshold was raised from 0.40 after lazy-loading Chart.js and
secondary routes. Three local desktop passes of the optimized build observed
performance scores from 0.59 to 0.67:

- `/#/`: 0.67, 0.67, 0.67;
- `/#/?income=60000`: 0.62, 0.61, 0.61;
- `/#/about`: 0.61, 0.62, 0.59.

CI scores can still vary with the Ubuntu runner, but the gate now requires a
measured improvement while retaining headroom below the local low score.

The first PR CI run for this optimization observed performance scores from
0.70 to 0.73 in the `accessibility-performance` job:

- `/#/`: 0.70;
- `/#/?income=60000`: 0.73;
- `/#/about`: 0.73.

## Source Maps

Source maps are not published in `dist`. The bundle budget gate fails if any
`.map` file appears in the production artifact.

## When A Budget Fails

1. Run `npm run build` and `npm run verify:bundle-budget` locally.
2. Inspect the printed artifact names, raw sizes, gzip sizes and hashes.
3. Check whether a dependency or import added unexpected runtime code.
4. Reduce accidental growth before increasing a budget.
5. If a budget increase is justified, document the reason, measured before and
   after values, and why the user-facing benefit outweighs the cost.

## Known Warnings

- Browserslist may warn that `caniuse-lite` is outdated; this is metadata
  maintenance and should be handled in a dependency-maintenance execution.
- On Windows, Chrome cleanup after Lighthouse can occasionally print an
  `EPERM` temporary-directory warning after scores are collected. The script
  treats this as cleanup noise only when Lighthouse itself succeeded.

## Future Improvements

- Review whether additional dialog-level splitting is worthwhile after more
  real-user measurements.
- Continue dependency review for heavy client-side libraries.
- Consider a lighter charting alternative only if Chart.js remains a measured
  bottleneck after preserving accessibility and localization behavior.
- Add mobile Lighthouse as a separate measured gate once it is stable in CI.
- Raise the performance threshold again after CI score history shows enough
  stability.
