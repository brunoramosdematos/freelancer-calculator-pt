# Changelog

All notable changes to this project are documented here.

This changelog follows the spirit of Keep a Changelog and uses SemVer-inspired
project versions. The web app is not published to npm; versions are used for
GitHub releases, support references and public production checkpoints.

## [Unreleased]

No changes yet.

## [0.7.0] - 2026-07-03

### Added

- Added on-screen scenario comparison for assessment and Social Security
  alternatives.
- Added comparison presets for individual assessment, joint single-income
  assessment, Social Security -20% and no dependents.
- Added scenario comparison result cards showing gross income, IRS, Social
  Security, annual net income, monthly net income and difference versus the
  current scenario.

### Changed

- Replaced the dense scenario comparison results table with responsive cards.
- Improved scenario comparison status labels so current, alternative and best
  result indicators remain clear and well-aligned across locales.

### Security

- Production dependency audit remains clean.
- Critical dependency audit remains clean.

### Documentation

- Updated changelog and durable release notes for the scenario-comparison
  release.

## [0.6.0] - 2026-07-01

### Added

- Added a printable income report preview that can be saved as PDF through the
  browser print dialog.
- Added fiscal-data coverage and source-reference status near the tax-year
  selector and About page.

### Fixed

- Aligned the active simulator action toolbar so reset, share, export report and
  save remain visually stable across locales and viewport sizes.
- Prevented Portuguese theme-option labels from overflowing inside the
  preferences panel.
- Stabilized the simulator hero spacing between the landing and active states.
- Stabilized local formatting checks across Windows and Linux by documenting
  and enforcing repository line-ending policy.

### Changed

- Reduced initial JavaScript by lazy-loading the income breakdown chart and
  secondary routes.
- Raised the Lighthouse performance gate after measuring the optimized build.

### Security

- Production dependency audit remains clean.
- Critical dependency audit remains clean.

### Documentation

- Updated performance, quality, tax-update and release documentation as needed
  for the new release.

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

[unreleased]: https://github.com/brunoramosdematos/freelancer-calculator-pt/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/brunoramosdematos/freelancer-calculator-pt/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/brunoramosdematos/freelancer-calculator-pt/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/brunoramosdematos/freelancer-calculator-pt/tree/v0.5.0
[production]: https://freelancerpt.brunomatos.dev/
