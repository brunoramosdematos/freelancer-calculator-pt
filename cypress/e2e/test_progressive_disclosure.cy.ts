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

const LOCALE_STORAGE_KEY = "freelancer-calculator-pt:locale:v1";

type Locale = "pt-PT" | "pt-BR";

const visitWithLocale = (path: string, locale: Locale) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    },
  });
};

const setIncome = (value: string) => {
  cy.get('[data-cy="income"]').invoke("val", value).trigger("input");
};

const expectNoHorizontalDocumentOverflow = () => {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth).to.be.lte(
      document.documentElement.clientWidth + 1,
    );
  });
};

describe("progressive disclosure simulator layout", () => {
  it("aligns the desktop dashboard columns and keeps result panels together", () => {
    cy.viewport(1536, 1024);
    cy.visit("/#/?income=50000");

    cy.get('[data-cy="dashboard-settings-column"]').then(($settings) => {
      const settingsRect = $settings[0].getBoundingClientRect();

      cy.get('[data-cy="dashboard-results-column"]').then(($results) => {
        const resultsRect = $results[0].getBoundingClientRect();

        expect(Math.abs(settingsRect.top - resultsRect.top)).to.be.lte(1);
      });
    });

    cy.get('[data-cy="results-summary"]').then(($summary) => {
      const summaryRect = $summary[0].getBoundingClientRect();

      cy.get('[data-cy="income-breakdown-chart-container"]').then(($chart) => {
        const chartRect = $chart[0].getBoundingClientRect();

        expect(chartRect.top - summaryRect.bottom).to.be.gte(0);
        expect(chartRect.top - summaryRect.bottom).to.be.lte(32);
        expect(Math.abs(chartRect.left - summaryRect.left)).to.be.lte(1);
        expect(Math.abs(chartRect.right - summaryRect.right)).to.be.lte(1);
      });

      cy.get('[data-cy="calculation-details-container"]').then(($details) => {
        const detailsRect = $details[0].getBoundingClientRect();

        expect(Math.abs(detailsRect.left - summaryRect.left)).to.be.lte(1);
        expect(Math.abs(detailsRect.right - summaryRect.right)).to.be.lte(1);
      });
    });
  });

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

  it("keeps the landing hero centered and anchors the active simulator below the header", () => {
    cy.viewport(1920, 900);
    visitWithLocale("/#/", "pt-BR");

    cy.get('[data-cy="page-header"]').then(($header) => {
      const headerBottom = $header[0].getBoundingClientRect().bottom;

      cy.get('[data-cy="product-heading"]').then(($heading) => {
        const headingRect = $heading[0].getBoundingClientRect();
        const headingCenter = (headingRect.top + headingRect.bottom) / 2;
        const visualCenter = headerBottom + (900 - headerBottom) / 2;

        expect(headingRect.top, "landing heading clears header").to.be.gte(
          headerBottom,
        );
        expect(
          Math.abs(headingCenter - visualCenter),
          "landing heading remains close to visual center",
        ).to.be.lte(140);
      });
    });

    setIncome("100000");
    cy.get('[data-cy="results-summary"]').should("be.visible");

    cy.get('[data-cy="page-header"]').then(($header) => {
      const headerBottom = $header[0].getBoundingClientRect().bottom;

      cy.get('[data-cy="product-heading"]').then(($heading) => {
        const headingTop = $heading[0].getBoundingClientRect().top;

        expect(headingTop, "active heading top gap").to.be.gte(
          headerBottom + 32,
        );
        expect(headingTop, "active heading is not pushed too low").to.be.lte(
          headerBottom + 140,
        );
      });
    });

    cy.get('[data-cy="income-form-shell"]').then(($form) => {
      const formBottom = $form[0].getBoundingClientRect().bottom;

      cy.get('[data-cy="results-summary"]').then(($summary) => {
        const dashboardGap =
          $summary[0].getBoundingClientRect().top - formBottom;

        expect(dashboardGap, "dashboard gap below form").to.be.gte(16);
        expect(dashboardGap, "dashboard gap below form").to.be.lte(64);
      });
    });

    expectNoHorizontalDocumentOverflow();
  });

  it("keeps the mobile hero usable before and after income entry", () => {
    cy.viewport(375, 800);
    visitWithLocale("/#/", "pt-PT");

    cy.get('[data-cy="income"]').should("be.visible");
    cy.get('[data-cy="page-header"]').then(($header) => {
      const headerBottom = $header[0].getBoundingClientRect().bottom;

      cy.get('[data-cy="product-heading"]').then(($heading) => {
        expect($heading[0].getBoundingClientRect().top).to.be.gte(headerBottom);
      });
    });

    setIncome("100000");
    cy.get('[data-cy="results-summary"]').should("be.visible");

    cy.get('[data-cy="page-header"]').then(($header) => {
      const headerBottom = $header[0].getBoundingClientRect().bottom;

      cy.get('[data-cy="product-heading"]').then(($heading) => {
        expect($heading[0].getBoundingClientRect().top).to.be.gte(
          headerBottom + 24,
        );
      });
    });

    expectNoHorizontalDocumentOverflow();
  });

  it("reveals IRS intermediate values without changing numeric results", () => {
    cy.visit(
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income",
    );

    cy.get('[data-cy="final-irs-row"]').should("contain", "€8,608.79");
    openIrsCalculationDetails();
    cy.get('[data-cy="taxable-income-for-rates-row"]')
      .should("be.visible")
      .and("contain", "€22,500.00");
    cy.get('[data-cy="gross-irs-before-dependent-deduction-row"]').should(
      "contain",
      "€8,608.79",
    );
    cy.get('[data-cy="final-irs-row"]').should("contain", "€8,608.79");
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

  it("maps the activity-year radio group to the legacy URL flags", () => {
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
  });

  it("hydrates legacy second-year URLs from a clean page load", () => {
    cy.visit("/#/?income=50000&secondYear=true");

    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "contain",
      "Second fiscal year",
    );
    openAdvancedTaxSettings();
    cy.get('[data-cy="second-year"] input:first-of-type').should("be.checked");
  });

  it("keeps the mobile dashboard order without horizontal scroll", () => {
    cy.viewport(375, 800);
    cy.visit("/#/?income=50000");

    const selectors = [
      '[data-cy="results-summary"]',
      '[data-cy="simulation-settings"]',
      '[data-cy="advanced-tax-settings-toggle"]',
      '[data-cy="income-breakdown-chart-container"]',
      '[data-cy="calculation-details-container"]',
      '[data-cy="footer"]',
    ];

    selectors.forEach((selector) => {
      cy.get(selector).should("be.visible");
    });

    cy.then(() => {
      const positions = selectors.map(
        (selector) => Cypress.$(selector)[0].getBoundingClientRect().top,
      );
      const sortedPositions = [...positions].sort((a, b) => a - b);

      expect(positions).to.deep.equal(sortedPositions);
    });
    cy.get('[data-cy="mobile-frequency-comparison-toggle"]').should(
      "be.visible",
    );
    cy.document().then((document) => {
      expect(document.documentElement.scrollWidth).to.be.lte(
        document.documentElement.clientWidth + 1,
      );
    });
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

  it("keeps info popovers closed on focus and supports dialog keyboard behavior", () => {
    cy.visit("/#/?income=50000");

    cy.get('button[aria-label="Income tax year information"]').then(
      ($button) => {
        const panelId = $button.attr("aria-controls");

        cy.wrap($button).focus().should("have.attr", "aria-expanded", "false");
        cy.get(`#${panelId}`).should("not.exist");
      },
    );

    openAdvancedTaxSettings();
    cy.get(
      'button[aria-label="Social Security base adjustment information"]',
    ).then(($button) => {
      const panelId = $button.attr("aria-controls");

      cy.wrap($button)
        .click()
        .should("have.attr", "aria-haspopup", "dialog")
        .and("have.attr", "aria-expanded", "true");
      cy.get(`#${panelId}`)
        .should("be.visible")
        .and("have.attr", "role", "dialog")
        .and(
          "have.attr",
          "aria-label",
          "Social Security base adjustment information",
        );
      cy.get(`#${panelId} a`)
        .should("have.attr", "target", "_blank")
        .and("contain", "Official information")
        .focus();
      cy.get(`#${panelId}`).should("be.visible");

      cy.get("body").type("{esc}");
      cy.get(`#${panelId}`).should("not.exist");
      cy.wrap($button).should("be.focused");
    });
  });

  it("closes the active info popover when another one opens", () => {
    cy.visit("/#/?income=50000");
    openAdvancedTaxSettings();

    cy.get(
      'button[aria-label="Social Security base adjustment information"]',
    ).then(($firstButton) => {
      const firstPanelId = $firstButton.attr("aria-controls");

      cy.wrap($firstButton).click();
      cy.get(`#${firstPanelId}`).should("be.visible");

      cy.get('button[aria-label="Youth IRS information"]').then(
        ($secondButton) => {
          const secondPanelId = $secondButton.attr("aria-controls");

          cy.wrap($secondButton).focus();
          cy.get(`#${firstPanelId}`).should("not.exist");
          cy.wrap($secondButton).type("{enter}");
          cy.get(`#${secondPanelId}`).should("be.visible");
        },
      );
    });
  });

  it("renders zero monetary values as currency in summaries and details", () => {
    cy.visit(
      "/#/?income=1000&ssFirstYear=true&numberOfDependents=1&dependentsAged3OrUnder=1",
    );

    cy.get('[data-cy="final-irs-row"]')
      .should("contain", "€0.00")
      .and("not.contain", "-");
    cy.get('[data-cy="social-security-row"]')
      .should("contain", "€0.00")
      .and("not.contain", "-");

    cy.get('[data-cy="calculation-details-toggle"]').click();
    cy.get('[data-cy="irs-calculation-details-toggle"]').click();
    cy.get('[data-cy="irs-final-detail-row"]').should("contain", "€0.00");

    cy.get('[data-cy="social-security-calculation-details-toggle"]').click();
    cy.get('[data-cy="ss-final-monthly-contribution"]').should(
      "contain",
      "€0.00",
    );
    cy.get('[data-cy="ss-annual-final-contribution"]').should(
      "contain",
      "€0.00",
    );
    cy.get('[data-cy="ss-daily-final-contribution"]').should(
      "contain",
      "€0.00",
    );

    cy.get('[data-cy="deductions-assumptions-details-toggle"]').click();
    cy.get('[data-cy="expenses-still-needed-row"]').should("contain", "€0.00");
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
      .then(($button) => {
        $button[0].dispatchEvent(
          new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            code: "Enter",
            key: "Enter",
          }),
        );
      });
    cy.get('[data-cy="calculation-details-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.get('[data-cy="irs-calculation-details-toggle"]')
      .focus()
      .then(($button) => {
        $button[0].dispatchEvent(
          new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            code: "Space",
            key: " ",
          }),
        );
      });
    cy.get('[data-cy="irs-calculation-details-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
  });
});

export {};
