# Contributing

Thank you for helping improve Freelancer Calculator Portugal. This project is
a Vue 3, TypeScript, Pinia and Vite static app for estimating freelancer net
income, IRS and Social Security in Portugal.

## Requirements

- Node.js 24.
- npm compatible with Node.js 24.
- Reproducible installs with `npm ci`.

## Local Setup

```bash
npm ci
npm run dev
```

The development server is powered by Vite. Production assets are built with:

```bash
npm run build
npm run verify:production-build
```

## Quality Commands

Use these before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run vitest -- --run
npm run build
npm run verify:production-build
npm run check
```

Use `npm run lint:fix` for safe ESLint fixes and `npm run format` for Prettier
formatting. Cypress remains a separate end-to-end gate:

```bash
npm run cy:e2e:run
```

`npm run typecheck` is the supported Vue-aware TypeScript check. Plain
`npx tsc --noEmit` is diagnostic-only for this Vue SFC project.

## Line Endings

Tracked text files use LF line endings. `.gitattributes` enforces this on every
platform, so Windows contributors do not need to change global Git settings.

Run `npm run format:check` before opening a pull request. If it reports
formatting drift, run `npm run format` and review the diff before committing.
After pulling the line-ending policy into an older working tree, `git add
--renormalize .` or a clean checkout can refresh stale local files.

## Branches And Commits

Keep pull requests focused on one concern. Include the validation commands you
ran and call out any command that could not run locally. Do not combine fiscal
formula changes with unrelated formatting, dependency or UI cleanup.

## Fiscal Rule Changes

Tax-rule changes need extra care. Do not change IRS formulas, Social Security
formulas, tax brackets, IAS values, dependent deductions, assessment behavior
or professional-expense calculations as part of unrelated work.

When proposing a tax-rule change:

- include the tax year;
- include the assessment scenario;
- include dependent counts and age buckets when relevant;
- cite official Portuguese sources such as Autoridade Tributaria e Aduaneira,
  Seguranca Social or published legislation;
- add or update Vitest coverage for the raw numerical result.

Do not include private tax returns, private invoices, bank details or other
personal financial documents in issues or pull requests.

## Locales

The supported locales are English, Portugues (Portugal) and Portugues (Brasil).
When adding or changing copy, update all locale catalogues and keep
`docs/I18N.md` in sync. Run the i18n tests through `npm run vitest -- --run`
and `npm run cy:e2e:run`.

## Themes

Appearance preferences are `system`, `light` and `dark`. Theme architecture is
documented in `docs/THEMING.md`. Theme preference must stay out of URLs, saved
simulations and tax state.
