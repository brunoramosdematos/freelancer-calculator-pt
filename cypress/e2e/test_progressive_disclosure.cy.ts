const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
};

const openIrsCalculationDetails = () => {
  cy.get('[data-cy="calculation-details-toggle"]').click();
  cy.get('[data-cy="irs-calculation-details-toggle"]').click();
};

const openSocialSecurityDetails = () => {
  openAdvancedTaxSettings();
  cy.get('[data-cy="view-social-security-calculation"]').click();
};

describe("progressive disclosure simulator layout", () => {
  it("keeps the default simulation focused on compact final results", () => {
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="advanced-tax-settings-toggle"]')
      .should("be.visible")
      .and("have.attr", "aria-expanded", "false")
      .and("contain", "No custom tax settings");
    cy.get('[data-cy="calculation-details-toggle"]')
      .should("be.visible")
      .and("have.attr", "aria-expanded", "false");
    cy.get('[data-cy="financial-summary-table"]').should("be.visible");
    cy.get('[data-cy="final-irs-row"]').should("be.visible");
    cy.get('[data-cy="ss-relevant-income-before-adjustment"]').should(
      "not.be.visible",
    );
    cy.get('[data-cy="ss-contribution-base-cap"]').should("not.be.visible");
  });

  it("reveals IRS intermediate values without changing numeric results", () => {
    cy.visit(
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income",
    );

    cy.get('[data-cy="final-irs-row"]').should("contain", "8 608.79€");
    openIrsCalculationDetails();
    cy.get('[data-cy="taxable-income-for-rates-row"]')
      .should("be.visible")
      .and("contain", "22 500.00€");
    cy.get('[data-cy="gross-irs-before-dependent-deduction-row"]').should(
      "contain",
      "8 608.79€",
    );
    cy.get('[data-cy="final-irs-row"]').should("contain", "8 608.79€");
  });

  it("reveals Social Security details and capped adjustment status", () => {
    cy.visit(
      "/#/?income=11000&incomeFrequency=month&currentTaxRankYear=2026&nrMonthsDisplay=12",
    );

    openSocialSecurityDetails();
    cy.get('[data-cy="social-security-calculation-details-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.get('[data-cy="ss-relevant-income-before-adjustment"]').should(
      "contain",
      "7 700.00€",
    );
    cy.get('[data-cy="ss-contribution-base-cap"]').should(
      "contain",
      "6 445.56€",
    );
    cy.get('[data-cy="ss-contribution-base"]').should("contain", "6 445.56€");
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "1 379.35€",
    );
    cy.get('[data-cy="ss-adjustment-status-message"]')
      .should("contain", "Maximum contribution base reached")
      .and("contain", "-20% is the first available adjustment");
  });

  it("keeps non-default URL settings obvious while collapsed", () => {
    cy.visit(
      "/#/?income=50000&ssDiscount=-0.2&secondYear=true&benefitsOfYouthIrs=true&yearOfYouthIrs=2",
    );

    cy.get('[data-cy="advanced-tax-settings-toggle"]')
      .should("have.attr", "aria-expanded", "false")
      .and("contain", "SS base -20%")
      .and("contain", "Second fiscal year")
      .and("contain", "Youth IRS year 2");
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-discount"]').should("contain", "-20%");
    cy.get('[data-cy="second-year"] input:first-of-type').should("be.checked");
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should("be.checked");
  });

  it("maps the activity-year radio group and old URLs correctly", () => {
    cy.visit("/#/?income=50000&firstYear=true");
    openAdvancedTaxSettings();
    cy.get('[data-cy="first-year"] input:first-of-type').should("be.checked");

    cy.get('[data-cy="second-year"]').click();
    cy.url().should("include", "firstYear=false");
    cy.url().should("include", "secondYear=true");
    cy.get('[data-cy="second-year"] input:first-of-type').should("be.checked");

    cy.get('[data-cy="activity-year-none"]').click();
    cy.url().should("include", "secondYear=false");
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );

    cy.visit("/#/?income=50000&secondYear=true");
    openAdvancedTaxSettings();
    cy.get('[data-cy="second-year"] input:first-of-type').should("be.checked");
  });

  it("keeps the mobile summary before advanced settings without horizontal scroll", () => {
    cy.viewport(375, 800);
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="financial-summary-table"]').should("be.visible");
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should("be.visible");
    cy.get('[data-cy="financial-summary-table"]').then(($summary) => {
      expect($summary.closest(".order-1")).to.have.length(1);
    });
    cy.get('[data-cy="advanced-tax-settings-toggle"]').then(($advanced) => {
      expect($advanced.closest(".order-2")).to.have.length(1);
    });
    cy.get('[data-cy="financial-summary-table"] table').should("not.exist");
    cy.get('[data-cy="mobile-frequency-comparison-toggle"]').click();
    cy.get('[data-cy="mobile-frequency-comparison-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
  });

  it("renders the footer in document flow", () => {
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="footer"]')
      .should("be.visible")
      .and(($footer) => {
        expect($footer.css("position")).not.to.equal("fixed");
      });
  });

  it("exposes accessible disclosure controls that work by keyboard", () => {
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="calculation-details-toggle"]')
      .should("have.attr", "aria-expanded", "false")
      .invoke("attr", "aria-controls")
      .then((panelId) => {
        cy.get(`#${panelId}`).should("exist");
      });

    cy.get('[data-cy="calculation-details-toggle"]')
      .focus()
      .trigger("keydown", { key: "Enter", code: "Enter", keyCode: 13 });
    cy.get('[data-cy="calculation-details-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.get('[data-cy="irs-calculation-details-toggle"]')
      .focus()
      .trigger("keydown", { key: " ", code: "Space", keyCode: 32 });
    cy.get('[data-cy="irs-calculation-details-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
  });
});

export {};
