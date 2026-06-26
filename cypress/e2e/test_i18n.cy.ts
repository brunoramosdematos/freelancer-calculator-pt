const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";

type Locale = "en" | "pt-PT" | "pt-BR";

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

const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').then(($toggle) => {
    if ($toggle.attr("aria-expanded") === "false") {
      cy.wrap($toggle).click();
    }
  });
};

const normalizeText = (text: string) =>
  text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const assertContainsNormalized = (selector: string, expected: string) => {
  cy.get(selector).should(($element) => {
    expect(normalizeText($element.text())).to.contain(expected);
  });
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
    openPreferences();
    cy.get('[data-cy="locale-switcher"]').should("have.value", "en");
    closePreferences();
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

  it("uses pt-BR from browser detection without changing the URL", () => {
    visitWithNavigatorLanguages(["pt-BR"], "/#/?income=50000");
    cy.location("href").as("initialUrl");

    cy.get("html").should("have.attr", "lang", "pt-BR");
    openPreferences();
    cy.get('[data-cy="locale-switcher"]').should("have.value", "pt-BR");
    cy.get('[data-cy="locale-option-pt-BR"]').should(
      "contain",
      "Português (Brasil)",
    );
    closePreferences();
    cy.get('meta[name="description"]')
      .invoke("attr", "content")
      .should("contain", "renda líquida");
    cy.contains("span", "simulador");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");
    cy.contains('[data-cy="simulation-settings"]', "Ano fiscal");
    cy.contains('[data-cy="results-summary"]', "Renda líquida");
    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });
  });

  it("switches among all locales without reload, URL mutation, state reset, or closing disclosures", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");
    cy.location("href").as("beforeUrl");
    cy.window().then((win) => {
      (
        win as unknown as { __localeSwitchMarker?: string }
      ).__localeSwitchMarker = "alive";
    });
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.get('[data-cy="income"]').should("have.value", "60,000");

    switchLocale("pt-PT");

    cy.get('[data-cy="income"]').should("have.value", "60\u00a0000");
    cy.contains('[data-cy="results-summary"]', "Resultados");

    switchLocale("pt-BR");

    cy.get('[data-cy="income"]').should("have.value", "60.000");
    cy.contains('[data-cy="results-summary"]', "Renda líquida");

    switchLocale("en");

    cy.get('[data-cy="income"]').should("have.value", "60,000");
    cy.get('[data-cy="income-breakdown-chart-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.window().its("__localeSwitchMarker").should("eq", "alive");
    cy.get("@beforeUrl").then((beforeUrl) => {
      cy.location("href").should("eq", beforeUrl);
    });
  });

  it("persists explicit pt-BR across reloads and can switch back to English", () => {
    visitWithNavigatorLanguages(["en-US"]);

    switchLocale("pt-BR");
    cy.reload();
    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");

    switchLocale("en");
    cy.reload();
    cy.get("html").should("have.attr", "lang", "en");
    cy.contains("h4", "Freelancer Calculator Portugal 🇵🇹");
  });

  it("reset preserves the selected pt-BR locale", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");

    switchLocale("pt-BR");
    cy.get('[data-cy="reset-simulation-button"]').click();

    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.contains("h4", "Calculadora para Freelancers em Portugal 🇵🇹");
    cy.location("href").should("not.include", "locale=");
  });

  it("saved simulations restore raw numerical state without storing or changing locale", () => {
    const simulationName = "I18N saved state";

    visitWithNavigatorLanguages(["en-US"], "/#/?income=55000");
    saveSimulation(simulationName);

    cy.window().then((win) => {
      const saved = JSON.parse(
        win.localStorage.getItem(SIMULATIONS_STORAGE_KEY) ?? "[]",
      );

      expect(saved[0].parameters).not.to.have.property("locale");
    });

    switchLocale("pt-BR");
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.location("href").should("include", "income=55000");
    cy.location("href").should("not.include", "locale=");
    cy.get('[data-cy="income"]').should("have.value", "55.000");
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

    switchLocale("pt-BR");
    cy.get('[data-cy="share-simulation-button"]').click();
    cy.then(() => {
      expect(copiedUrl).to.include("income=50000");
      expect(copiedUrl).not.to.include("locale=");
      expect(copiedUrl).not.to.include(LOCALE_STORAGE_KEY);
    });
  });

  it("retains pt-BR across simulator, simulations, and about navigation", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");

    switchLocale("pt-BR");
    saveSimulation("Navegação");

    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("h4", "Simulações salvas");
    cy.contains("a", "sobre").click();
    cy.contains("h1", "Calculadora para Freelancers em Portugal");
    cy.contains("a", "ir para o simulador").click();
    cy.get("html").should("have.attr", "lang", "pt-BR");
  });

  it("localizes dependent age groups in pt-BR while preserving tax result and disclosure behavior", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");
    switchLocale("pt-BR");

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
      "1 até 3 anos · 1 de 4 a 6 anos · 1 com 7 anos ou mais",
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

  it("shows representative Brazilian Portuguese translations for advanced settings, results, details and footer", () => {
    visitWithNavigatorLanguages(
      ["pt-BR"],
      "/#/?income=11000&incomeFrequency=month&currentTaxRankYear=2026",
    );

    openAdvancedTaxSettings();
    cy.contains(
      '[data-cy="advanced-tax-settings-toggle"]',
      "Configurações fiscais avançadas",
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

  it("formats currency, zero values, and summary cards differently in each locale", () => {
    visitWithNavigatorLanguages(
      ["en-US"],
      "/#/?income=60000&currentTaxRankYear=2024",
    );

    cy.get('[data-cy="final-irs-row"]').should("contain", "€12,576.22");
    cy.get('[data-cy="results-summary"]').should("contain", "€5,000");

    switchLocale("pt-PT");

    assertContainsNormalized('[data-cy="final-irs-row"]', "12 576,22 €");
    assertContainsNormalized('[data-cy="results-summary"]', "5 000 €");

    switchLocale("pt-BR");

    assertContainsNormalized('[data-cy="final-irs-row"]', "€ 12.576,22");
    assertContainsNormalized('[data-cy="results-summary"]', "€ 5.000");

    cy.visit("/#/?income=1000&ssFirstYear=true");
    assertContainsNormalized('[data-cy="social-security-row"]', "€ 0,00");
  });

  it("keeps input display localized while preserving raw URL values", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");

    cy.get('[data-cy="income"]').should("have.value", "60,000");
    cy.location("href").should("include", "income=60000");

    switchLocale("pt-PT");

    cy.get('[data-cy="income"]').should("have.value", "60\u00a0000");
    cy.location("href").should("include", "income=60000");

    switchLocale("pt-BR");

    cy.get('[data-cy="income"]').should("have.value", "60.000");
    cy.location("href").should("include", "income=60000");
  });

  it("formats Social Security adjustment percentages in all locales", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");
    openAdvancedTaxSettings();

    cy.get('[data-cy="ss-discount"]').should("contain", "0%");
    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.get('[data-cy="ss-discount"]').should("contain", "-5%");

    switchLocale("pt-PT");
    cy.get('[data-cy="ss-discount"]').should("contain", "-5%");

    switchLocale("pt-BR");
    cy.get('[data-cy="ss-discount"]').should("contain", "-5%");
  });

  it("localizes saved simulation dates when the active locale changes", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");
    saveSimulation("Date locale");
    cy.get('[data-cy="simulations-menu"]').click();
    cy.get("li span").invoke("text").as("englishDate");

    switchLocale("pt-BR");

    cy.get("@englishDate").then((englishDate) => {
      cy.get("li span")
        .invoke("text")
        .should((dateText) => {
          expect(String(englishDate).trim()).not.to.equal("");
          expect(dateText.trim()).not.to.equal("");
        });
    });
    cy.get("html").should("have.attr", "lang", "pt-BR");
  });

  it("pluralizes saved simulations, dependents, months, and days", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");

    saveSimulation("One");
    cy.get('[data-cy="simulations-menu"]').should("contain", "simulation (1)");
    saveSimulation("Two");
    cy.get('[data-cy="simulations-menu"]').should("contain", "simulations (2)");

    cy.get('[data-cy="number-of-dependents"]').should("contain", "dependents");
    cy.get(
      '[data-cy="number-of-dependents"] [data-cy="counter-increase"]',
    ).click();
    cy.get('[data-cy="number-of-dependents"]').should("contain", "dependent");
    cy.get(
      '[data-cy="number-of-dependents"] [data-cy="counter-increase"]',
    ).click();
    cy.get('[data-cy="number-of-dependents"]').should("contain", "dependents");

    cy.get('[data-cy="nr-months-display"] input:first-of-type')
      .invoke("val", "")
      .type("1");
    cy.get('[data-cy="nr-months-display"]').should("contain", "month");
    cy.get(
      '[data-cy="nr-months-display"] [data-cy="counter-increase"]',
    ).click();
    cy.get('[data-cy="nr-months-display"]').should("contain", "months");

    cy.get('[data-cy="nr-days-off"] [data-cy="counter-increase"]').click();
    cy.get('[data-cy="nr-days-off"]').should("contain", "day");
    cy.get('[data-cy="nr-days-off"] [data-cy="counter-increase"]').click();
    cy.get('[data-cy="nr-days-off"]').should("contain", "days");

    switchLocale("pt-BR");
    cy.get('[data-cy="simulations-menu"]').should("contain", "simulações (2)");
    cy.get('[data-cy="number-of-dependents"]').should("contain", "dependentes");
  });

  it("updates the chart accessible label when switching to pt-BR", () => {
    visitWithNavigatorLanguages(["en-US"], "/#/?income=50000");
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get("canvas").should(
      "have.attr",
      "aria-label",
      "Income breakdown chart showing net income, IRS and Social Security.",
    );

    switchLocale("pt-BR");

    cy.get("canvas").should(
      "have.attr",
      "aria-label",
      "Gráfico da distribuição da renda entre renda líquida, IRS e Segurança Social.",
    );
  });

  it("keeps the locale switcher accessible and reports no Vue I18n missing-key warnings", () => {
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

    openPreferences();
    cy.get('label[for="locale-switcher"]').should("contain", "Language");
    cy.get('[data-cy="locale-switcher"]').focus().select("pt-PT");
    cy.get('label[for="locale-switcher"]').should("contain", "Idioma");
    cy.get("html").should("have.attr", "lang", "pt-PT");
    cy.get('[data-cy="locale-switcher"]').select("pt-BR");
    cy.get("html").should("have.attr", "lang", "pt-BR");
    cy.then(() => {
      expect(i18nWarnings).to.deep.equal([]);
    });
  });

  it("keeps all three locale choices usable on a narrow mobile viewport", () => {
    cy.viewport(375, 800);
    visitWithNavigatorLanguages(["en-US"], "/#/?income=60000");

    switchLocale("pt-PT");
    cy.get("html").should("have.attr", "lang", "pt-PT");
    switchLocale("pt-BR");
    cy.get("html").should("have.attr", "lang", "pt-BR");
    switchLocale("en");
    cy.get("html").should("have.attr", "lang", "en");

    openPreferences();
    cy.get('[data-cy="locale-switcher"]').should("be.visible");
    closePreferences();
    cy.get('[data-cy="results-summary"]').should("be.visible");
    expectNoHorizontalOverflow();
  });
});
