# Changelog

All notable changes to this project are documented here.

This changelog follows the spirit of Keep a Changelog and uses SemVer-inspired
project versions. The web app is not published to npm; versions are used for
GitHub releases, support references and public production checkpoints.

## [Unreleased]

### Added

- Added fiscal-data coverage and source-reference status near the tax-year
  selector and About page.

### Fixed

- Prevented Portuguese theme-option labels from overflowing inside the
  preferences panel.
- Stabilized the simulator hero spacing between the landing and active states.
- Stabilized local formatting checks across Windows and Linux by documenting
  and enforcing repository line-ending policy.

### Changed

- Reduced initial JavaScript by lazy-loading the income breakdown chart and
  secondary routes.
- Raised the Lighthouse performance gate after measuring the optimized build.

## [0.5.0] - 2026-06-27

First formal public release of Freelancer Calculator Portugal.

### Added

- Individual assessment and joint single-income assessment.
- Dependent deductions and dependent age groups.
- Social Security cap, minimum and exemption transparency.
- Saved simulations stored locally in the browser.
- English, Portuguese (Portugal) and Portuguese (Brazil) locales.
- Localized currency, number and date formatting.
- System, Light and Dark appearance preferences.
- GitHub Pages production launch on the custom domain.
- Node 24 runtime and CI.
- Production dependency audit gate and critical audit gate.
- Vite, Vitest and Cypress modernization.
- Accessibility and performance gates.
- Quality, typecheck, lint and format gates.
- Release governance documentation, release validation workflow and release
  readiness checks.
- Manual branch-protection checklist and CODEOWNERS ownership metadata.
- Tax data update policy and maintenance roadmap.
- Durable versioned release notes in `docs/releases/v0.5.0.md`.

### Changed

- GitHub Actions deploy from `main` requires the full pre-deploy gate set.
- `check:release` includes bundle budget, Lighthouse, Cypress E2E, Cypress axe
  accessibility and release-readiness verification.

### Fixed

- Backward compatibility for older shared URLs and saved simulations.
- Accessible names and labels for dependent counters and related controls.

### Security

- Production dependency tree remediated to zero production audit findings.
- Remaining audit findings were limited to development tooling at the time of
  capture.

### Documentation

- Added contributor, security, deployment, i18n, theming, accessibility,
  performance and dependency-security documentation.
- Added release process, versioning, tax update, branch protection and roadmap
  documentation.

[unreleased]: https://github.com/brunoramosdematos/freelancer-calculator-pt/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/brunoramosdematos/freelancer-calculator-pt/tree/v0.5.0
[production]: https://freelancerpt.brunomatos.dev/
