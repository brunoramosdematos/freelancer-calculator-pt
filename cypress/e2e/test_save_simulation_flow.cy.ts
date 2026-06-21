describe("simulator loads", () => {
  it("successfully loads the home page", () => {
    cy.visit("/#/");
    cy.contains("h4", " Remote freelancer from Portugal 🇵🇹");
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
    cy.url().should("include", "assessmentScenario=joint-single-income");
    cy.url().should("include", "numberOfDependents=2");
    cy.url().should("include", "dependentsAged3OrUnder=1");
    cy.url().should("include", "dependentsAged4To6=1");
    cy.get('[data-cy="income"]').should("have.value", "55 000");
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
});
