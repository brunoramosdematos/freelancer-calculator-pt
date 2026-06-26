const monthly2026Scenario =
  "/#/?income=11000&incomeFrequency=month&currentTaxRankYear=2026&nrMonthsDisplay=12";

const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
};

const openSocialSecurityDetails = () => {
  openAdvancedTaxSettings();
  cy.get('[data-cy="view-social-security-calculation"]').click();
};

describe("Social Security adjustment explanation", () => {
  it("shows capped 2026 behavior and the first adjustment that changes SS", () => {
    cy.visit(monthly2026Scenario);
    openSocialSecurityDetails();

    cy.get('[data-cy="ss-relevant-income-before-adjustment"]').should(
      "be.visible",
    );
    cy.get('[data-cy="ss-relevant-income-before-adjustment"]').should(
      "contain",
      "€7,700.00",
    );
    cy.get('[data-cy="ss-contribution-base-cap"]').should(
      "contain",
      "€6,445.56",
    );
    cy.get('[data-cy="ss-contribution-base"]').should("contain", "€6,445.56");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,379.35",
    );
    cy.get('[data-cy="ss-adjustment-status-message"]')
      .should("contain", "Maximum contribution base reached")
      .and("contain", "-20% is the first available adjustment");

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.url().should("include", "ssDiscount=-0.05");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "-5%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,379.35",
    );

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.url().should("include", "ssDiscount=-0.1");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "-10%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,379.35",
    );

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.url().should("include", "ssDiscount=-0.15");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "-15%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,379.35",
    );

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.url().should("include", "ssDiscount=-0.2");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "-20%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,318.24",
    );

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();
    cy.url().should("include", "ssDiscount=-0.25");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "-25%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€1,235.85",
    );
  });

  it("shows that +5% changes the result when income is below the cap", () => {
    cy.visit(
      "/#/?income=2000&incomeFrequency=month&currentTaxRankYear=2026&nrMonthsDisplay=12",
    );
    openSocialSecurityDetails();

    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€299.60",
    );

    cy.get('[data-cy="ss-discount"] [data-cy="counter-increase"]').click();

    cy.url().should("include", "ssDiscount=0.05");
    cy.get('[data-cy="ss-selected-adjustment"]').should("contain", "+5%");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€314.58",
    );
    cy.get('[data-cy="ss-adjustment-status-message"]').should(
      "contain",
      "No cap, minimum, or exemption",
    );
  });
});

export {};
