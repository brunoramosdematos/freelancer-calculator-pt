const setInputValue = (selector: string, value: string) => {
  cy.get(selector).invoke("val", value).trigger("input");
};

const setIncome = (value: string) => {
  setInputValue('[data-cy="income"]', value);
};

const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').then(($toggle) => {
    if ($toggle.attr("aria-expanded") === "false") {
      cy.wrap($toggle).click();
    }
  });
};

const normalizeTableText = (text: string) => text.replace(/\s+/g, " ").trim();

const selectDropdownChoice = (selector: string, choice: string) => {
  cy.get(`${selector} > input`).click();
  cy.get(selector).contains("button", choice).click();
};

const assertIncomeState = (income: string, formattedIncome: string) => {
  cy.url().should("include", `income=${income}`);
  cy.get('[data-cy="income"]').should("have.value", formattedIncome);
  cy.get('[data-cy="gross-income-row"]').should(
    "contain",
    `${formattedIncome}.00€`,
  );
};

describe("browser history synchronizes simulator state", () => {
  it("updates income controls and results on Back and Forward", () => {
    cy.visit("/#/?income=50000");

    assertIncomeState("50000", "50 000");

    setIncome("60000");

    assertIncomeState("60000", "60 000");

    cy.go("back");

    assertIncomeState("50000", "50 000");

    cy.go("forward");

    assertIncomeState("60000", "60 000");
  });

  it("restores display frequency and visible values through history", () => {
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Month",
    );
    cy.get('[data-cy="results-summary"]').should("contain", "/ month");

    cy.get('[data-cy="frequency-button"]').contains("Day").click();

    cy.url().should("include", "displayFrequency=day");
    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Day",
    );
    cy.get('[data-cy="results-summary"]').should("contain", "/ day");

    cy.go("back");

    cy.url().should("not.include", "displayFrequency=day");
    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Month",
    );
    cy.get('[data-cy="results-summary"]').should("contain", "/ month");

    cy.go("forward");

    cy.url().should("include", "displayFrequency=day");
    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Day",
    );
    cy.get('[data-cy="results-summary"]').should("contain", "/ day");
  });

  it("restores manual and automatic expense state through history", () => {
    cy.visit("/#/?income=50000");
    openAdvancedTaxSettings();

    cy.url().should("not.include", "expenses=");
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "not.exist",
    );

    setInputValue('[data-cy="expenses"] input:first-of-type', "3500");

    cy.url().should("include", "expenses=3500");
    cy.get('[data-cy="expenses"] input:first-of-type').should(
      "have.value",
      "3 500",
    );
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "contain",
      "Manual expenses",
    );

    cy.get("#setExpensesAutoButton").click();

    cy.url().should("not.include", "expenses=");
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "not.exist",
    );

    cy.go("back");

    cy.url().should("include", "expenses=3500");
    cy.get('[data-cy="expenses"] input:first-of-type').should(
      "have.value",
      "3 500",
    );
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "contain",
      "Manual expenses",
    );

    cy.go("forward");

    cy.url().should("not.include", "expenses=");
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "not.exist",
    );
  });

  it("restores landing and active presentation through history", () => {
    cy.visit("/#/");

    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
    cy.get('[data-cy="product-heading"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
    cy.get('[data-cy="results-summary"]').should("not.exist");

    setIncome("50000");

    cy.url().should("include", "income=50000");
    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "active",
    );
    cy.get('[data-cy="results-summary"]').should("be.visible");

    cy.go("back");

    cy.url().should("not.include", "income=");
    cy.get('[data-cy="income"]').should("have.value", "");
    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
    cy.get('[data-cy="product-heading"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
    cy.get('[data-cy="results-summary"]').should("not.exist");

    cy.go("forward");

    assertIncomeState("50000", "50 000");
    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "active",
    );
  });

  it("restores advanced boolean summary and controls through history", () => {
    cy.visit("/#/?income=50000");
    openAdvancedTaxSettings();

    cy.get('[data-cy="rnh"] input:first-of-type').should(
      "have.value",
      "false",
    );

    cy.get('[data-cy="rnh"] input:first-of-type').click();

    cy.url().should("include", "rnh=true");
    cy.get('[data-cy="advanced-tax-summary-rnh"]').should(
      "contain",
      "NHR / RNH",
    );
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "true");

    cy.go("back");

    cy.url().should("not.include", "rnh=true");
    cy.get('[data-cy="advanced-tax-summary-rnh"]').should("not.exist");
    cy.get('[data-cy="rnh"] input:first-of-type').should(
      "have.value",
      "false",
    );

    cy.go("forward");

    cy.url().should("include", "rnh=true");
    cy.get('[data-cy="advanced-tax-summary-rnh"]').should(
      "contain",
      "NHR / RNH",
    );
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "true");
  });

  it("restores Social Security adjustment through one Back and Forward step", () => {
    let defaultSocialSecurityText = "";
    let adjustedSocialSecurityText = "";

    cy.visit("/#/?income=50000");
    openAdvancedTaxSettings();

    cy.url().should("not.include", "ssDiscount=");
    cy.get('[data-cy="ss-discount"]').should("contain", "0%");
    cy.get('[data-cy="social-security-row"]')
      .invoke("text")
      .then((text) => {
        defaultSocialSecurityText = normalizeTableText(text);
      });

    cy.get('[data-cy="ss-discount"] [data-cy="counter-decrease"]').click();

    cy.url().should("include", "ssDiscount=-0.05");
    cy.get('[data-cy="ss-discount"]').should("contain", "-5%");
    cy.get('[data-cy="advanced-tax-summary-ss-discount"]').should(
      "contain",
      "SS base -5%",
    );
    cy.get('[data-cy="social-security-row"]')
      .invoke("text")
      .then((text) => {
        adjustedSocialSecurityText = normalizeTableText(text);
        expect(adjustedSocialSecurityText).not.to.equal(
          defaultSocialSecurityText,
        );
      });

    cy.go("back");

    cy.url().should("not.include", "ssDiscount=");
    cy.get('[data-cy="ss-discount"]').should("contain", "0%");
    cy.get('[data-cy="advanced-tax-summary-ss-discount"]').should("not.exist");
    cy.get('[data-cy="social-security-row"]')
      .invoke("text")
      .should((text) => {
        expect(normalizeTableText(text)).to.equal(defaultSocialSecurityText);
      });

    cy.go("forward");

    cy.url().should("include", "ssDiscount=-0.05");
    cy.get('[data-cy="ss-discount"]').should("contain", "-5%");
    cy.get('[data-cy="advanced-tax-summary-ss-discount"]').should(
      "contain",
      "SS base -5%",
    );
    cy.get('[data-cy="social-security-row"]')
      .invoke("text")
      .should((text) => {
        expect(normalizeTableText(text)).to.equal(adjustedSocialSecurityText);
      });
  });

  it("restores tax year and Youth IRS year through one Back and Forward step", () => {
    cy.visit(
      "/#/?income=50000&currentTaxRankYear=2025&benefitsOfYouthIrs=true&yearOfYouthIrs=2",
    );

    cy.get('[data-cy="tax-rank-years-dropdown"] > input').should(
      "have.value",
      "2025",
    );
    cy.get('[data-cy="advanced-tax-summary-youth-irs"]').should(
      "contain",
      "Youth IRS year 2",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input:first-of-type').should("be.checked");
    cy.get('[data-cy="youth-irs-years-dropdown"] > input').should(
      "have.value",
      "2",
    );

    selectDropdownChoice('[data-cy="tax-rank-years-dropdown"]', "2024");

    cy.url().should("include", "currentTaxRankYear=2024");
    cy.url().should("include", "yearOfYouthIrs=1");
    cy.get('[data-cy="tax-rank-years-dropdown"] > input').should(
      "have.value",
      "2024",
    );
    cy.get('[data-cy="youth-irs-years-dropdown"] > input').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="advanced-tax-summary-youth-irs"]').should(
      "contain",
      "Youth IRS year 1",
    );

    cy.go("back");

    cy.url().should("include", "currentTaxRankYear=2025");
    cy.url().should("include", "yearOfYouthIrs=2");
    cy.get('[data-cy="tax-rank-years-dropdown"] > input').should(
      "have.value",
      "2025",
    );
    cy.get('[data-cy="youth-irs-years-dropdown"] > input').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="advanced-tax-summary-youth-irs"]').should(
      "contain",
      "Youth IRS year 2",
    );

    cy.go("forward");

    cy.url().should("include", "currentTaxRankYear=2024");
    cy.url().should("include", "yearOfYouthIrs=1");
    cy.get('[data-cy="tax-rank-years-dropdown"] > input').should(
      "have.value",
      "2024",
    );
    cy.get('[data-cy="youth-irs-years-dropdown"] > input').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="advanced-tax-summary-youth-irs"]').should(
      "contain",
      "Youth IRS year 1",
    );
  });

  it("renders a shared advanced URL without rewriting it", () => {
    cy.visit(
      "/#/?income=50000&currentTaxRankYear=2025&benefitsOfYouthIrs=true&yearOfYouthIrs=2&ssDiscount=-0.2",
    );

    cy.url().then((initialUrl) => {
      cy.get('[data-cy="tax-rank-years-dropdown"] > input').should(
        "have.value",
        "2025",
      );
      cy.get('[data-cy="advanced-tax-summary-ss-discount"]').should(
        "contain",
        "SS base -20%",
      );
      cy.get('[data-cy="advanced-tax-summary-youth-irs"]').should(
        "contain",
        "Youth IRS year 2",
      );
      openAdvancedTaxSettings();
      cy.get('[data-cy="ss-discount"]').should("contain", "-20%");
      cy.get('[data-cy="youth-irs"] input:first-of-type').should(
        "be.checked",
      );
      cy.get('[data-cy="youth-irs-years-dropdown"] > input').should(
        "have.value",
        "2",
      );
      cy.url().should("eq", initialUrl);
    });
  });

  it("shares the current URL after Back navigation", () => {
    cy.visit("/#/?income=50000", {
      onBeforeLoad(win) {
        const writeText = cy.stub().as("writeText");

        Object.defineProperty(win.navigator, "clipboard", {
          configurable: true,
          value: { writeText },
        });
      },
    });

    setIncome("60000");
    cy.url().should("include", "income=60000");
    cy.go("back");

    assertIncomeState("50000", "50 000");
    cy.url().then((url) => {
      cy.get('[data-cy="share-simulation-button"]').click();
      cy.get("@writeText").should("have.been.calledWith", url);
      cy.get("@writeText").should("not.have.been.calledWithMatch", "60000");
    });
  });

  it("saves the visible simulation after Back navigation", () => {
    const simulationName = "History restored income";

    cy.clearLocalStorage("net_income_simulations");
    cy.visit("/#/?income=50000");

    setIncome("60000");
    cy.url().should("include", "income=60000");
    cy.go("back");

    assertIncomeState("50000", "50 000");

    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type(simulationName);
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", simulationName);
    cy.get('[data-cy="open-simulation"]').click();

    cy.url().should("include", "income=50000");
    cy.url().should("not.include", "income=60000");
    cy.get('[data-cy="income"]').should("have.value", "50 000");

    cy.get('[data-cy="simulations-menu"]').click();
    cy.get('[data-cy="delete-simulation"]').click();
    cy.get('[data-cy="simulations-menu"]').should("not.exist");
  });

  it("reset and manual income clearing restore landing presentation", () => {
    cy.visit(
      "/#/?income=60000&assessmentScenario=joint-single-income&expenses=3500",
    );

    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "active",
    );

    cy.get('[data-cy="reset-simulation-button"]').click();

    cy.url().should("not.include", "income=");
    cy.url().should("not.include", "expenses=");
    cy.get('[data-cy="income"]').should("have.value", "");
    cy.get('[data-cy="results-summary"]').should("not.exist");
    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
    cy.get('[data-cy="product-heading"]').should(
      "have.attr",
      "data-state",
      "landing",
    );

    setIncome("60000");

    cy.get('[data-cy="results-summary"]').should("be.visible");
    cy.get('[data-cy="assessment-scenario-individual"]').should("be.checked");
    openAdvancedTaxSettings();
    cy.url().should("not.include", "expenses=");
    cy.get('[data-cy="advanced-tax-summary-manual-expenses"]').should(
      "not.exist",
    );

    setIncome("");

    cy.get('[data-cy="income"]').should("have.value", "");
    cy.get('[data-cy="results-summary"]').should("not.exist");
    cy.get('[data-cy="income-form-shell"]').should(
      "have.attr",
      "data-state",
      "landing",
    );
  });
});

export {};
