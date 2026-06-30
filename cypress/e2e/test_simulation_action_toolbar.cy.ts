const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";
const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
const ACTIVE_SIMULATOR_PATH = "/#/?income=60000&currentTaxRankYear=2024";

type Locale = "en" | "pt-PT" | "pt-BR";
type ThemePreference = "light" | "dark" | "system";

const ACTION_BUTTON_SELECTORS = [
  '[data-cy="reset-simulation-button"]',
  '[data-cy="share-simulation-button"]',
  '[data-cy="export-report-button"]',
  '[data-cy="save-simulation-button"]',
] as const;

const visitActiveSimulator = ({
  locale,
  theme = "light",
}: {
  locale: Locale;
  theme?: ThemePreference;
}) => {
  cy.visit(ACTIVE_SIMULATOR_PATH, {
    onBeforeLoad(win) {
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      win.localStorage.setItem(THEME_STORAGE_KEY, theme);
    },
  });
};

const expectNoHorizontalDocumentOverflow = () => {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth).to.be.lte(
      document.documentElement.clientWidth + 1,
    );
  });
};

const expectToolbarReady = (expectedLabel: string) => {
  cy.get('[data-cy="simulation-action-toolbar"]')
    .should("be.visible")
    .and("have.attr", "role", "group")
    .and("have.attr", "aria-label", expectedLabel);

  ACTION_BUTTON_SELECTORS.forEach((selector) => {
    cy.get(selector).should("be.visible");
  });
};

const expectActionLabelsFit = () => {
  cy.then(() => {
    ACTION_BUTTON_SELECTORS.forEach((selector) => {
      const button = Cypress.$(selector)[0] as HTMLButtonElement | undefined;

      expect(button === undefined, `${selector} exists`).to.equal(false);

      const label = button?.querySelector("span");
      const buttonRect = button!.getBoundingClientRect();
      const labelRect = label!.getBoundingClientRect();

      expect(button!.scrollWidth, `${selector} content width`).to.be.lte(
        button!.clientWidth + 2,
      );
      expect(labelRect.left, `${selector} label left edge`).to.be.gte(
        buttonRect.left - 2,
      );
      expect(labelRect.right, `${selector} label right edge`).to.be.lte(
        buttonRect.right + 2,
      );
    });
  });
};

const expectActionsShareOneRow = () => {
  cy.then(() => {
    const rects = ACTION_BUTTON_SELECTORS.map((selector) =>
      (Cypress.$(selector)[0] as HTMLButtonElement).getBoundingClientRect(),
    );
    const tops = rects.map((rect) => rect.top);
    const bottoms = rects.map((rect) => rect.bottom);

    expect(Math.max(...tops) - Math.min(...tops), "toolbar row tops").to.be.lte(
      4,
    );
    expect(
      Math.max(...bottoms) - Math.min(...bottoms),
      "toolbar row bottoms",
    ).to.be.lte(4);
  });
};

const expectToolbarCenteredInForm = () => {
  cy.get('[data-cy="simulation-action-toolbar"]').then(($toolbar) => {
    const toolbarRect = $toolbar[0].getBoundingClientRect();
    const toolbarCenter = (toolbarRect.left + toolbarRect.right) / 2;

    cy.get('[data-cy="income-form-container"]').then(($container) => {
      const containerRect = $container[0].getBoundingClientRect();
      const containerCenter = (containerRect.left + containerRect.right) / 2;

      expect(
        Math.abs(toolbarCenter - containerCenter),
        "toolbar centered in form container",
      ).to.be.lte(8);
    });
  });
};

describe("active simulator action toolbar", () => {
  it("keeps all pt-BR desktop actions aligned on one centered row", () => {
    cy.viewport(1920, 900);
    visitActiveSimulator({ locale: "pt-BR" });

    expectToolbarReady("Ações da simulação");
    cy.get('[data-cy="reset-simulation-button"]').should(
      "contain",
      "redefinir",
    );
    cy.get('[data-cy="share-simulation-button"]').should(
      "contain",
      "compartilhar",
    );
    cy.get('[data-cy="export-report-button"]').should(
      "contain",
      "Exportar relatório",
    );
    cy.get('[data-cy="save-simulation-button"]').should("contain", "salvar");

    expectActionsShareOneRow();
    expectActionLabelsFit();
    expectToolbarCenteredInForm();
    expectNoHorizontalDocumentOverflow();
  });

  it("keeps pt-PT labels fitting without awkward desktop wrapping", () => {
    cy.viewport(1365, 768);
    visitActiveSimulator({ locale: "pt-PT" });

    expectToolbarReady("Ações da simulação");
    cy.get('[data-cy="reset-simulation-button"]').should("contain", "repor");
    cy.get('[data-cy="share-simulation-button"]').should(
      "contain",
      "partilhar",
    );
    cy.get('[data-cy="export-report-button"]')
      .should("contain", "Exportar relatório")
      .click();
    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
    cy.get('[data-cy="report-close-button"]').click();

    expectActionsShareOneRow();
    expectActionLabelsFit();
    expectNoHorizontalDocumentOverflow();
  });

  it("uses a stable two-column mobile toolbar without overflow", () => {
    cy.viewport(375, 800);
    visitActiveSimulator({ locale: "pt-BR" });

    expectToolbarReady("Ações da simulação");
    expectActionLabelsFit();

    cy.then(() => {
      ACTION_BUTTON_SELECTORS.forEach((selector) => {
        const rect = (
          Cypress.$(selector)[0] as HTMLButtonElement
        ).getBoundingClientRect();

        expect(rect.height, `${selector} hit target height`).to.be.gte(44);
        expect(rect.width, `${selector} hit target width`).to.be.gte(120);
      });
    });

    expectNoHorizontalDocumentOverflow();
    cy.get('[data-cy="export-report-button"]').click();
    cy.get('[data-cy="report-preview-dialog"]').should("be.visible");
  });

  it("keeps the toolbar readable and keyboard-focusable in Dark theme", () => {
    cy.viewport(1365, 768);
    visitActiveSimulator({ locale: "pt-BR", theme: "dark" });

    cy.get("html").should("have.attr", "data-theme", "dark");
    expectToolbarReady("Ações da simulação");
    expectActionsShareOneRow();
    expectActionLabelsFit();

    cy.get('[data-cy="export-report-button"]')
      .focus()
      .should("be.focused")
      .and("have.class", "focus-visible:ring-2");
  });
});

export {};
