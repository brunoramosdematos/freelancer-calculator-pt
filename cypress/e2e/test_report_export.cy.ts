const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";
const REPORT_SCENARIO =
  "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income&numberOfDependents=2&dependentsAged3OrUnder=1&dependentsAged4To6=1";

type Locale = "en" | "pt-PT" | "pt-BR";
type ThemePreference = "light" | "dark" | "system";

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

const visitScenario = (
  path = REPORT_SCENARIO,
  {
    locale = "en",
    theme = "light",
    stubPrint = false,
  }: {
    locale?: Locale;
    theme?: ThemePreference;
    stubPrint?: boolean;
  } = {},
) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      win.localStorage.setItem(THEME_STORAGE_KEY, theme);

      if (stubPrint) {
        cy.stub(win, "print").as("print");
      }
    },
  });
};

const openReport = () => {
  cy.get('[data-cy="export-report-button"]').click();
  cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
  cy.get('[data-cy="printable-report"]').should("exist");
  cy.get('[data-cy="report-dialog-scroll"]').scrollTo("top");
  cy.get('[data-cy="report-title"]').should("be.visible");
};

const assertGeneratedDateUsesLocale = (locale: string) => {
  cy.window().then((win) => {
    const expectedDate = new win.Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(new Date());

    assertContainsNormalized('[data-cy="report-generated-at"]', expectedDate);
  });
};

describe("printable report export", () => {
  it("does not show the export action in the landing state", () => {
    visitScenario("/#/");

    cy.get('[data-cy="export-report-button"]').should("not.exist");
  });

  it("opens the report preview and returns focus to the export button", () => {
    visitScenario();

    cy.get('[data-cy="export-report-button"]').click();
    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
    cy.get('[data-cy="report-print-button"]').should("be.focused");
    cy.get('[data-cy="report-close-button"]').click();
    cy.get('[data-cy="report-preview-dialog"]').should("not.exist");
    cy.get('[data-cy="export-report-button"]').should("be.focused");
  });

  it("calls browser print once and keeps the preview open", () => {
    visitScenario(REPORT_SCENARIO, { stubPrint: true });
    openReport();

    cy.get('[data-cy="report-print-button"]').click();
    cy.get("@print").should("have.been.calledOnce");
    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
  });

  it("renders English report content for the current simulation", () => {
    visitScenario();
    openReport();

    assertContainsNormalized('[data-cy="printable-report"]', "Income report");
    assertContainsNormalized(
      '[data-cy="printable-report"]',
      "Annual gross income",
    );
    assertContainsNormalized('[data-cy="report-gross-income"]', "€60,000.00");
    assertContainsNormalized(
      '[data-cy="printable-report"]',
      "Annual net income",
    );
    assertContainsNormalized('[data-cy="printable-report"]', "IRS");
    assertContainsNormalized('[data-cy="printable-report"]', "Social Security");
    assertContainsNormalized('[data-cy="report-tax-year"]', "2024");
    assertContainsNormalized(
      '[data-cy="report-tax-assessment"]',
      "Joint - one income",
    );
    assertContainsNormalized(
      '[data-cy="report-dependent-age-groups"]',
      "1 aged 3 or under",
    );
    assertContainsNormalized(
      '[data-cy="report-fiscal-data-status"]',
      "historical supported",
    );
    assertContainsNormalized('[data-cy="report-last-reviewed"]', "2026-06-30");
    assertContainsNormalized(
      '[data-cy="report-disclaimer"]',
      "not accounting, legal, or tax advice",
    );
  });

  it("localizes report content and formatting in pt-PT", () => {
    visitScenario(REPORT_SCENARIO, { locale: "pt-PT" });
    openReport();

    assertContainsNormalized(
      '[data-cy="report-preview-dialog"]',
      "Guardar como PDF",
    );
    assertContainsNormalized(
      '[data-cy="printable-report"]',
      "Relatório de rendimento",
    );
    assertGeneratedDateUsesLocale("pt-PT");
    assertContainsNormalized('[data-cy="report-gross-income"]', "60 000,00 €");
    assertContainsNormalized('[data-cy="printable-report"]', "Detalhe fiscal");
  });

  it("localizes report content and formatting in pt-BR", () => {
    visitScenario(REPORT_SCENARIO, { locale: "pt-BR" });
    openReport();

    assertContainsNormalized(
      '[data-cy="report-preview-dialog"]',
      "Salvar como PDF",
    );
    assertContainsNormalized(
      '[data-cy="printable-report"]',
      "Relatório de renda",
    );
    assertGeneratedDateUsesLocale("pt-BR");
    assertContainsNormalized('[data-cy="report-gross-income"]', "€ 60.000,00");
    assertContainsNormalized(
      '[data-cy="printable-report"]',
      "Detalhamento fiscal",
    );
  });

  it("keeps Dark theme report preview readable", () => {
    visitScenario(REPORT_SCENARIO, { locale: "pt-BR", theme: "dark" });
    openReport();

    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
    cy.get("html").should("have.attr", "data-theme", "dark");
    assertContainsNormalized(
      '[data-cy="report-preview-dialog"]',
      "Relatório de renda",
    );
  });

  it("does not mutate URL, selected tax year, or saved simulations", () => {
    visitScenario(REPORT_SCENARIO, {
      locale: "pt-BR",
      theme: "dark",
      stubPrint: true,
    });
    cy.window().then((win) => {
      win.localStorage.removeItem(SIMULATIONS_STORAGE_KEY);
    });
    cy.location("href").as("initialUrl");
    cy.get('[data-cy="tax-rank-years-dropdown"] input').should(
      "have.value",
      "2024",
    );

    openReport();
    cy.get('[data-cy="report-current-url"]').should(($element) => {
      const text = $element.text();
      expect(text).not.to.contain("locale");
      expect(text).not.to.contain("theme");
      expect(text).not.to.contain(LOCALE_STORAGE_KEY);
      expect(text).not.to.contain(THEME_STORAGE_KEY);
    });
    cy.get('[data-cy="report-print-button"]').click();
    cy.get("@print").should("have.been.calledOnce");
    cy.get('[data-cy="report-close-button"]').click();

    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });
    cy.get('[data-cy="tax-rank-years-dropdown"] input').should(
      "have.value",
      "2024",
    );
    cy.window().then((win) => {
      expect(win.localStorage.getItem(SIMULATIONS_STORAGE_KEY)).to.equal(null);
    });
  });

  it("marks printable content and interactive controls for print CSS", () => {
    visitScenario();
    openReport();

    cy.get('[data-cy="printable-report"]').should(
      "have.class",
      "printable-report",
    );
    cy.get('[data-cy="report-print-button"]').should(
      "have.attr",
      "data-print-hidden",
      "true",
    );
    cy.get('[data-cy="report-close-button"]').should(
      "have.attr",
      "data-print-hidden",
      "true",
    );
  });

  it("fits and scrolls on a 375px mobile viewport", () => {
    cy.viewport(375, 800);
    visitScenario(REPORT_SCENARIO, { locale: "pt-BR", theme: "dark" });
    openReport();

    cy.get('[data-cy="export-report-button"]').should("exist");
    cy.get('[data-cy="report-preview-dialog"]').then(($dialog) => {
      const rect = $dialog[0].getBoundingClientRect();
      expect(rect.width).to.be.lte(375);
    });
    cy.get('[data-cy="report-dialog-scroll"]').then(($scroll) => {
      const element = $scroll[0];
      expect(element.clientWidth).to.be.lte(375);
      expect(element.scrollHeight).to.be.gte(element.clientHeight);
    });
    cy.document().then((document) => {
      expect(document.documentElement.scrollWidth).to.be.lte(
        document.documentElement.clientWidth + 1,
      );
    });
  });

  it("closes with Escape", () => {
    visitScenario();
    openReport();

    cy.get("body").type("{esc}");
    cy.get('[data-cy="report-preview-dialog"]').should("not.exist");
    cy.get('[data-cy="export-report-button"]').should("be.focused");
  });
});
