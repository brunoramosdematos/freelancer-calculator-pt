const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";

type Locale = "en" | "pt-PT" | "pt-BR";
type Theme = "light" | "dark" | "system";

const visitWithPreferences = (
  path: string,
  locale: Locale = "en",
  theme: Theme = "light",
  prefersDark = false,
) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      win.localStorage.setItem(THEME_STORAGE_KEY, theme);
      Object.defineProperty(win, "matchMedia", {
        writable: true,
        value: (query: string) => ({
          matches: query.includes("prefers-color-scheme: dark") && prefersDark,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }),
      });
    },
  });
};

const openComparison = () => {
  cy.get('[data-cy="scenario-comparison-panel"]').then(($panel) => {
    if (!$panel.is(":visible")) {
      cy.get('[data-cy="scenario-comparison-toggle"]')
        .should("be.visible")
        .click();
    }
  });
  cy.get('[data-cy="scenario-comparison-panel"]').should("be.visible");
};

const addPreset = (preset: string) => {
  cy.get(`[data-cy="scenario-add-preset"][data-scenario-preset="${preset}"]`)
    .should("be.visible")
    .and("not.be.disabled")
    .click();
};

const visibleScenarioRows = () =>
  cy.get(
    '[data-cy="scenario-current-row"]:visible, [data-cy="scenario-comparison-row"]:visible',
  );

describe("scenario comparison", () => {
  it("does not render without income", () => {
    visitWithPreferences("/");

    cy.get('[data-cy="scenario-comparison"]').should("not.exist");
  });

  it("opens from the results area with explanation and preset buttons", () => {
    visitWithPreferences("/#/?income=60000&currentTaxRankYear=2024");

    cy.get('[data-cy="scenario-comparison"]').should("be.visible");
    cy.get('[data-cy="scenario-comparison-panel"]').should("not.be.visible");
    openComparison();
    cy.contains('[data-cy="scenario-comparison-panel"]', "Add up to three");
    cy.get('[data-cy="scenario-add-preset"]').should("have.length", 4);
    cy.get('[data-scenario-preset="individual"]').should("be.disabled");
    cy.contains('[data-scenario-preset="individual"]', "Already current");
  });

  it("compares individual current against joint without mutating the active simulator or URL", () => {
    visitWithPreferences("/#/?income=60000&currentTaxRankYear=2024");
    openComparison();

    cy.location("href").then((hrefBefore) => {
      addPreset("jointSingleIncome");

      cy.location("href").should("eq", hrefBefore);
    });

    visibleScenarioRows().should("have.length", 2);
    cy.get('[data-cy="scenario-current-row"]:visible').should(
      "contain",
      "Current scenario",
    );
    cy.get('[data-scenario-id="jointSingleIncome"]:visible')
      .should("contain", "joint")
      .find('[data-cy="scenario-diff-net-income"]')
      .should("not.contain", "Same as current");
    cy.get('[data-cy="assessment-scenario-individual"]').should("be.checked");
  });

  it("compares joint current against individual and keeps the joint control selected", () => {
    visitWithPreferences(
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income",
    );
    openComparison();
    addPreset("individual");

    cy.get('[data-scenario-id="individual"]:visible')
      .should("contain", "individual")
      .find('[data-cy="scenario-diff-net-income"]')
      .should("be.visible");
    cy.get('[data-cy="assessment-scenario-joint-single-income"]').should(
      "be.checked",
    );
  });

  it("compares SS -20% without changing the active Social Security adjustment", () => {
    visitWithPreferences("/#/?income=60000&currentTaxRankYear=2024");
    openComparison();

    cy.location("href").then((hrefBefore) => {
      addPreset("socialSecurityMinus20");

      cy.location("href").should("eq", hrefBefore);
    });

    cy.get('[data-scenario-id="socialSecurityMinus20"]:visible')
      .should("contain", "SS -20%")
      .find('[data-cy="scenario-diff-net-income"]')
      .should("be.visible");
    cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
    cy.get('[data-cy="ss-discount"]').should("contain", "0%");
  });

  it("compares no dependents without changing the active dependent controls", () => {
    visitWithPreferences(
      "/#/?income=60000&currentTaxRankYear=2024&numberOfDependents=2&dependentsAged3OrUnder=1&dependentsAged4To6=1",
    );
    openComparison();
    addPreset("noDependents");

    cy.get('[data-scenario-id="noDependents"]:visible')
      .should("contain", "no dependents")
      .find('[data-cy="scenario-diff-net-income"]')
      .should("be.visible");
    cy.get('[data-cy="number-of-dependents"] input').should("have.value", "2");
    cy.get('[data-cy="dependents-aged-3-or-under"] input').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="dependents-aged-4-to-6"] input').should(
      "have.value",
      "1",
    );
  });

  it("removes alternatives and clears all while preserving the current row", () => {
    visitWithPreferences("/#/?income=60000&currentTaxRankYear=2024");
    openComparison();
    addPreset("jointSingleIncome");
    addPreset("socialSecurityMinus20");

    visibleScenarioRows().should("have.length", 3);
    cy.get('[data-scenario-id="jointSingleIncome"]:visible')
      .contains("button", "Remove")
      .click();
    cy.get('[data-scenario-id="jointSingleIncome"]:visible').should(
      "not.exist",
    );
    visibleScenarioRows().should("have.length", 2);

    cy.get('[data-cy="scenario-clear-all"]').click();
    cy.get('[data-cy="scenario-current-row"]:visible').should("be.visible");
    cy.get('[data-cy="scenario-comparison-row"]:visible').should("not.exist");
    cy.contains('[data-cy="scenario-comparison-panel"]', "No alternatives");
  });

  it("covers localized labels and Dark theme readability", () => {
    visitWithPreferences(
      "/#/?income=60000&currentTaxRankYear=2024",
      "pt-PT",
      "dark",
    );
    openComparison();
    addPreset("jointSingleIncome");

    cy.document().its("documentElement.dataset.theme").should("eq", "dark");
    cy.contains('[data-cy="scenario-comparison"]', "Comparar cenários");
    cy.contains('[data-cy="scenario-comparison-panel"]', "rendimento líquido");
    cy.contains('[data-cy="scenario-comparison-panel"]', "Melhor rendimento");
  });

  it("covers pt-BR labels in System theme resolved to Dark", () => {
    visitWithPreferences(
      "/#/?income=60000&currentTaxRankYear=2024",
      "pt-BR",
      "system",
      true,
    );
    openComparison();

    cy.document().its("documentElement.dataset.theme").should("eq", "dark");
    cy.get('[data-cy="preferences-toggle"]').click();
    cy.get('[data-cy="locale-switcher"]').should("have.value", "pt-BR");
    cy.contains('[data-cy="results-summary"]', "Renda líquida");
  });

  it("is usable on mobile without horizontal overflow", () => {
    cy.viewport(375, 800);
    visitWithPreferences(
      "/#/?income=60000&currentTaxRankYear=2024",
      "pt-BR",
      "dark",
    );
    openComparison();
    addPreset("jointSingleIncome");
    addPreset("socialSecurityMinus20");

    cy.get('[data-cy="scenario-comparison-row"]:visible').should(
      "have.length",
      2,
    );
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.lte(
        doc.documentElement.clientWidth + 1,
      );
    });
  });

  it("does not include comparison state in saved simulations or report export", () => {
    visitWithPreferences("/#/?income=60000&currentTaxRankYear=2024");
    openComparison();
    addPreset("jointSingleIncome");

    cy.get('[data-cy="export-report-button"]').click();
    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
    cy.get('[data-cy="printable-report"]').should(
      "not.contain",
      "Compare scenarios",
    );
    cy.get('[data-cy="report-close-button"]').click();

    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type("Comparison invariant");
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.window().then((win) => {
      const saved = JSON.parse(
        win.localStorage.getItem(SIMULATIONS_STORAGE_KEY) ?? "[]",
      );

      expect(saved[0].parameters).not.to.have.property("scenarioComparison");
      expect(saved[0].parameters).not.to.have.property("scenarios");
      expect(saved[0].parameters).not.to.have.property("comparison");
    });
  });
});
