# Tax Update Policy

## Scope

Tax calculations are estimates and do not replace accounting, legal or tax
advice. Fiscal changes require official sources, focused tests and explicit
release notes.

## Source Hierarchy

Acceptable sources, in preferred order:

1. Autoridade Tributária e Aduaneira.
2. Segurança Social.
3. Diário da República or legislation.
4. Official government portals.
5. Reputable professional commentary as secondary context only.

## Change Rules

- No fiscal change without tests.
- No fiscal change hidden inside unrelated UI or tooling work.
- Tax-year updates should add data rather than mutate old years unless official
  corrections require it.
- Changing the default tax year requires compatibility review.
- Saved simulations and shared URLs must remain deterministic.
- New household or spouse/partner income models must document their simplified
  scope in UI copy, report export and tests.
- Tax-rank changes require explicit before and after tests.
- IAS changes require Social Security regression tests.
- Dependent deduction changes require age-bucket tests.
- Youth IRS changes require year and range tests.
- RNH/NHR changes require explicit scenario tests.
- Release notes must mention affected tax years.
- Tax-rule issues should use the tax-rule issue template.

## Tax Data Provenance Metadata

The app ships static, versioned fiscal-data provenance metadata in
`src/taxData/provenance.ts`. This metadata powers the simulator status badge and
the About-page tax-data coverage section. It must remain separate from Pinia
state, URL parameters and saved simulations.

The default simulator tax year is derived dynamically from supported tax-data
coverage. When the current calendar year is supported, it is selected by
default. When a future calendar year is not supported yet, the app falls back
to the latest supported year; when the current year precedes the supported
range, it falls back to the earliest supported year. The tax-data status layer
continues to communicate review needs. Tests must cover default selection
whenever supported years change.

When fiscal data changes:

- Add or update a `TaxYearProvenance` entry for every supported tax year.
- Derive the latest supported year from metadata; do not duplicate it in UI
  code.
- Update `reviewedAt` with an ISO date in `YYYY-MM-DD` format.
- Keep `implementedInVersion` aligned with the release or public checkpoint
  that introduced the data.
- Link every year to official or internal governance sources through
  `sourceIds`.
- Add new `TaxDataSource` entries only for HTTPS official sources or internal
  repository documentation.
- Use conservative wording when exact legal references are not included in the
  source entry.
- Do not scrape or fetch official portals at runtime.

Required validation:

- `npm run vitest -- --run src/taxData/provenance.spec.ts`
- `npm run vitest -- --run`
- Cypress coverage for the status disclosure and About-page source references
  when the UI changes.

## New Tax-Year Checklist

For a new tax year such as 2027:

- Add tax ranks.
- Add IAS.
- Add Youth IRS data if applicable.
- Add provenance metadata, official-source references and `reviewedAt`.
- Add unit and E2E tests.
- Confirm URL hydration.
- Confirm old saved simulations still render.
- Update README and documentation scope.
- Confirm the dynamic default tax-year selection tests cover the new year.
- Update `CHANGELOG.md`.

Do not change tax data without completing the relevant checklist.
