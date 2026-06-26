# Freelancer Calculator Portugal

Open-source calculator for estimating net income, Portuguese IRS and Social
Security for freelancers. The app is a Vue 3 / Vite static SPA with hash
routing, Pinia state, Vitest unit tests and Cypress E2E coverage.

Production URL: https://freelancerpt.brunomatos.dev/

Repository: https://github.com/brunoramosdematos/freelancer-calculator-pt

The UI supports English, Português (Portugal), Português (Brasil), and the
System, Light, and Dark appearance preferences. Localization architecture and
glossary guidance are documented in [docs/I18N.md](docs/I18N.md), appearance
architecture is documented in [docs/THEMING.md](docs/THEMING.md), and local/CI
quality gates are documented in [docs/QUALITY_GATES.md](docs/QUALITY_GATES.md).
Accessibility expectations are documented in
[docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md), and performance budgets are
documented in [docs/PERFORMANCE.md](docs/PERFORMANCE.md).
Release history is tracked in [CHANGELOG.md](CHANGELOG.md), and release
governance is documented in [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md),
[docs/VERSIONING.md](docs/VERSIONING.md),
[docs/TAX_UPDATE_POLICY.md](docs/TAX_UPDATE_POLICY.md),
[docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md) and
[docs/ROADMAP.md](docs/ROADMAP.md).

## Scope

The simulator currently supports tax years 2023, 2024, 2025 and 2026. It models
two assessment scenarios: individual assessment with no spouse or partner in the
simulation, and joint assessment for a married/de-facto household where the
freelancer is the only taxable income earner. It also supports dependent counts
and the age buckets needed for the implemented dependent deduction.

Calculations are estimates and do not replace accounting, legal or tax advice.
Users should validate their own situation with Autoridade Tributaria e Aduaneira
or a qualified professional.

## Prerequisites

- Node.js 24 LTS.
- npm bundled with Node.js 24, or another npm version compatible with Node.js 24.
- Use `npm ci` for reproducible dependency installation from `package-lock.json`.

## Local Setup

Install dependencies reproducibly:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Verify the built production artifact:

```bash
npm run verify:production-build
```

Run unit tests:

```bash
npm run vitest -- --run
```

Run the release-hardening local quality gate:

```bash
npm run check
```

Run the full release gate, including bundle budgets, Lighthouse, Cypress E2E
and axe accessibility checks:

```bash
npm run check:release
```

Run Cypress E2E tests:

```bash
npm run cy:e2e:run
```

## Deployment

GitHub Pages deployment is handled by the repository workflow in
`.github/workflows/workflow.yml`. Vitest and Cypress must pass before the deploy
job builds the app, verifies the production artifact and uploads `./dist` to
Pages. The workflow runs the project on Node.js 24.

Manual GitHub Pages, custom-domain and DNS setup is documented in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Dependency Security

The historical npm dependency audit snapshot is documented in
[docs/security/NPM_AUDIT_2026-06-24.md](docs/security/NPM_AUDIT_2026-06-24.md).
The production dependency remediation report is documented in
[docs/security/NPM_REMEDIATION_2026-06-25.md](docs/security/NPM_REMEDIATION_2026-06-25.md).
The latest Vite/Vitest toolchain remediation report is documented in
[docs/security/NPM_TOOLCHAIN_REMEDIATION_2026-06-25.md](docs/security/NPM_TOOLCHAIN_REMEDIATION_2026-06-25.md).
The latest Cypress toolchain remediation report is documented in
[docs/security/NPM_CYPRESS_REMEDIATION_2026-06-25.md](docs/security/NPM_CYPRESS_REMEDIATION_2026-06-25.md).
Audit findings change as advisories and package versions change, and dependency
remediation is tracked in dated reports rather than changing README totals.

## Contributing And Security

Contributor setup, branch expectations and tax-rule contribution guidance are
documented in [CONTRIBUTING.md](CONTRIBUTING.md). Vulnerability reporting and
dependency audit policy are documented in [SECURITY.md](SECURITY.md).

## Upstream Attribution

This repository is a maintained derivative of the original open-source project
by Francisco Macedo:

https://github.com/franciscobmacedo/remotefreelancept

The project remains MIT licensed. See [LICENSE](LICENSE) for the preserved
copyright notices.
