const openAdvancedTaxSettings = () => {
  cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
};

const openDependentAgeGroups = () => {
  cy.get('[data-cy="dependent-age-groups-toggle"]').click();
};

describe("simulator loads", () => {
  it("successfully loads the home page", () => {
    cy.visit("/#/"); // change URL to match your dev URL
    cy.contains("h1", "Freelancer Calculator Portugal 🇵🇹");
  });
});

describe("pass income through url parameters", () => {
  it("successfully uses income from url", () => {
    cy.visit("/#/?income=50000"); // change URL to match your dev URL
    cy.get('[data-cy="income"]').should("have.value", "50,000");
  });

  it("doesn't update income if incorrect from url", () => {
    cy.visit("/#/?income=-50000"); // change URL to match your dev URL
    cy.get('[data-cy="income"]').should("have.value", "");
  });

  it("doesn't update income if 0 from url", () => {
    cy.visit("/#/?income=0"); // change URL to match your dev URL
    cy.get('[data-cy="income"]').should("have.value", "");
  });
});
describe("pass incomeFrequency through url parameters", () => {
  it("successfully uses incomeFrequency from url", () => {
    cy.visit("/#/?income=50000&incomeFrequency=day"); // change URL to match your dev URL
    cy.get('[data-cy="frequency-dropdown"]>input').should("have.value", "day");
  });
  it("doesn't update incomeFrequency if incorrect from url", () => {
    cy.visit("/#/?income=50000&incomeFrequency=dummyval"); // change URL to match your dev URL
    cy.get('[data-cy="frequency-dropdown"]>input').should("have.value", "year");
  });
});

describe("pass displayFrequency through url parameters", () => {
  it("successfully uses displayFrequency from url", () => {
    cy.visit("/#/?income=50000&displayFrequency=day"); // change URL to match your dev URL
    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Day",
    );
  });
  it("doesn't update displayFrequency if incorrect from url", () => {
    cy.visit("/#/?income=50000&displayFrequency=dummyval"); // change URL to match your dev URL
    cy.get('[data-cy="frequency-button"].bg-secondary').should(
      "have.text",
      "Month",
    );
  });
});

describe("pass nrMonthsDisplay through url parameters", () => {
  it("successfully uses nrMonthsDisplay from url", () => {
    cy.visit("/#/?income=50000&nrMonthsDisplay=13"); // change URL to match your dev URL
    cy.get('[data-cy="nr-months-display"] input:first-of-type').should(
      "have.value",
      "13",
    );
  });
  it("doesn't update nrMonthsDisplay if incorrect from url", () => {
    cy.visit("/#/?income=50000&nrMonthsDisplay=-1"); // change URL to match your dev URL
    cy.get('[data-cy="nr-months-display"] input:first-of-type').should(
      "have.value",
      "12",
    );
  });
});

describe("pass ssDiscount through url parameters", () => {
  it("successfully uses ssDiscount from url", () => {
    cy.visit("/#/?income=50000&ssDiscount=-0.15"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "SS base -15%",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-discount"]').should("contain", "-15%");
  });
  it("doesn't update ssDiscount if incorrect from url", () => {
    cy.visit("/#/?income=50000&ssDiscount=-0.45"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-discount"]').should("contain", "0%");
  });
});

describe("pass expenses through url parameters", () => {
  it("successfully uses positive expenses from url", () => {
    cy.visit("/#/?income=50000&expenses=1534"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "Manual expenses",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="expenses"] input:first-of-type').should(
      "have.value",
      "1,534",
    );
  });

  it("successfully uses 0 expenses from url", () => {
    cy.visit("/#/?income=50000&expenses=0"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="expenses"] input:first-of-type').should(
      "have.value",
      "0",
    );
  });

  it("doesn't update expenses if incorrect from url", () => {
    cy.visit("/#/?income=50000&expenses=-1534"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "not.contain",
      "Manual expenses",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="expenses"] input:first-of-type').should(
      "not.have.value",
      "0",
    );
  });
});

describe("pass currentTaxRankYear through url parameters", () => {
  it("successfully uses currentTaxRankYear from url", () => {
    cy.visit("/#/?income=50000&currentTaxRankYear=2023"); // change URL to match your dev URL
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2023",
    );
  });

  it("doesn't update currentTaxRankYear if invalid year from url", () => {
    cy.visit("/#/?income=50000&currentTaxRankYear=2027"); // change URL to match your dev URL
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2025",
    );
  });

  it("doesn't update currentTaxRankYear if incorrect type from url", () => {
    cy.visit("/#/?income=50000&currentTaxRankYear=dummyval"); // change URL to match your dev URL
    cy.get('[data-cy="tax-rank-years-dropdown"] input:first-of-type').should(
      "have.value",
      "2025",
    );
  });
});

describe("pass assessment scenario and dependents through url parameters", () => {
  it("hydrates valid assessment and dependent controls from url", () => {
    cy.visit(
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income&numberOfDependents=2&dependentsAged3OrUnder=1&dependentsAged4To6=1",
    );

    cy.get('[data-cy="assessment-scenario-joint-single-income"]').should(
      "be.checked",
    );
    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="dependent-age-groups-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "1 aged 3 or under · 1 aged 4–6 · 0 aged 7+",
    );
    openDependentAgeGroups();
    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="dependents-aged-4-to-6"] input:first-of-type').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "0");
    cy.get('[data-cy="final-irs-row"]').should("contain", "€7,108.79");
  });

  it("retains individual when assessment scenario from url is invalid", () => {
    cy.visit(
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=invalid",
    );

    cy.get('[data-cy="assessment-scenario-individual"]').should("be.checked");
    cy.get('[data-cy="final-irs-row"]').should("contain", "€12,576.22");
  });

  it("rejects negative, fractional, and non-numeric dependent values from url", () => {
    cy.visit(
      "/#/?income=60000&numberOfDependents=-1&dependentsAged3OrUnder=2.5&dependentsAged4To6=abc",
    );

    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "0",
    );
    cy.get('[data-cy="dependents-aged-3-or-under"]').should("not.exist");
    cy.get('[data-cy="dependents-aged-4-to-6"]').should("not.exist");
  });

  it("rejects impossible age-bucket combinations from url", () => {
    cy.visit(
      "/#/?income=60000&numberOfDependents=2&dependentsAged3OrUnder=2&dependentsAged4To6=1",
    );

    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 0 aged 4–6 · 0 aged 7+",
    );
    openDependentAgeGroups();
    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="dependents-aged-4-to-6"] input:first-of-type').should(
      "have.value",
      "0",
    );
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "0");
  });

  it("keeps old urls without new values backward compatible", () => {
    cy.visit("/#/?income=60000&currentTaxRankYear=2024");

    cy.get('[data-cy="assessment-scenario-individual"]').should("be.checked");
    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "0",
    );
    cy.get('[data-cy="final-irs-row"]').should("contain", "€12,576.22");
    cy.url().should("not.include", "assessmentScenario=");
    cy.url().should("not.include", "numberOfDependents=");
    cy.url().should("not.include", "dependentsAged3OrUnder=");
    cy.url().should("not.include", "dependentsAged4To6=");
  });
});

describe("pass ssFirstYear through url parameters", () => {
  it("successfully uses true ssFirstYear from url", () => {
    cy.visit("/#/?income=50000&ssFirstYear=true"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "First 12 months SS exemption",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-first-year"] input:first-of-type').should(
      "have.value",
      "true",
    );
  });

  it("successfully uses false ssFirstYear from url", () => {
    cy.visit("/#/?income=50000&ssFirstYear=false"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-first-year"] input:first-of-type').should(
      "have.value",
      "false",
    );
  });

  it("doesn't update ssFirstYear if string type from url", () => {
    cy.visit("/#/?income=50000&ssFirstYear=yes"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-first-year"] input:first-of-type').should(
      "have.value",
      "false",
    );
  });

  it("doesn't update ssFirstYear if number type from url", () => {
    cy.visit("/#/?income=50000&ssFirstYear=1"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="ss-first-year"] input:first-of-type').should(
      "have.value",
      "false",
    );
  });
});

describe("pass firstYear through url parameters", () => {
  it("successfully uses true firstYear from url", () => {
    cy.visit("/#/?income=50000&firstYear=true"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "First fiscal year",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="first-year"] input:first-of-type').should("be.checked");
  });

  it("successfully uses false firstYear from url", () => {
    cy.visit("/#/?income=50000&firstYear=false"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });

  it("doesn't update firstYear if string type from url", () => {
    cy.visit("/#/?income=50000&firstYear=yes"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });

  it("doesn't update firstYear if number type from url", () => {
    cy.visit("/#/?income=50000&firstYear=1"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });
});

describe("pass secondYear through url parameters", () => {
  it("successfully uses true secondYear from url", () => {
    cy.visit("/#/?income=50000&secondYear=true"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "Second fiscal year",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="second-year"] input:first-of-type').should("be.checked");
  });

  it("successfully uses false secondYear from url", () => {
    cy.visit("/#/?income=50000&secondYear=false"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });

  it("doesn't update secondYear if string type from url", () => {
    cy.visit("/#/?income=50000&secondYear=yes"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });

  it("doesn't update secondYear if number type from url", () => {
    cy.visit("/#/?income=50000&secondYear=1"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="activity-year-none"] input:first-of-type').should(
      "be.checked",
    );
  });
});

describe("pass rnh through url parameters", () => {
  it("successfully uses true rnh from url", () => {
    cy.visit("/#/?income=50000&rnh=true"); // change URL to match your dev URL
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "NHR / RNH",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "true");
  });

  it("successfully uses false rnh from url", () => {
    cy.visit("/#/?income=50000&rnh=false"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "false");
  });

  it("doesn't update rnh if string type from url", () => {
    cy.visit("/#/?income=50000&rnh=yes"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "false");
  });

  it("doesn't update rnh if number type from url", () => {
    cy.visit("/#/?income=50000&rnh=1"); // change URL to match your dev URL
    openAdvancedTaxSettings();
    cy.get('[data-cy="rnh"] input:first-of-type').should("have.value", "false");
  });
});

describe("pass youth irs through url parameters", () => {
  it("successfully uses youth irs year from url 2025", () => {
    cy.visit(
      "/#/?income=50000&benefitsOfYouthIrs=true&yearOfYouthIrs=8&currentTaxRankYear=2025",
    );
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "Youth IRS year 8",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should(
      "have.value",
      "true",
    );
    cy.get('[data-cy="youth-irs-years-dropdown"] input:first-of-type').should(
      "have.value",
      "8",
    );
  });

  it("doesn't update youth irs year if incorrect from url 2025", () => {
    cy.visit(
      "/#/?income=50000&benefitsOfYouthIrs=true&yearOfYouthIrs=15&currentTaxRankYear=2025",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should("be.checked");
    cy.get('[data-cy="youth-irs-years-dropdown"] input:first-of-type').should(
      "have.value",
      "1",
    );
  });

  it("successfully uses youth irs year from url 2024", () => {
    cy.visit(
      "/#/?income=50000&benefitsOfYouthIrs=true&yearOfYouthIrs=5&currentTaxRankYear=2024",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should("be.checked");
    cy.get('[data-cy="youth-irs-years-dropdown"] input:first-of-type').should(
      "have.value",
      "5",
    );
  });

  it("doesn't update youth irs year if incorrect from url 2024", () => {
    cy.visit(
      "/#/?income=50000&benefitsOfYouthIrs=true&yearOfYouthIrs=10&currentTaxRankYear=2024",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should("be.checked");
    cy.get('[data-cy="youth-irs-years-dropdown"] input:first-of-type').should(
      "have.value",
      "1",
    );
  });

  it("doesn't update youth irs year if it is not selected", () => {
    cy.visit("/#/?income=50000");
    openAdvancedTaxSettings();
    cy.get('[data-cy="youth-irs"] input[type="checkbox"]').should(
      "not.be.checked",
    );
  });
});

export {};
