const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";

type Locale = "en" | "pt-PT" | "pt-BR";

const visitWithLocale = (locale: Locale, path = "/#/?income=60000") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    },
  });
};

const openPreferences = () => {
  cy.get('[data-cy="preferences-toggle"]').then(($button) => {
    if ($button.attr("aria-expanded") === "false") {
      cy.wrap($button).click();
    }
  });
};

const closePreferences = () => {
  cy.get('[data-cy="preferences-toggle"]').then(($button) => {
    if ($button.attr("aria-expanded") === "true") {
      cy.wrap($button).click();
    }
  });
};

const switchLocale = (locale: Locale) => {
  openPreferences();
  cy.get('[data-cy="locale-switcher"]').select(locale);
  closePreferences();
};

const setThemePreference = (preference: "system" | "light" | "dark") => {
  openPreferences();
  cy.get(`[data-cy="theme-${preference}"]`).check();
  closePreferences();
};

const selectTaxYear = (year: number) => {
  cy.get('[data-cy="tax-rank-years-dropdown"] > input').click();
  cy.get('[data-cy="tax-rank-years-dropdown"]')
    .contains("button", String(year))
    .click();
};

const openTaxDataDetails = () => {
  cy.get('[data-cy="tax-data-status-details-toggle"]').click();
  cy.get('[data-cy="tax-data-status-details"]').should("be.visible");
};

const saveSimulation = (simulationName: string) => {
  cy.get('[data-cy="save-simulation-button"]').click();
  cy.get('[data-cy="simulation-name"]').type(simulationName);
  cy.get('[data-cy="save-new-simulation-button"]').click();
};

const expectNoHorizontalOverflow = () => {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth).to.be.lte(
      document.documentElement.clientWidth + 1,
    );
  });
};

describe("tax data confidence", () => {
  it("defaults to the current supported tax year and shows latest status", () => {
    cy.viewport(375, 800);
    visitWithLocale("en");

    cy.get('[data-cy="simulation-settings"]').within(() => {
      cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
        "have.value",
        "2026",
      );
      cy.get('[data-cy="tax-data-status"]').should("be.visible");
      cy.get('[data-cy="tax-data-status-summary"]').should(
        "contain",
        "latest supported",
      );
    });

    openTaxDataDetails();
    cy.get('[data-cy="tax-data-status-details"]')
      .should("contain", "Selected tax year")
      .and("contain", "2026")
      .and("contain", "Latest supported year")
      .and("contain", "2026")
      .and("contain", "Supported tax years");
    expectNoHorizontalOverflow();
  });

  it("reports the latest supported year and exposes source references", () => {
    visitWithLocale("en");
    selectTaxYear(2026);

    cy.get('[data-cy="tax-data-status-summary"]').should(
      "contain",
      "latest supported",
    );
    openTaxDataDetails();
    cy.get('[data-cy="tax-data-source-links"] a')
      .its("length")
      .should("be.gte", 4);
    cy.get('[data-cy="tax-data-source-links"] a').each(($link) => {
      expect($link.attr("href")).to.match(/^https:\/\//);
    });
    cy.get('[data-cy="tax-data-status-details"]').should("contain", "estimate");
  });

  it("reports historical supported years without changing calculations", () => {
    visitWithLocale("en", "/#/?income=60000&currentTaxRankYear=2024");

    cy.get('[data-cy="tax-data-status-summary"]').should(
      "contain",
      "historical supported",
    );
    cy.get('[data-cy="final-irs-row"]').should("contain", "€12,576.22");
  });

  it("localizes status copy in en, pt-PT and pt-BR", () => {
    visitWithLocale("en", "/#/?income=60000&currentTaxRankYear=2026");

    cy.get('[data-cy="tax-data-status-summary"]').should(
      "contain",
      "latest supported",
    );

    switchLocale("pt-PT");
    cy.get('[data-cy="tax-data-status-summary"]')
      .should("contain", "ano mais recente suportado")
      .and("contain", "revisto em");

    switchLocale("pt-BR");
    cy.get('[data-cy="tax-data-status-summary"]')
      .should("contain", "ano mais recente suportado")
      .and("contain", "revisado em");
  });

  it("keeps the status readable in Dark theme", () => {
    visitWithLocale("en", "/#/?income=60000&currentTaxRankYear=2026");
    setThemePreference("dark");

    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.get('[data-cy="tax-data-status"]').should("be.visible");
    cy.get('[data-cy="tax-data-status-summary"]').should(
      "contain",
      "latest supported",
    );
    openTaxDataDetails();
    cy.get('[data-cy="tax-data-source-links"] a').first().focus();
    cy.focused().should("have.attr", "href").and("include", "https://");
    expectNoHorizontalOverflow();
  });

  it("shows localized tax data coverage on the About page", () => {
    visitWithLocale("en", "/#/about");

    cy.get('[data-cy="tax-data-coverage"]')
      .should("contain", "Tax data coverage")
      .and("contain", "2026")
      .and("contain", "Autoridade Tributária e Aduaneira");

    switchLocale("pt-PT");
    cy.get('[data-cy="tax-data-coverage"]')
      .should("contain", "Cobertura dos dados fiscais")
      .and("contain", "O resultado continua a ser uma estimativa");

    switchLocale("pt-BR");
    cy.get('[data-cy="tax-data-coverage"]')
      .should("contain", "Cobertura dos dados fiscais")
      .and("contain", "O resultado continua sendo uma estimativa");
  });

  it("keeps URL, locale, theme and saved simulation formats unchanged", () => {
    const simulationName = "Tax data invariant";

    visitWithLocale("en", "/#/?income=60000&currentTaxRankYear=2024");
    cy.location("href").as("initialUrl");

    openTaxDataDetails();
    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });
    cy.get('[data-cy="tax-data-status-details-toggle"]').click();
    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });

    switchLocale("pt-BR");
    setThemePreference("dark");
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2024",
    );
    cy.location("href").should("include", "currentTaxRankYear=2024");
    cy.location("href").should("not.include", "taxData");
    cy.location("href").should("not.include", "provenance");

    saveSimulation(simulationName);
    cy.window().then((win) => {
      const saved = JSON.parse(
        win.localStorage.getItem(SIMULATIONS_STORAGE_KEY) ?? "[]",
      );
      const savedParameters = saved[0].parameters;

      expect(savedParameters.currentTaxRankYear).to.eq("2024");
      expect(savedParameters).not.to.have.property("taxData");
      expect(savedParameters).not.to.have.property("taxDataCoverage");
      expect(savedParameters).not.to.have.property("provenance");
      expect(saved[0]).not.to.have.property("taxData");
      expect(saved[0]).not.to.have.property("provenance");
    });

    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2024",
    );
    cy.get('[data-cy="tax-data-status-summary"]').should(
      "contain",
      "ano histórico suportado",
    );
  });
});

export {};
