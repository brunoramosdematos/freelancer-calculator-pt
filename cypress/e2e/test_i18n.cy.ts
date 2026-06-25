const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";

const visitWithNavigatorLanguages = (languages: string[], path = "/#/") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      Object.defineProperty(win.navigator, "languages", {
        value: languages,
        configurable: true,
      });
      Object.defineProperty(win.navigator, "language", {
        value: languages[0],
        configurable: true,
      });
    },
  });
};

const setInputValue = (selector: string, value: string) => {
  cy.get(selector).invoke("val", value).trigger("input");
};

const switchLocale = (locale: "en" | "pt-PT") => {
  cy.get('[data-cy="locale-switcher"]').select(locale);
};

const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').then(($toggle) => {
    if ($toggle.attr("aria-expanded") === "false") {
      cy.wrap($toggle).click();
    }
  });
};

describe("internationalization", () => {
  it("uses English by default with no stored preference and en-US browser language", () => {
    visitWithNavigatorLanguages(["en-US"]);

    cy.get("html").should("have.attr", "lang", "en");
    cy.title().should(
      "eq",
      "Freelancer Calculator Portugal | IRS & Social Security",
    );
    cy.contains("span", "simulator");
    cy.contains("h4", "Freelancer Calculator Portugal 🇵🇹");
    cy.get('[data-cy="income"]').should("have.attr", "placeholder", "Income");
    cy.get('[data-cy="locale-switcher"]').should("have.value", "en");
  });

  it("uses pt-PT from browser detection without changing the URL", () => {
    visitWithNavigatorLanguages(["pt-PT"], "/#/?income=50000");
    cy.location("href").as("initialUrl");

    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.title().should(
      "eq",
      "Calculadora para Freelancers em Portugal | IRS e Segurança Social",
    );
    cy.get('meta[name="description"]')
      .invoke("attr", "content")
      .should("contain", "rendimento líquido");
    cy.contains("span", "simulador");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");
    cy.contains('[data-cy="simulation-settings"]', "Ano fiscal");
    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });
  });

  it("temporarily maps pt-BR browser preference to pt-PT", () => {
    visitWithNavigatorLanguages(["pt-BR"]);

    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.get('[data-cy="locale-switcher"]').should("have.value", "pt-PT");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");
  });

  it("switches language without reload, URL mutation, state reset, or closing disclosures", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");

    cy.get('[data-cy="final-irs-row"]')
      .invoke("text")
      .then((text) => {
        cy.wrap(text.match(/\d[\d .]*€/)?.[0]).as("irsBeforeSwitch");
      });
    cy.location("href").as("beforeUrl");
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );

    switchLocale("pt-PT");

    cy.get("@irsBeforeSwitch").then((irsBeforeSwitch) => {
      cy.get('[data-cy="final-irs-row"]').should("contain", irsBeforeSwitch);
    });
    cy.get('[data-cy="income-breakdown-chart-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.contains('[data-cy="results-summary"]', "Resultados");
    cy.get("@beforeUrl").then((beforeUrl) => {
      cy.location("href").should("eq", beforeUrl);
    });
    cy.window()
      .its("localStorage")
      .invoke("getItem", LOCALE_STORAGE_KEY)
      .should("eq", "pt-PT");
  });

  it("persists explicit locale across reloads and can switch back to English", () => {
    visitWithNavigatorLanguages(["en-US"]);

    switchLocale("pt-PT");
    cy.reload();
    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");

    switchLocale("en");
    cy.reload();
    cy.get("html").should("have.attr", "lang", "en");
    cy.contains("h4", "Freelancer Calculator Portugal 🇵🇹");
  });

  it("reset preserves the selected locale", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");

    switchLocale("pt-PT");
    cy.get('[data-cy="reset-simulation-button"]').click();

    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");
    cy.location("href").should("not.include", "locale=");
  });

  it("saved simulations restore numerical state without storing or changing locale", () => {
    const simulationName = "I18N saved state";

    visitWithNavigatorLanguages(["en-US"], "/#/?income=55000");
    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type(simulationName);
    cy.get('[data-cy="save-new-simulation-button"]').click();

    cy.window().then((win) => {
      const saved = JSON.parse(
        win.localStorage.getItem(SIMULATIONS_STORAGE_KEY) ?? "[]",
      );

      expect(saved[0].parameters).not.to.have.property("locale");
    });

    switchLocale("pt-PT");
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.get('[data-cy="income"]').should("have.value", "55 000");
    cy.contains('[data-cy="results-summary"]', "Resultados");
  });

  it("share copies the simulator URL without a locale parameter", () => {
    let copiedUrl = "";

    cy.visit("/#/?income=50000", {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, "clipboard", {
          value: {
            writeText: (value: string) => {
              copiedUrl = value;
              return Promise.resolve();
            },
          },
          configurable: true,
        });
      },
    });

    switchLocale("pt-PT");
    cy.get('[data-cy="share-simulation-button"]').click();
    cy.then(() => {
      expect(copiedUrl).to.include("income=50000");
      expect(copiedUrl).not.to.include("locale=");
      expect(copiedUrl).not.to.include(LOCALE_STORAGE_KEY);
    });
  });

  it("retains locale across simulator, simulations, and about navigation", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");

    switchLocale("pt-PT");
    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type("Navegação");
    cy.get('[data-cy="save-new-simulation-button"]').click();

    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("h4", "Simulações guardadas");
    cy.contains("a", "sobre").click();
    cy.contains("h1", "Calculadora para Freelancers em Portugal");
    cy.contains("a", "ir para o simulador").click();
    cy.get("html").should("have.attr", "lang", "pt-PT");
  });

  it("localizes dependent age groups while preserving disclosure behavior and tax result", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");
    switchLocale("pt-PT");

    cy.get('[data-cy="number-of-dependents"] [data-cy="counter-increase"]')
      .click()
      .click()
      .click();
    cy.get('[data-cy="dependent-age-groups-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.contains('[data-cy="dependent-age-groups-toggle"]', "Faixas etárias");
    cy.get(
      '[data-cy="dependents-aged-3-or-under"] [data-cy="counter-increase"]',
    ).click();
    cy.get(
      '[data-cy="dependents-aged-4-to-6"] [data-cy="counter-increase"]',
    ).click();
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "1 até 3 anos · 1 dos 4 aos 6 anos · 1 com 7 anos ou mais",
    );
    cy.get('[data-cy="dependents-aged-7-or-over"]')
      .should("have.attr", "aria-labelledby", "dependents-aged-7-or-over-label")
      .and(
        "have.attr",
        "aria-describedby",
        "dependents-aged-7-or-over-derived-label",
      );
    cy.get('[data-cy="calculation-details-toggle"]').click();
    cy.get('[data-cy="irs-calculation-details-toggle"]').click();
    cy.get('[data-cy="irs-final-detail-row"] dd')
      .invoke("text")
      .then((finalIrsText) => {
        cy.wrap(finalIrsText.trim()).as("finalIrsText");
      });
    cy.get('[data-cy="dependent-age-groups-toggle"]').click();
    cy.get("@finalIrsText").then((finalIrsText) => {
      cy.get('[data-cy="irs-final-detail-row"]').should(
        "contain",
        finalIrsText,
      );
    });
  });

  it("shows representative Portuguese translations for advanced settings, results, details and footer", () => {
    visitWithNavigatorLanguages(
      ["pt-PT"],
      "/#/?income=11000&incomeFrequency=month&currentTaxRankYear=2026",
    );

    openAdvancedTaxSettings();
    cy.contains(
      '[data-cy="advanced-tax-settings-toggle"]',
      "Opções fiscais avançadas",
    );
    cy.contains(
      '[data-cy="advanced-tax-settings-panel"]',
      "Ajuste da base da Segurança Social",
    );
    cy.contains('[data-cy="results-summary"]', "Total de impostos");
    cy.get('[data-cy="calculation-details-toggle"]').click();
    cy.contains('[data-cy="calculation-details-panel"]', "Cálculo do IRS");
    cy.contains(
      '[data-cy="calculation-details-panel"]',
      "Cálculo da Segurança Social",
    );
    cy.contains('[data-cy="footer"]', "Estimativa indicativa");
  });

  it("has an accessible locale switcher and reports no Vue I18n missing-key warnings", () => {
    const i18nWarnings: string[] = [];

    cy.visit("/#/?income=50000", {
      onBeforeLoad(win) {
        cy.stub(win.console, "warn").callsFake((...args) => {
          const message = args.join(" ");

          if (
            message.includes("intlify") ||
            message.includes("Not found") ||
            message.includes("Fall back to")
          ) {
            i18nWarnings.push(message);
          }
        });
      },
    });

    cy.get('label[for="locale-switcher"]').should("contain", "Language");
    cy.get('[data-cy="locale-switcher"]').focus().select("pt-PT");
    cy.get('label[for="locale-switcher"]').should("contain", "Idioma");
    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.then(() => {
      expect(i18nWarnings).to.deep.equal([]);
    });
  });
});
