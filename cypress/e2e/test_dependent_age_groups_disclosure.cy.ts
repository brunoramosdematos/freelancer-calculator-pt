const setCounterValue = (selector: string, value: string) => {
  cy.get(`${selector} input:first-of-type`).invoke("val", "").type(value);
};

const replaceCounterValue = (selector: string, value: string) => {
  cy.get(`${selector} input:first-of-type`)
    .invoke("val", value)
    .trigger("input");
};

const incrementCounter = (selector: string) => {
  cy.get(`${selector} [data-cy="counter-increase"]`).click();
};

const decrementCounter = (selector: string) => {
  cy.get(`${selector} [data-cy="counter-decrease"]`).click();
};

const toggleAgeGroups = () => {
  cy.get('[data-cy="dependent-age-groups-toggle"]').click();
};

const expectDisclosureExpanded = (expanded: boolean) => {
  cy.get('[data-cy="dependent-age-groups-toggle"]').should(
    "have.attr",
    "aria-expanded",
    expanded ? "true" : "false",
  );
  cy.get('[data-cy="dependent-age-groups-panel"]').should(
    expanded ? "be.visible" : "not.be.visible",
  );
};

describe("dependent age groups disclosure", () => {
  it("does not render age controls when there are zero dependents", () => {
    cy.visit("/#/?income=60000");

    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "0",
    );
    cy.get('[data-cy="dependent-age-groups"]').should("not.exist");
    cy.get('[data-cy="dependents-aged-3-or-under"]').should("not.exist");
    cy.get('[data-cy="dependents-aged-4-to-6"]').should("not.exist");
  });

  it("auto-opens when the user adds the first dependent", () => {
    cy.visit("/#/?income=60000");

    incrementCounter('[data-cy="number-of-dependents"]');
    incrementCounter('[data-cy="number-of-dependents"]');

    cy.get('[data-cy="dependent-age-groups"]').should("exist");
    expectDisclosureExpanded(true);
    cy.get('[data-cy="dependents-aged-3-or-under"]').should("be.visible");
    cy.get('[data-cy="dependents-aged-4-to-6"]').should("be.visible");
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "2");
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "All 2 dependents are currently treated as aged 7+.",
    );
  });

  it("collapses without resetting tax-relevant age values", () => {
    cy.visit("/#/?income=60000&currentTaxRankYear=2024");
    cy.get('[data-cy="assessment-scenario-joint-single-income"]').check({
      force: true,
    });
    setCounterValue('[data-cy="number-of-dependents"]', "2");
    setCounterValue('[data-cy="dependents-aged-3-or-under"]', "1");
    setCounterValue('[data-cy="dependents-aged-4-to-6"]', "1");

    toggleAgeGroups();

    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "1 aged 3 or under · 1 aged 4–6 · 0 aged 7+",
    );
    cy.get('[data-cy="final-irs-row"]').should("contain", "€7,108.79");
  });

  it("summarizes configured younger groups and derived aged 7+ dependents", () => {
    cy.visit("/#/?income=60000");
    setCounterValue('[data-cy="number-of-dependents"]', "3");
    setCounterValue('[data-cy="dependents-aged-3-or-under"]', "1");
    setCounterValue('[data-cy="dependents-aged-4-to-6"]', "1");

    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "1");
    toggleAgeGroups();

    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "1 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );
  });

  it("keeps the disclosure collapsed when total dependents increases again", () => {
    cy.visit("/#/?income=60000");
    setCounterValue('[data-cy="number-of-dependents"]', "2");
    toggleAgeGroups();

    incrementCounter('[data-cy="number-of-dependents"]');

    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "All 3 dependents are currently treated as aged 7+.",
    );
    toggleAgeGroups();
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "3");
  });

  it("updates summaries when reducing the total clamps age groups", () => {
    cy.visit("/#/?income=60000");
    setCounterValue('[data-cy="number-of-dependents"]', "3");
    setCounterValue('[data-cy="dependents-aged-3-or-under"]', "2");
    setCounterValue('[data-cy="dependents-aged-4-to-6"]', "1");

    setCounterValue('[data-cy="number-of-dependents"]', "2");

    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type').should(
      "have.value",
      "2",
    );
    cy.get('[data-cy="dependents-aged-4-to-6"] input:first-of-type').should(
      "have.value",
      "0",
    );
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "0");
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 0 aged 4–6 · 0 aged 7+",
    );
  });

  it("disappears at zero dependents and reopens on the next positive value", () => {
    cy.visit("/#/?income=60000");
    setCounterValue('[data-cy="number-of-dependents"]', "1");

    decrementCounter('[data-cy="number-of-dependents"]');

    cy.get('[data-cy="dependent-age-groups"]').should("not.exist");

    incrementCounter('[data-cy="number-of-dependents"]');

    cy.get('[data-cy="dependent-age-groups"]').should("exist");
    expectDisclosureExpanded(true);
  });

  it("hydrates shared URLs collapsed and keeps the URL stable when toggled", () => {
    cy.visit(
      "/#/?income=60000&numberOfDependents=3&dependentsAged3OrUnder=1&dependentsAged4To6=1",
    );

    cy.location("href").as("sharedUrl");
    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "1 aged 3 or under · 1 aged 4–6 · 1 aged 7+",
    );

    toggleAgeGroups();

    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="dependents-aged-4-to-6"] input:first-of-type').should(
      "have.value",
      "1",
    );
    cy.get('[data-cy="dependents-aged-7-or-over"]').should("contain", "1");
    cy.get("@sharedUrl").then((sharedUrl) => {
      cy.location("href").should("eq", sharedUrl);
    });

    toggleAgeGroups();

    cy.get("@sharedUrl").then((sharedUrl) => {
      cy.location("href").should("eq", sharedUrl);
    });
  });

  it("keeps collapsed summaries in sync through browser Back and Forward", () => {
    cy.visit(
      "/#/?income=60000&numberOfDependents=3&dependentsAged3OrUnder=2&dependentsAged4To6=1",
    );

    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 1 aged 4–6 · 0 aged 7+",
    );

    replaceCounterValue('[data-cy="number-of-dependents"]', "2");

    cy.url().should("include", "numberOfDependents=2");
    cy.url().should("include", "dependentsAged3OrUnder=2");
    cy.url().should("include", "dependentsAged4To6=0");
    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 0 aged 4–6 · 0 aged 7+",
    );

    cy.go("back");

    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "3",
    );
    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependents-aged-3-or-under"] input:first-of-type').should(
      "not.be.visible",
    );
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 1 aged 4–6 · 0 aged 7+",
    );
    cy.location("href").should("not.include", "dependentAgeGroups");

    cy.go("forward");

    cy.get('[data-cy="number-of-dependents"] input:first-of-type').should(
      "have.value",
      "2",
    );
    expectDisclosureExpanded(false);
    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "2 aged 3 or under · 0 aged 4–6 · 0 aged 7+",
    );
    cy.location("href").should("not.include", "dependentAgeGroups");
  });

  it("supports keyboard toggling with synchronized aria attributes", () => {
    cy.visit("/#/?income=60000&numberOfDependents=1");

    cy.get('[data-cy="dependent-age-groups-toggle"]')
      .as("toggle")
      .invoke("attr", "aria-controls")
      .then((panelId) => {
        expect(panelId).to.equal("dependent-age-groups-panel");
        cy.get(`#${panelId}`).should(
          "have.attr",
          "data-cy",
          "dependent-age-groups-panel",
        );
      });

    cy.get("@toggle").focus().should("have.focus").type("{enter}");
    expectDisclosureExpanded(true);
    cy.get("@toggle").type(" ");
    expectDisclosureExpanded(false);
  });

  it("wraps and remains usable on a narrow mobile viewport", () => {
    cy.viewport(375, 800);
    cy.visit(
      "/#/?income=60000&numberOfDependents=12&dependentsAged3OrUnder=4&dependentsAged4To6=3",
    );

    cy.get('[data-cy="dependent-age-groups-summary"]').should(
      "contain",
      "4 aged 3 or under · 3 aged 4–6 · 5 aged 7+",
    );
    cy.get('[data-cy="dependent-age-groups-toggle"] svg').should("be.visible");
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.lte(
        win.innerWidth,
      );
    });

    toggleAgeGroups();

    cy.get('[data-cy="dependents-aged-3-or-under"]').should("be.visible");
    cy.get('[data-cy="dependents-aged-4-to-6"]').should("be.visible");
    cy.get('[data-cy="dependent-age-groups-derived-label"]').should(
      "contain",
      "Calculated automatically",
    );
  });
});

export {};
