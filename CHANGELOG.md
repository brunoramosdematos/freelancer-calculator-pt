# Changelog

All notable changes to this project are documented here.

This changelog follows the spirit of Keep a Changelog and uses SemVer-inspired
project versions. The web app is not published to npm; versions are used for
GitHub releases, support references and public production checkpoints.

## [Unreleased]

### Added

- Release governance documentation, release validation workflow and release
  readiness checks.
- Manual branch-protection checklist and CODEOWNERS ownership metadata.
- Tax data update policy and maintenance roadmap.

### Changed

- `check:release` now includes release-readiness verification.

### Fixed

- No application fixes in this unreleased governance update.

### Security

- No production dependency changes in this unreleased governance update.

### Documentation

- Added release process, versioning, tax update, branch protection and roadmap
  documentation.

## [0.5.0] - 2026-06-26

Historical baseline captured as `0.5.0`. No Git tag existed at the time this
baseline was documented.

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

### Changed

- GitHub Actions deploy from `main` requires the full pre-deploy gate set.

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

[unreleased]: https://github.com/brunoramosdematos/freelancer-calculator-pt/compare/4520fa75381d553747fd9c39dd43b9a363063af7...HEAD
[0.5.0]: https://github.com/brunoramosdematos/freelancer-calculator-pt/tree/4520fa75381d553747fd9c39dd43b9a363063af7
[production]: https://freelancerpt.brunomatos.dev/
