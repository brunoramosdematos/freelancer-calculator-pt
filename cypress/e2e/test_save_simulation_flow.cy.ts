const SIMULATIONS_STORAGE_KEY = "net_income_simulations";

const selectTaxYear = (year: number) => {
  cy.get('[data-cy="tax-rank-years-dropdown"] > input').click();
  cy.get('[data-cy="tax-rank-years-dropdown"]')
    .contains("button", String(year))
    .click();
};
describe("simulator loads", () => {
  it("successfully loads the home page", () => {
    cy.visit("/#/");
    cy.contains("h1", "Freelancer Calculator Portugal 🇵🇹");
  });
});

describe("pass income to url parameters", () => {
  it("successfully save a new simulation", () => {
    const simulationName = "Rendimento líquido em 2023";

    cy.visit("/#/");
    cy.get('[data-cy="simulations-menu"]').should("not.exist");
    cy.get('[data-cy="income"]').type("55000");
    cy.get('[data-cy="assessment-scenario-joint-single-income"]').check({
      force: true,
    });
    cy.get('[data-cy="number-of-dependents"] input:first-of-type')
      .invoke("val", "")
      .type("2");
    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type')
      .invoke("val", "")
      .type("1");
    cy.get('[data-cy="dependents-aged-4-to-6"] input:first-of-type')
      .invoke("val", "")
      .type("1");
    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type(simulationName);
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.get('[data-cy="simulations-menu"]').should("exist");
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();
    cy.url().should("include", "?income=55000");
    cy.url().should("not.include", "expenses=");
    cy.url().should("include", "assessmentScenario=joint-single-income");
    cy.url().should("include", "numberOfDependents=2");
    cy.url().should("include", "dependentsAged3OrUnder=1");
    cy.url().should("include", "dependentsAged4To6=1");
    cy.get('[data-cy="income"]').should("have.value", "55,000");
    cy.get('[data-cy="assessment-scenario-joint-single-income"]').should(
      "be.checked",
    );
    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="simulations-menu"]').click();
    cy.get('[data-cy="delete-simulation"]').click();
    cy.get('[data-cy="simulations-menu"]').should("not.exist");
  });

  it("saves and restores joint-two-income simulations", () => {
    const simulationName = "Two-income household simulation";

    cy.visit("/#/");
    cy.get('[data-cy="income"]').type("60000");
    cy.get('[data-cy="joint-two-incomes-assessment-option"]').check({
      force: true,
    });
    cy.get('[data-cy="spouse-annual-income"]').type("20000");
    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type(simulationName);
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.url().should("include", "assessmentScenario=joint-two-incomes");
    cy.url().should("include", "spouseAnnualGrossIncome=20000");
    cy.get('[data-cy="joint-two-incomes-assessment-option"]').should(
      "be.checked",
    );
    cy.get('[data-cy="spouse-annual-income"]').should("have.value", "20,000");
  });

  it("restores an explicitly saved historical tax year", () => {
    const simulationName = "Historical 2025 simulation";

    cy.visit("/#/");
    cy.get('[data-cy="income"]').type("55000");
    selectTaxYear(2025);
    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type(simulationName);
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.url().should("include", "currentTaxRankYear=2025");
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2025",
    );
  });

  it("opens legacy saved simulations without tax year using the dynamic default", () => {
    const simulationName = "Legacy income-only simulation";

    cy.visit("/#/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem(
          SIMULATIONS_STORAGE_KEY,
          JSON.stringify([
            {
              id: "legacy-income-only",
              simulationName,
              createdAt: "2026-07-05T00:00:00.000Z",
              parameters: { income: "50000" },
            },
          ]),
        );
      },
    });

    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.get('[data-cy="income"]').should("have.value", "50,000");
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2026",
    );
    cy.url().should("not.include", "currentTaxRankYear=");
    cy.url().should("not.include", "spouseAnnualGrossIncome=");
    cy.get('[data-cy="spouse-annual-income"]').should("not.exist");
  });
});
