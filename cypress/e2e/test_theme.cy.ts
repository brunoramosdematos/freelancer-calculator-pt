const THEME_STORAGE_KEY = "freelancer-calculator-pt:theme:v1";
const SIMULATIONS_STORAGE_KEY = "net_income_simulations";
const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

type Scheme = "light" | "dark";
type Locale = "en" | "pt-PT" | "pt-BR";

const installThemeMediaStub = (win: Cypress.AUTWindow, scheme: Scheme) => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const legacyListeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = scheme === "dark";

  const mediaQuery = {
    media: PREFERS_DARK_QUERY,
    get matches() {
      return matches;
    },
    onchange: null,
    addEventListener: (_event: "change", listener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_event: "change", listener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    addListener: (listener) => {
      legacyListeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeListener: (listener) => {
      legacyListeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    dispatch(nextScheme: Scheme) {
      matches = nextScheme === "dark";
      const event = {
        matches,
        media: PREFERS_DARK_QUERY,
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
      legacyListeners.forEach((listener) => listener(event));
      this.onchange?.(event);
    },
  };

  Object.defineProperty(win, "matchMedia", {
    configurable: true,
    value: (query: string) =>
      query === PREFERS_DARK_QUERY
        ? mediaQuery
        : ({ matches: false, media: query } as MediaQueryList),
  });
  (win as unknown as { __themeMql: typeof mediaQuery }).__themeMql = mediaQuery;
};

const visitWithScheme = (
  scheme: Scheme,
  path = "/#/",
  beforeLoad?: (win: Cypress.AUTWindow) => void,
  clearThemeStorage = true,
) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      installThemeMediaStub(win, scheme);
      if (clearThemeStorage) {
        win.localStorage.removeItem(THEME_STORAGE_KEY);
      }
      beforeLoad?.(win);
    },
  });
};

const openPreferences = () => {
  cy.get('[data-cy="preferences-toggle"]').then(($button) => {
    if ($button.attr("aria-expanded") === "false") {
      cy.wrap($button).click();
    }
  });
};

const setThemePreference = (preference: "system" | "light" | "dark") => {
  openPreferences();
  cy.get(`[data-cy="theme-${preference}"]`).check();
};

const closePreferences = () => {
  cy.get('[data-cy="preferences-toggle"]').then(($button) => {
    if ($button.attr("aria-expanded") === "true") {
      cy.wrap($button).click();
    }
  });
};

const switchLocale = (locale: Locale) => {
  openPreferences();
  cy.get('[data-cy="locale-switcher"]').select(locale);
};

const expectEffectiveTheme = (theme: Scheme) => {
  cy.get("html")
    .should("have.attr", "data-theme", theme)
    .and(theme === "dark" ? "have.class" : "not.have.class", "dark");
  cy.document().its("documentElement.style.colorScheme").should("eq", theme);
  cy.get('meta[name="theme-color"]')
    .invoke("attr", "content")
    .should("eq", theme === "dark" ? "#0b1220" : "#f5f5f5");
};

const dispatchSystemScheme = (scheme: Scheme) => {
  cy.window().then((win) => {
    (
      win as unknown as { __themeMql: { dispatch: (scheme: Scheme) => void } }
    ).__themeMql.dispatch(scheme);
  });
};

const getRgb = (value: string) => {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    throw new Error(`Could not parse RGB value: ${value}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])] as const;
};

const relativeLuminance = ([r, g, b]: readonly number[]) => {
  const normalize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
};

const contrastRatio = (foreground: string, background: string) => {
  const l1 = relativeLuminance(getRgb(foreground));
  const l2 = relativeLuminance(getRgb(background));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const isTransparent = (value: string) =>
  value === "transparent" ||
  value === "rgba(0, 0, 0, 0)" ||
  value === "rgba(0,0,0,0)";

const getEffectiveBackgroundColor = (element: Element) => {
  let current: Element | null = element;

  while (current) {
    const background = getComputedStyle(current).backgroundColor;

    if (background && !isTransparent(background)) {
      return background;
    }

    current = current.parentElement;
  }

  return getComputedStyle(document.body).backgroundColor;
};

const expectContrastAgainstEffectiveBackground = (
  selector: string,
  foregroundProperty: "color" | "border-color" = "color",
  minimum = 4.5,
) => {
  cy.get(selector)
    .first()
    .should(($element) => {
      const styles = getComputedStyle($element[0]);
      const background = getEffectiveBackgroundColor($element[0]);

      expect(
        contrastRatio(styles[foregroundProperty], background),
        selector,
      ).to.be.gte(minimum);
    });
};

const expectFocusRingContrastAtLeast = (selector: string, minimum = 3) => {
  cy.get(selector)
    .focus()
    .should(($element) => {
      const styles = getComputedStyle($element[0]);
      const ringColor = styles.boxShadow.match(/rgba?\([^)]+\)/)?.[0];

      expect(ringColor, `${selector} focus ring color`).to.be.a("string");
      expect(
        contrastRatio(
          ringColor as string,
          getEffectiveBackgroundColor($element[0]),
        ),
        `${selector} focus ring`,
      ).to.be.gte(minimum);
    });
};

const expectRepresentativeContrast = () => {
  expectContrastAgainstEffectiveBackground("body");
  expectContrastAgainstEffectiveBackground(".text-subtle", "color", 4.5);
  expectContrastAgainstEffectiveBackground('[data-cy="results-summary"]');
  expectContrastAgainstEffectiveBackground('[data-cy="net-income-row"]');
  expectContrastAgainstEffectiveBackground('[data-cy="final-irs-row"]');
  expectContrastAgainstEffectiveBackground('[data-cy="social-security-row"]');
  expectContrastAgainstEffectiveBackground('[data-cy="ss-special-status"]');
  expectContrastAgainstEffectiveBackground('[data-cy="income"]');
  expectContrastAgainstEffectiveBackground(
    '[data-cy="frequency-button"].bg-secondary',
  );
  expectFocusRingContrastAtLeast('[data-cy="preferences-toggle"]');
};

describe("appearance themes", () => {
  it("defaults to System and resolves Light when the device is light", () => {
    visitWithScheme("light");

    openPreferences();
    cy.get('[data-cy="theme-system"]').should("be.checked");
    expectEffectiveTheme("light");
  });

  it("defaults to System and resolves Dark when the device is dark", () => {
    visitWithScheme("dark");

    openPreferences();
    cy.get('[data-cy="theme-system"]').should("be.checked");
    expectEffectiveTheme("dark");
  });

  it("lets explicit Light and Dark override the system preference", () => {
    visitWithScheme("dark");
    setThemePreference("light");
    cy.get('[data-cy="theme-light"]').should("be.checked");
    expectEffectiveTheme("light");
    dispatchSystemScheme("dark");
    expectEffectiveTheme("light");

    visitWithScheme("light");
    setThemePreference("dark");
    cy.get('[data-cy="theme-dark"]').should("be.checked");
    expectEffectiveTheme("dark");
    dispatchSystemScheme("light");
    expectEffectiveTheme("dark");
  });

  it("reacts to system changes only while System remains selected", () => {
    visitWithScheme("light");
    cy.window().then((win) => {
      (win as unknown as { __themeMarker: string }).__themeMarker = "alive";
    });

    setThemePreference("system");
    dispatchSystemScheme("dark");
    expectEffectiveTheme("dark");
    cy.get('[data-cy="theme-system"]').should("be.checked");

    dispatchSystemScheme("light");
    expectEffectiveTheme("light");

    setThemePreference("light");
    dispatchSystemScheme("dark");
    expectEffectiveTheme("light");

    setThemePreference("dark");
    dispatchSystemScheme("light");
    expectEffectiveTheme("dark");
    cy.window().its("__themeMarker").should("eq", "alive");
  });

  it("switches themes without mutating URL, formatted values or open panels", () => {
    visitWithScheme(
      "light",
      "/#/?income=60000&currentTaxRankYear=2024&assessmentScenario=joint-single-income",
    );
    cy.location("href").as("initialUrl");
    cy.get('[data-cy="final-irs-row"]').invoke("text").as("irsText");
    cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-panel"] canvas').should(
      "have.length",
      1,
    );

    setThemePreference("dark");
    expectEffectiveTheme("dark");
    setThemePreference("light");
    expectEffectiveTheme("light");
    setThemePreference("system");
    expectEffectiveTheme("light");

    cy.get("@initialUrl").then((initialUrl) => {
      cy.location("href").should("eq", initialUrl);
    });
    cy.get("@irsText").then((irsText) => {
      cy.get('[data-cy="final-irs-row"]').invoke("text").should("eq", irsText);
    });
    cy.get('[data-cy="advanced-tax-settings-toggle"]').should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.get('[data-cy="income-breakdown-chart-panel"] canvas').should(
      "have.length",
      1,
    );
  });

  it("persists Dark and System across reloads", () => {
    visitWithScheme("light");

    setThemePreference("dark");
    cy.window()
      .its("localStorage")
      .invoke("getItem", THEME_STORAGE_KEY)
      .should("eq", "dark");
    cy.reload();
    openPreferences();
    cy.get('[data-cy="theme-dark"]').should("be.checked");
    expectEffectiveTheme("dark");

    setThemePreference("system");
    cy.window()
      .its("localStorage")
      .invoke("getItem", THEME_STORAGE_KEY)
      .should("eq", "system");
    visitWithScheme("light", "/#/", (win) => {
      win.localStorage.setItem(THEME_STORAGE_KEY, "system");
    });
    openPreferences();
    cy.get('[data-cy="theme-system"]').should("be.checked");
  });

  it("reset, share URLs and saved simulations do not store theme state", () => {
    let copiedUrl = "";

    visitWithScheme("light", "/#/?income=50000", (win) => {
      Object.defineProperty(win.navigator, "clipboard", {
        configurable: true,
        value: {
          writeText(value: string) {
            copiedUrl = value;
            return Promise.resolve();
          },
        },
      });
    });

    setThemePreference("dark");
    closePreferences();
    cy.get('[data-cy="share-simulation-button"]').click();
    cy.then(() => {
      expect(copiedUrl).to.include("income=50000");
      expect(copiedUrl).not.to.include("theme=");
      expect(copiedUrl).not.to.include(THEME_STORAGE_KEY);
    });

    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type("Theme invariant");
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.window().then((win) => {
      const saved = JSON.parse(
        win.localStorage.getItem(SIMULATIONS_STORAGE_KEY) ?? "[]",
      );
      expect(saved[0]).not.to.have.property("theme");
      expect(saved[0].parameters).not.to.have.property("theme");
    });

    cy.get('[data-cy="reset-simulation-button"]').click();
    cy.get('[data-cy="income"]').should("have.value", "");
    expectEffectiveTheme("dark");
    cy.window()
      .its("localStorage")
      .invoke("getItem", THEME_STORAGE_KEY)
      .should("eq", "dark");

    cy.get('[data-cy="simulations-menu"]').click();
    cy.contains("p", "Theme invariant");
    cy.get('[data-cy="open-simulation"]').click();
    expectEffectiveTheme("dark");
  });

  it("keeps the preferences dialog accessible and stable across locale and theme changes", () => {
    visitWithScheme("light");

    cy.get('[data-cy="preferences-toggle"]')
      .should("have.attr", "type", "button")
      .and("have.attr", "aria-haspopup", "dialog")
      .and("have.attr", "aria-expanded", "false")
      .and("have.attr", "aria-controls", "preferences-panel")
      .and("have.attr", "aria-label", "Open preferences")
      .click()
      .should("have.attr", "aria-expanded", "true");

    cy.get('[data-cy="preferences-panel"]')
      .should("be.visible")
      .and("have.attr", "role", "dialog")
      .and("contain", "Preferences");
    cy.get('[data-cy="locale-switcher"]').focus().should("be.focused");
    cy.get('[data-cy="theme-light"]').focus().type(" ");
    cy.get('[data-cy="theme-light"]').should("be.checked");
    cy.get('[data-cy="preferences-panel"]').should("be.visible");

    switchLocale("pt-PT");
    cy.get('[data-cy="preferences-panel"]')
      .should("be.visible")
      .and("contain", "Preferências")
      .and("contain", "Aspeto");

    switchLocale("pt-BR");
    cy.get('[data-cy="preferences-panel"]')
      .should("be.visible")
      .and("contain", "Aparência");

    cy.get('[data-cy="theme-dark"]').check();
    cy.get('[data-cy="preferences-panel"]').should("be.visible");

    cy.get('[data-cy="theme-dark"]').type("{esc}");
    cy.get('[data-cy="preferences-panel"]').should("not.exist");
    cy.get('[data-cy="preferences-toggle"]').should("be.focused");

    cy.get('[data-cy="preferences-toggle"]').click();
    cy.get("main").click("bottomLeft");
    cy.get('[data-cy="preferences-panel"]').should("not.exist");
  });

  it("fits and remains operable on a 375px viewport", () => {
    cy.viewport(375, 800);
    visitWithScheme("dark", "/#/?income=60000");

    cy.get('[data-cy="preferences-toggle"]').should("be.visible").click();
    cy.get('[data-cy="preferences-panel"]').then(($panel) => {
      const rect = $panel[0].getBoundingClientRect();
      expect(rect.left).to.be.gte(0);
      expect(rect.right).to.be.lte(375);
    });
    cy.get('[data-cy="locale-switcher"]').select("pt-BR");
    cy.get('[data-cy="theme-light"]').check();
    cy.document().then((document) => {
      expect(document.documentElement.scrollWidth).to.be.lte(
        document.documentElement.clientWidth + 1,
      );
    });
  });

  it("keeps dialogs, popovers, toasts and disclosures readable in Dark theme", () => {
    visitWithScheme("dark", "/#/?income=50000");
    setThemePreference("dark");
    closePreferences();

    cy.get('[data-cy="advanced-tax-settings-toggle"]').click();
    cy.get('button[aria-label="Social Security base adjustment information"]')
      .click()
      .invoke("attr", "aria-controls")
      .then((panelId) => {
        cy.get(`#${panelId}`).should("be.visible");
      });

    cy.get('[data-cy="calculation-details-toggle"]').click();
    cy.get('[data-cy="irs-calculation-details-toggle"]').click();
    cy.get('[data-cy="view-tax-ranks-button"]').click();
    cy.contains("h3", "Tax Ranks").should("be.visible");
    cy.get('button[aria-label="Close modal"]').click();

    cy.get('[data-cy="save-simulation-button"]').click();
    cy.get('[data-cy="simulation-name"]').type("Dark readable");
    cy.get('[data-cy="save-new-simulation-button"]').click();
    cy.contains("Simulation saved").should("be.visible");
    cy.get('[data-cy="advanced-tax-settings-panel"]').should("be.visible");
  });

  it("meets representative token contrast in both themes", () => {
    visitWithScheme("light", "/#/?income=50000&ssFirstYear=true");
    expectRepresentativeContrast();

    setThemePreference("dark");
    expectRepresentativeContrast();
  });

  it("keeps chart localization and a single canvas across theme and locale changes", () => {
    visitWithScheme("light", "/#/?income=50000");

    cy.get('[data-cy="income-breakdown-chart-panel"]').should("not.exist");
    cy.get('[data-cy="income-breakdown-chart-container"] canvas').should(
      "not.exist",
    );
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-panel"] canvas')
      .should("have.length", 1)
      .and(
        "have.attr",
        "aria-label",
        "Income breakdown chart showing net income, IRS and Social Security.",
      );

    setThemePreference("dark");
    switchLocale("pt-BR");

    cy.get('[data-cy="income-breakdown-chart-panel"] canvas')
      .should("have.length", 1)
      .and(
        "have.attr",
        "aria-label",
        "Gráfico da distribuição da renda entre renda líquida, IRS e Segurança Social.",
      );

    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-container"] canvas').should(
      "not.exist",
    );
    cy.get('[data-cy="income-breakdown-chart-toggle"]').click();
    cy.get('[data-cy="income-breakdown-chart-panel"] canvas').should(
      "have.length",
      1,
    );
  });
});

export {};
