# Accessibility

This project treats accessibility as a release quality gate. Automated checks
are intended to prevent regressions across the calculator, saved simulations,
preferences, dialogs and informational content, but they do not replace manual
review or constitute WCAG certification.

## Goals

- Keep the calculator usable with keyboard, screen reader and zoom workflows.
- Preserve accessible behavior across English, Portuguese (Portugal) and
  Portuguese (Brazil).
- Preserve accessible behavior across System, Light and Dark themes.
- Keep form controls, dialogs, popovers, disclosures and result regions
  programmatically named.
- Catch color-token regressions in both Light and Dark themes.

## Automated Coverage

Accessibility checks run through Cypress with `axe-core` and `cypress-axe`:

```bash
npm run cy:a11y
```

The dedicated accessibility spec covers:

- landing page;
- populated simulator with visible results;
- preferences panel;
- Light theme;
- Dark theme;
- System theme resolved to dark;
- English;
- Portuguese (Portugal);
- Portuguese (Brazil);
- dependent age-group disclosure expanded;
- advanced tax settings expanded;
- calculation details expanded;
- IRS tax-rank dialog;
- save simulation dialog;
- InfoButton popover;
- saved simulations page;
- About page;
- mobile viewport around 375 x 800.

The test suite does not disable axe rules globally. If a genuine false positive
is ever found, the exclusion must be scoped to the smallest selector, explained
next to the assertion, and must not suppress color contrast, landmarks, ARIA,
form labels or keyboard-related rules globally.

## Manual Checks Still Required

Automated axe checks cannot fully validate:

- screen reader phrasing and announcement order;
- real keyboard-only task completion speed;
- cognitive load of dense tax explanations;
- zoom and reflow beyond the representative Cypress viewport;
- browser and assistive technology combinations not covered by CI;
- localized wording quality.

Before major releases, manually check the main calculator flow, saved
simulation flow, preferences, dialogs and disclosures with keyboard navigation
and at least one screen reader/browser combination.

## Keyboard And Focus Expectations

- All interactive controls must be reachable by keyboard.
- Buttons, links, form fields, dialogs and disclosure toggles must have visible
  focus indicators.
- Opening a dialog or popover must not hide meaningful content from assistive
  technology with `aria-hidden`.
- Dismiss controls must be named and keyboard reachable.
- Escape should close dialogs and popovers where the component already supports
  that behavior.

## Dialogs And Popovers

Dialogs should expose:

- `role="dialog"` where a native dialog element is not used;
- `aria-modal="true"` for modal overlays;
- `aria-labelledby` pointing to the visible dialog title;
- named close buttons.

Popovers must have named trigger buttons and must not rely on color alone to
communicate meaning.

## Forms

Every input must have an accessible name through a visible `<label>`,
`aria-labelledby` or a deliberate `aria-label`. Numeric controls that expose
increase and decrease buttons must give each button a specific accessible name.

## Color Contrast

The Cypress theme spec includes token-level contrast coverage for:

- page text;
- muted text;
- result card text;
- net income;
- IRS;
- Social Security;
- warning status;
- input text;
- selected controls;
- preferences focus ring.

Coverage runs in both Light and Dark themes. Axe also checks contrast in the
representative UI states, including dialogs and populated results.

## Reduced Motion

The app should avoid motion that is essential to understanding the calculator.
Transitions may be used for polish, but accessibility checks should run after
transitions settle when a component is intentionally animated.

## Charts

Charts are treated as visual summaries of values already available in text.
The surrounding result cards and calculation details remain the authoritative
accessible representation of the data.

## Handling Violations

When `npm run cy:a11y` fails:

1. Reproduce the failure locally.
2. Prefer a semantic or labeling fix over an axe exclusion.
3. Keep fiscal formulas, URL state, saved simulation state, locale behavior and
   theme behavior unchanged.
4. Add or update tests when the fix protects a reusable component.
5. Document any unavoidable scoped exclusion in the test itself.
