import "cypress-axe";
import type { Result } from "axe-core";

const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";
const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";
const POPULATED_SCENARIO =
  "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income&numberOfDependents=2&dependentsAged3OrUnder=1&dependentsAged4To6=1";

type Scheme = "light" | "dark";
type ThemePreference = "system" | "light" | "dark";
type Locale = "en" | "pt-PT" | "pt-BR";

type VisitOptions = {
  locale: Locale;
  theme: ThemePreference;
  systemScheme?: Scheme;
  viewport?: { width: number; height: number };
};

const installThemeMediaStub = (win: Cypress.AUTWindow, scheme: Scheme) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const legacyListeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = scheme === "dark";

  const mediaQuery = {
    media: PREFERS_DARK_QUERY,
    get matches() {
      return matches;
    },
    onchange: null,
    addEventListener: (_event: "change", listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_event: "change", listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: (listener) => {
      legacyListeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeListener: (listener) => {
      legacyListeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    dispatch(nextScheme: Scheme) {
      matches = nextScheme === "dark";
      const event = {
        matches,
        media: PREFERS_DARK_QUERY,
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
      legacyListeners.forEach((listener) => listener(event));
      this.onchange?.(event);
    },
  };

  Object.defineProperty(win, "matchMedia", {
    configurable: true,
    value: (query: string) =>
      query === PREFERS_DARK_QUERY
        ? mediaQuery
        : ({ matches: false, media: query } as MediaQueryList),
  });
};

const visitForA11y = (
  path: string,
  { locale, theme, systemScheme = "light", viewport }: VisitOptions,
) => {
  if (viewport) {
    cy.viewport(viewport.width, viewport.height);
  }

  cy.visit(path, {
    onBeforeLoad(win) {
      installThemeMediaStub(win, systemScheme);
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      win.localStorage.setItem(THEME_STORAGE_KEY, theme);
    },
  });
  cy.injectAxe();
};

const checkA11y = (label: string) => {
  cy.checkA11y(undefined, undefined, (violations: Result[]) => {
    if (violations.length === 0) {
      return;
    }

    const details = violations
      .map((violation) => {
        const nodes = violation.nodes
          .map(
            (node) =>
              `${node.target.join(", ")}${
                node.failureSummary ? ` (${node.failureSummary})` : ""
              }`,
          )
          .join(" | ");
        return `${violation.id} (${violation.impact ?? "unknown"}): ${nodes}`;
      })
      .join("\n");

    throw new Error(`${label} accessibility violations:\n${details}`);
  });
};

const openDisclosure = (selector: string) => {
  cy.get(selector).then(($toggle) => {
    if ($toggle.attr("aria-expanded") === "false") {
      cy.wrap($toggle).click();
    }
  });
};

const openPreferences = () => {
  openDisclosure('[data-cy="preferences-toggle"]');
};

const saveCurrentSimulation = (name: string) => {
  cy.get('[data-cy="save-simulation-button"]').click();
  cy.get('[data-cy="simulation-name"]').type(name);
  cy.get('[data-cy="save-new-simulation-button"]').click();
  cy.get('[data-cy="simulations-menu"]').should("exist");
};

describe("automated accessibility coverage", () => {
  it("checks the landing page and preferences in English Light theme", () => {
    visitForA11y("/#/", { locale: "en", theme: "light" });
    cy.get('[data-cy="income-form-shell"]').should("be.visible");
    checkA11y("landing page en light");

    openPreferences();
    cy.get('[data-cy="preferences-panel"]').should("be.visible");
    checkA11y("preferences panel en light");
  });

  it("checks populated simulator surfaces in pt-PT Dark theme", () => {
    visitForA11y(POPULATED_SCENARIO, { locale: "pt-PT", theme: "dark" });
    cy.get('[data-cy="results-summary"]').should("be.visible");

    openDisclosure('[data-cy="dependent-age-groups-toggle"]');
    openDisclosure('[data-cy="advanced-tax-settings-toggle"]');
    openDisclosure('[data-cy="income-breakdown-chart-toggle"]');
    openDisclosure('[data-cy="calculation-details-toggle"]');
    openDisclosure('[data-cy="irs-calculation-details-toggle"]');
    openDisclosure('[data-cy="social-security-calculation-details-toggle"]');
    openDisclosure('[data-cy="deductions-assumptions-details-toggle"]');

    cy.get('[data-cy="simulation-settings"] button[aria-haspopup="dialog"]')
      .first()
      .click();
    checkA11y("expanded populated simulator pt-PT dark with info popover");
    cy.get("body").type("{esc}");

    cy.get('[data-cy="view-tax-ranks-button"]').click();
    cy.get("#tax-ranks-dialog-title").should("be.visible");
    checkA11y("IRS tax-rank dialog pt-PT dark");
    cy.get('button[aria-label="Fechar janela"]').click();

    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get("#save-simulation-dialog-title").should("be.visible");
    // The save dialog is wrapped in a Vue opacity transition; run axe after it settles.
    cy.wait(350);
    checkA11y("save simulation dialog pt-PT dark");
    cy.get('button[aria-label="Fechar janela"]').click();
  });

  it("checks System theme resolved to Dark in pt-BR", () => {
    visitForA11y(POPULATED_SCENARIO, {
      locale: "pt-BR",
      theme: "system",
      systemScheme: "dark",
    });
    cy.get("html").should("have.attr", "data-theme", "dark");
    openPreferences();
    cy.get('[data-cy="theme-system"]').should("be.checked");
    cy.get('[data-cy="locale-switcher"]').should("have.value", "pt-BR");
    checkA11y("pt-BR system theme resolved dark");
  });

  it("checks mobile populated simulator and saved simulations in pt-BR Dark theme", () => {
    visitForA11y(POPULATED_SCENARIO, {
      locale: "pt-BR",
      theme: "dark",
      viewport: { width: 375, height: 800 },
    });
    openDisclosure('[data-cy="dependent-age-groups-toggle"]');
    openDisclosure('[data-cy="advanced-tax-settings-toggle"]');
    openPreferences();
    checkA11y("mobile pt-BR dark simulator");
    cy.get('[data-cy="preferences-toggle"]').click();

    saveCurrentSimulation("A11y mobile saved simulation");
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("A11y mobile saved simulation").should("be.visible");
    checkA11y("mobile pt-BR dark saved simulations page");
  });

  it("checks the saved simulations and About routes", () => {
    visitForA11y("/#/simulations", {
      locale: "en",
      theme: "light",
    });
    cy.window().then((win) => {
      win.localStorage.setItem(
        SIMULATIONS_STORAGE_KEY,
        JSON.stringify([
          {
            id: "a11y-saved-simulation",
            simulationName: "Accessibility saved state",
            createdAt: "2026-06-26T00:00:00.000Z",
            parameters: {
              income: "60000",
              currentTaxRankYear: "2024",
            },
          },
        ]),
      );
    });
    cy.reload();
    cy.injectAxe();
    cy.contains("Accessibility saved state").should("be.visible");
    checkA11y("saved simulations route");

    cy.visit("/#/about");
    cy.injectAxe();
    cy.contains("h1", "Freelancer Calculator Portugal").should("be.visible");
    checkA11y("about route");
  });
});
