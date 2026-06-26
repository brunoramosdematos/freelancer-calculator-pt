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

- total JavaScript raw size <= 550,000 bytes;
- total JavaScript gzip size <= 185,000 bytes;
- largest JavaScript asset raw size <= 550,000 bytes;
- largest JavaScript asset gzip size <= 185,000 bytes;
- total CSS raw size <= 45,000 bytes;
- total CSS gzip size <= 12,000 bytes;
- `index.html` raw size <= 8,000 bytes;
- JavaScript chunk count <= 1;
- no source maps;
- no Cypress, cypress-axe, axe-core, Vitest or Node runtime strings in built
  HTML, CSS or JavaScript.

The initial limits were set from the production build at gate introduction,
with modest headroom:

- `assets/index-B2NbnPm_.js`: 501,154 bytes raw;
- `assets/index-DMiC_46k.css`: 32,149 bytes raw;
- `index.html`: 3,043 bytes raw.

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

The performance threshold is intentionally lower than the ideal target because
the current desktop baseline is around 0.56 to 0.60 in local Lighthouse runs.
The gate still detects large regressions while avoiding flaky deployment
blocks. Future optimization work should raise this threshold after measured
improvements.

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

- Vite currently warns that the main chunk is larger than 500 kB after
  minification.
- Browserslist may warn that `caniuse-lite` is outdated; this is metadata
  maintenance and should be handled in a dependency-maintenance execution.
- On Windows, Chrome cleanup after Lighthouse can occasionally print an
  `EPERM` temporary-directory warning after scores are collected. The script
  treats this as cleanup noise only when Lighthouse itself succeeded.

## Future Improvements

- Split heavy visual/chart code when it can be done without hurting the main
  calculator flow.
- Add mobile Lighthouse as a separate measured gate once it is stable in CI.
- Raise the performance threshold after bundle and runtime improvements.
