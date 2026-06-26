# Tax Update Policy

## Scope

Tax calculations are estimates and do not replace accounting, legal or tax
advice. Fiscal changes require official sources, focused tests and explicit
release notes.

## Source Hierarchy

Acceptable sources, in preferred order:

1. Autoridade Tributaria e Aduaneira.
2. Seguranca Social.
3. Diario da Republica or legislation.
4. Official government portals.
5. Reputable professional commentary as secondary context only.

## Change Rules

- No fiscal change without tests.
- No fiscal change hidden inside unrelated UI or tooling work.
- Tax-year updates should add data rather than mutate old years unless official
  corrections require it.
- Changing the default tax year requires compatibility review.
- Saved simulations and shared URLs must remain deterministic.
- Tax-rank changes require explicit before and after tests.
- IAS changes require Social Security regression tests.
- Dependent deduction changes require age-bucket tests.
- Youth IRS changes require year and range tests.
- RNH/NHR changes require explicit scenario tests.
- Release notes must mention affected tax years.
- Tax-rule issues should use the tax-rule issue template.

## New Tax-Year Checklist

For a new tax year such as 2027:

- Add tax ranks.
- Add IAS.
- Add Youth IRS data if applicable.
- Add unit and E2E tests.
- Confirm URL hydration.
- Confirm old saved simulations still render.
- Update README and documentation scope.
- Decide whether `DEFAULT_TAX_RANK_YEAR` changes.
- Update `CHANGELOG.md`.

Do not change tax data without completing the relevant checklist.
