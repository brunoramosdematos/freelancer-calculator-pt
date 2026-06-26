# Theming

## Supported Preferences

The application supports three appearance preferences:

- `system`
- `light`
- `dark`

The default preference is `system`. The storage key is:

```text
freelancer-calculator-pt:theme:v1
```

The stored preference is distinct from the resolved theme. `system` remains
stored as `system`; it resolves to `light` or `dark` from the browser and
operating-system `prefers-color-scheme` media query.

## Resolution Rules

- `system` plus a dark media query resolves to `dark`.
- `system` plus a light media query resolves to `light`.
- `light` always resolves to `light`.
- `dark` always resolves to `dark`.
- If `matchMedia` is unavailable, `system` resolves to `light`.

Theme resolution does not use the clock, sunrise/sunset, timezone, browser
time, or locale.

## Runtime Architecture

The theme domain lives in `src/theme/` and the Vue integration lives in
`src/composables/useTheme.ts`.

The pure helpers cover:

- preference validation;
- stored-preference reading;
- resolved-theme calculation;
- preference persistence;
- document application.

The Vue controller listens to:

```text
(prefers-color-scheme: dark)
```

When the stored preference is `system`, media-query changes update the resolved
theme without a reload. Explicit `light` and `dark` preferences ignore system
changes. Both `addEventListener("change", ...)` and the legacy Safari
`addListener(...)` path are supported.

## Pre-Paint Initialization

`index.html` contains a small synchronous script with `id="theme-initializer"`.
It runs before the application module and generated stylesheet in the
production document.

The initializer:

- reads only `freelancer-calculator-pt:theme:v1`;
- accepts only `system`, `light`, and `dark`;
- resolves `system` through `prefers-color-scheme`;
- applies `data-theme="light"` or `data-theme="dark"` to `<html>`;
- toggles the root `dark` class;
- sets `document.documentElement.style.colorScheme`;
- updates `meta[name="theme-color"]` when available;
- tolerates storage and `matchMedia` failures.

`scripts/verify-production-build.mjs` verifies that the initializer is present,
contains the storage key, and appears before the main Vite module and generated
stylesheet.

## Document State

Applying a resolved theme updates:

- `<html data-theme>`;
- the root `dark` class;
- `document.documentElement.style.colorScheme`;
- `meta[name="theme-color"]`.

Light browser chrome uses `#f5f5f5`. Dark browser chrome uses `#0b1220`.

Theme changes do not alter document language, localized metadata, canonical
URL, Open Graph URL, routes, URL query parameters, or route hash.

## CSS Token Architecture

The design system uses semantic CSS custom properties in `src/style.scss`.
Values are RGB triplets where Tailwind alpha syntax is useful.

Core tokens:

- `--color-page`
- `--color-surface`
- `--color-surface-elevated`
- `--color-surface-muted`
- `--color-surface-hover`
- `--color-text`
- `--color-text-muted`
- `--color-text-subtle`
- `--color-border`
- `--color-border-strong`
- `--color-primary`
- `--color-primary-soft`
- `--color-focus`
- `--color-income`
- `--color-income-soft`
- `--color-irs`
- `--color-irs-soft`
- `--color-social-security`
- `--color-social-security-soft`
- `--color-warning`
- `--color-warning-soft`
- `--color-danger`
- `--color-overlay`
- `--color-shadow`
- `--color-chart-label`
- `--color-chart-tooltip`
- `--color-chart-tooltip-text`

Light tokens are defined under `:root` and `html[data-theme="light"]`. Dark
tokens are defined under `html[data-theme="dark"]`.

## Tailwind Integration

`tailwind.config.cjs` exposes semantic colors backed by the CSS variables,
including:

- `bg-page`
- `bg-surface`
- `bg-surface-elevated`
- `bg-surface-muted`
- `bg-surface-hover`
- `text-foreground`
- `text-muted`
- `text-subtle`
- `text-income`
- `text-irs`
- `text-social-security`
- `bg-warning-soft`

Custom utilities provide semantic border and divider colors:

- `border-default`
- `border-strong`
- `divide-default`
- `shadow-theme`

The legacy custom color names used by existing tests, such as `secondary`, are
kept as variable-backed aliases.

## Financial Semantic Colours

Financial meaning is preserved in both themes:

- gross income uses neutral foreground text;
- net income uses green income tokens;
- IRS and total taxes use rose/red IRS tokens;
- Social Security uses blue tokens;
- caps, minimums, exemptions, and warnings use amber tokens.

Labels, headings, borders, and selected states remain visible so meaning is not
communicated by colour alone.

## Chart Integration

`Chart.vue` reads the active chart palette from CSS variables:

- net income;
- IRS;
- Social Security;
- datalabel text;
- tooltip background;
- tooltip text.

The tax store no longer owns presentation-only chart colours. Theme changes
update the mounted chart safely by changing dataset colours and options, then
calling `chart.update()` without creating a duplicate Chart instance.

## Preferences UI

The header contains one compact preferences button before the GitHub link. The
button opens a non-modal dialog-style panel with:

- Language;
- Appearance;
- System, Light, and Dark radio choices.

The panel is not an ARIA menu because it contains form controls. Escape closes
the panel and returns focus to the trigger, outside click closes it, and changes
to language or theme keep it open.

## URL And Simulation Invariants

Theme preference is intentionally absent from:

- simulator URLs;
- share URLs;
- route query parameters;
- route hash;
- Pinia tax state;
- saved simulation objects.

Resetting the simulator preserves the current theme preference. Opening old or
new saved simulations also preserves the current theme.

## Contrast Requirements

The palettes are designed for:

- normal text contrast of at least 4.5:1;
- large text contrast of at least 3:1;
- visible focus indicators;
- visible control boundaries;
- financial semantic text contrast of at least 4.5:1;
- warning text contrast of at least 4.5:1.

Cypress includes representative contrast checks for page text, result surfaces,
and warning status in both themes.

## Print

Print styles force a readable light presentation with white page background,
dark text, no dark surfaces, and hidden preference controls.

## Visual Validation Matrix

Visual checks should cover:

- 1440 x 1000;
- 768 x 1024;
- 375 x 800.

For each viewport, validate:

- English / Light;
- English / Dark;
- pt-PT / Light;
- pt-PT / Dark;
- pt-BR / Light;
- pt-BR / Dark.

Include the header, preferences panel, landing state, populated simulator,
result cards, table, dependent-age disclosure, advanced settings, chart,
calculation details, dialogs, popovers, saved simulations, About page, and
footer.

## Adding Or Modifying A Theme

1. Update semantic tokens in `src/style.scss`.
2. Expose new Tailwind aliases only when a component needs a semantic utility.
3. Keep financial semantic colours recognizable and contrast-safe.
4. Update chart token usage if a chart-specific token changes.
5. Add or adjust Vitest coverage for pure theme helpers.
6. Add or adjust Cypress coverage for user-facing behaviour.
7. Re-run build, production verification, Cypress, and visual validation.
