# Versioning

## Purpose

`freelancer-calculator-pt` is currently private as an npm package and is not
published to the npm registry. The application version still matters because it
anchors GitHub releases, changelog entries, support discussions and production
checkpoints.

The current package version is `0.5.0`.

## Policy

The project uses a SemVer-inspired policy while it remains pre-1.0. Versions are
written as `MAJOR.MINOR.PATCH`, and release tags should use:

```bash
vMAJOR.MINOR.PATCH
```

When a release is cut, `package.json` version must match the release tag and
`CHANGELOG.md` must include the package version. GitHub Release notes should be
generated from `CHANGELOG.md`.

## Version Bumps Before 1.0

Use a patch bump for:

- bug fixes;
- documentation updates;
- internal maintenance;
- non-breaking tax data corrections;
- non-breaking dependency or CI maintenance.

Use a minor bump for:

- new user-facing features;
- new locales;
- new tax scenarios;
- tax-year additions;
- larger compatibility improvements.

Reserve major versions for the post-1.0 era. After 1.0, breaking URL or saved
simulation changes, major calculation behavior changes or other incompatible
contract changes require a major bump.

## Fiscal-Year Data

Fiscal-year updates may be patch or minor releases depending on impact. A small
official correction for an existing year can be a patch release. Adding a new tax
year or changing the default tax year usually warrants a minor release and clear
release notes.

URL and saved-simulation format changes require explicit migration notes, test
coverage and compatibility review before release.

## Release Metadata

The package remains private. Version changes are release metadata for the web
application and should not imply npm publishing.
