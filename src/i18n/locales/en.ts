export const languageName = "English";

export const metadata = {
  title: "Freelancer Calculator Portugal | IRS & Social Security",
  description:
    "Open-source tax, Social Security, and income calculator for freelancers in Portugal.",
} as const;

const messages = {
  app: {
    productHeading: "Freelancer Calculator Portugal 🇵🇹",
    productAlt: "Freelancer Calculator Portugal",
  },
  navigation: {
    simulator: "simulator",
    simulations: "simulation ({count}) | simulations ({count})",
    about: "about",
    githubSourceLabel:
      "Open Freelancer Calculator Portugal source code on GitHub",
  },
  localeSwitcher: {
    label: "Language",
    english: "English",
    portuguesePortugal: "Português (Portugal)",
    portugueseBrazil: "Português (Brasil)",
  },
  preferences: {
    title: "Preferences",
    open: "Open preferences",
    close: "Close preferences",
    language: "Language",
    appearance: "Appearance",
  },
  theme: {
    system: "System",
    light: "Light",
    dark: "Dark",
    systemDescription: "Follows your device appearance setting.",
  },
  actions: {
    reset: "reset",
    share: "share",
    save: "save",
    simulationActionsLabel: "Simulation actions",
    auto: "auto",
    close: "Close",
    closeModal: "Close modal",
    saveSimulation: "Save this simulation",
    saveNewSimulation: "Save",
    viewRanks: "View ranks",
    viewSocialSecurityCalculation: "View Social Security calculation",
    goToSimulator: "go to simulator",
    contributeOnGitHub: "contribute on GitHub",
    officialInformation: "Official information",
    openSimulation: "Open saved simulation",
    deleteSimulation: "Delete saved simulation",
  },
  frequency: {
    year: "year",
    month: "month",
    day: "day",
    Year: "Year",
    Month: "Month",
    Day: "Day",
    compare: "Compare year, month and day",
    showIncomePer: "Show income per",
  },
  units: {
    dependents: "{count} dependent | {count} dependents",
    dependentUnit: "dependent | dependents",
    months: "{count} month | {count} months",
    monthUnit: "month | months",
    days: "{count} day | {count} days",
    dayUnit: "day | days",
    eur: "EUR",
    perYear: "/year",
    perMonth: "/month",
    businessDays: "business days",
    vatExcluded: "VAT excluded",
  },
  simulator: {
    tagline: "simulate your net income",
    incomePlaceholder: "Income",
    increaseIncome: "Increase income by {amount}",
    decreaseIncome: "Decrease income by {amount}",
    shareCopied: "sharable link copied to clipboard",
    simulationSaved: "Simulation saved",
  },
  simulationSettings: {
    title: "Simulation settings",
    summary: "Core assumptions used in the estimate.",
    infoLabel: "Income tax year information",
    infoText:
      "Tax years can change IAS values and IRS brackets. The selected year controls those published thresholds.",
    taxYear: "Income tax year",
  },
  assessment: {
    label: "Tax assessment",
    individual: {
      label: "Individual",
      description: "One taxpayer; no spouse or partner included.",
    },
    jointSingleIncome: {
      label: "Joint - one income",
      description: "Household assessment with one EUR 0 income.",
      help: "Uses the marital quotient for IRS bands.",
    },
  },
  dependents: {
    total: {
      label: "Number of dependents",
      input: "Number of dependents",
      decrease: "Decrease number of dependents",
      increase: "Increase number of dependents",
    },
    ageGroups: {
      title: "Dependent age groups",
      help: "Ages are measured on 31 December of the selected tax year. Age groups affect the dependent deduction used by this simulator.",
      aged3OrUnder: {
        label: "Aged 3 or under",
        input: "Aged 3 or under",
        decrease: "Decrease dependents aged 3 or under",
        increase: "Increase dependents aged 3 or under",
      },
      aged4To6: {
        label: "Aged 4–6",
        input: "Aged 4 to 6",
        decrease: "Decrease dependents aged 4 to 6",
        increase: "Increase dependents aged 4 to 6",
      },
      aged7OrOver: {
        label: "Aged 7+",
        outputLabel: "Aged 7 or over",
        calculated: "Calculated automatically",
      },
    },
    summary: {
      none: "No dependents.",
      allOlder:
        "The dependent is currently treated as aged 7+. | All {total} dependents are currently treated as aged 7+.",
      aged3OrUnderSegment: "{count} aged 3 or under | {count} aged 3 or under",
      aged4To6Segment: "{count} aged 4–6 | {count} aged 4–6",
      aged7OrOverSegment: "{count} aged 7+ | {count} aged 7+",
    },
  },
  schedule: {
    paidMonths: {
      label: "Paid months per year",
      decrease: "Decrease paid months per year",
      increase: "Increase paid months per year",
    },
    unpaidDays: {
      label: "Unpaid days off",
      decrease: "Decrease unpaid days off",
      increase: "Increase unpaid days off",
    },
  },
  advancedSettings: {
    title: "Advanced tax settings",
    noCustomSettings: "No custom tax settings",
    socialSecurityBaseAdjustment: {
      label: "Social Security base adjustment",
      infoLabel: "Social Security base adjustment information",
      infoText:
        "The selected percentage applies to the 70% relevant-income base before the 21.4% rate. Caps, minimums and exemptions can stop a visible change in the final contribution.",
      decrease: "Decrease Social Security base adjustment",
      increase: "Increase Social Security base adjustment",
    },
    youthIrs: {
      label: "Youth IRS",
      infoLabel: "Youth IRS information",
      infoText:
        "Youth IRS can reduce IRS for eligible taxpayers under the applicable yearly rules.",
      year: "Year",
      summary: "Youth IRS year {year}",
    },
    socialSecurityExemption: {
      label: "First 12 months SS exemption",
      infoLabel: "First 12 months Social Security exemption information",
      infoText:
        "The first 12 months as an independent worker may be exempt from Social Security contributions.",
    },
    activityYear: {
      label: "Activity-year reduction",
      none: "None",
      first: "First fiscal year",
      second: "Second fiscal year",
    },
    rnh: {
      label: "NHR / RNH",
      infoLabel: "NHR / RNH information",
      infoText:
        "Non-habitual residents use a fixed IRS tax rate of {rate} in this simulator.",
    },
    professionalExpenses: {
      title: "Professional expenses",
      infoLabel: "Professional expenses information",
      infoText:
        "Category B specific deductions can require justified professional expenses above the automatic Social Security deduction.",
      maximumRequired: "Maximum required:",
      decrease: "Decrease professional expenses",
      increase: "Increase professional expenses",
      manualSummary: "Manual expenses",
    },
    summary: {
      ssBase: "SS base {percentage}",
    },
  },
  socialSecurityStatus: {
    exemptionActive:
      "Social Security exemption is active; this adjustment currently has no monetary effect.",
    exemptionFinalZero:
      "Social Security exemption is active; final Social Security is EUR 0.",
    minimumApplied: "Minimum monthly Social Security contribution applied.",
    cappedWithBase: "Maximum Social Security base applied · {base}/month.",
    cappedWithFirstChangingAdjustment:
      "Maximum Social Security base applied · {base}/month. {percentage} is the first available adjustment that changes the result.",
    allAdjustmentsCapped:
      "Maximum contribution base reached. All available adjustments produce the same capped Social Security contribution.",
    cappedFirstChangingAdjustment:
      "Maximum contribution base reached. {percentage} is the first available adjustment that changes the result.",
    noEffect:
      "No cap, minimum, or exemption is changing the Social Security result.",
  },
  results: {
    title: "Results",
    shownPer: "Shown per {frequency}.",
    grossIncome: "Gross income",
    netIncome: "Net income",
    totalTaxes: "Total taxes",
  },
  table: {
    title: "Title",
    grossIncome: "Gross income",
    netIncome: "Net income",
    socialSecurity: "Social Security",
  },
  scenarioComparison: {
    title: "Compare scenarios",
    summary:
      "See how tax assessment, Social Security and dependents affect net income.",
    explanation:
      "Add up to three alternatives. The active simulator stays unchanged while each scenario reuses the same tax calculation path.",
    currentDescription: "Baseline from the current simulator values.",
    screenOnlyNote:
      "Scenario comparison is for on-screen analysis only in this version.",
    presets: {
      individual: {
        label: "Compare individual",
        description: "Use individual tax assessment for the same income.",
      },
      jointSingleIncome: {
        label: "Compare joint - one income",
        description: "Use joint household assessment with one income.",
      },
      socialSecurityMinus20: {
        label: "Compare SS -20%",
        description: "Apply a -20% Social Security base adjustment.",
      },
      noDependents: {
        label: "Compare no dependents",
        description: "Set dependent count and age groups to zero.",
      },
    },
    table: {
      scenario: "Scenario",
      grossIncome: "Gross / year",
      irs: "IRS / year",
      socialSecurity: "Social Security / year",
      netIncomeYear: "Net income / year",
      netIncomeMonth: "Net income / month",
      difference: "Difference",
      current: "Current scenario",
      best: "Best net income",
    },
    actions: {
      add: "Add scenario",
      remove: "Remove",
      removeScenario: "Remove {scenario}",
      clearAll: "Clear all",
    },
    statuses: {
      alreadyCurrent: "Already current",
      added: "Added",
      limitReached: "Limit reached",
      noAlternatives: "No alternatives added yet.",
      alternativeCount:
        "{count} alternative selected | {count} alternatives selected",
      betterThanCurrent: "{amount} better than current",
      worseThanCurrent: "{amount} worse than current",
      sameAsCurrent: "Same as current",
    },
  },
  report: {
    actions: {
      export: "Export report",
      print: "Save as PDF",
      close: "Close",
    },
    title: "Income report",
    previewTitle: "Report preview",
    previewDescription:
      "Review the current simulation before saving it as PDF through your browser print dialog.",
    generatedAt: "Generated at",
    productionUrl: "Production URL",
    summary: "Executive summary",
    assumptions: "Assumptions",
    taxBreakdown: "Tax breakdown",
    fiscalData: "Fiscal data",
    disclaimer: "Disclaimer",
    disclaimerText:
      "These calculations are estimates for independent workers with green receipts. They are not accounting, legal, or tax advice. VAT is excluded according to the simulator assumptions. Verify your situation with official sources or a qualified professional.",
    currentUrl: "Current simulator URL",
    noIncome: "No report is available without a valid income.",
    printUnavailable:
      "Your browser does not expose the print dialog in this context.",
    table: {
      item: "Item",
      value: "Value",
    },
    rows: {
      grossIncome: "Annual gross income",
      netIncome: "Annual net income",
      totalTaxes: "Annual total taxes",
      irs: "Annual IRS",
      socialSecurity: "Annual Social Security",
      finalIrs: "Final IRS",
      dependentDeduction: "Dependent deduction applied",
      paidMonths: "Paid months per year",
      unpaidDays: "Unpaid days off",
      taxAssessment: "Tax assessment",
      incomeFrequency: "Income frequency",
      displayFrequency: "Selected display frequency",
      dependents: "Number of dependents",
      dependentAgeGroups: "Dependent age groups",
      socialSecurityAdjustment: "Social Security adjustment",
      ssFirstYear: "First 12 months SS exemption",
      activityYear: "Activity-year reduction",
      youthIrs: "Youth IRS",
      rnh: "NHR / RNH",
      expenses: "Professional expenses",
      taxYear: "Tax year",
      latestSupportedYear: "Latest supported year",
      lastReviewed: "Last reviewed",
      irsBeforeDependentDeduction: "IRS before dependent deduction",
      socialSecurityContribution: "Social Security contribution",
      fiscalDataStatus: "Fiscal-data status",
    },
    values: {
      yes: "Yes",
      no: "No",
      notActive: "Not active",
      dependentAgeGroups:
        "{aged3OrUnder} aged 3 or under · {aged4To6} aged 4–6 · {aged7OrOver} aged 7+",
      expensesSummary: "{mode} · {amount} · still needed {stillNeeded}",
    },
  },
  chart: {
    title: "Income breakdown chart",
    summary: "Visual split of net income, IRS and Social Security",
    loading: "Loading income breakdown chart...",
    grossIncome: "gross income",
    grossIncomeLabel: "Gross income",
    netIncome: "Net income",
    socialSecurity: "Social Security",
    ariaLabel:
      "Income breakdown chart showing net income, IRS and Social Security.",
  },
  calculationDetails: {
    title: "Calculation details",
    summary: "IRS, Social Security, deductions and assumptions",
    irsTitle: "IRS calculation",
    irsSummary: "Taxable income, brackets and dependent deductions",
    socialSecurityTitle: "Social Security calculation",
    socialSecuritySummary: "70% base, adjustment, cap and final contribution",
    deductionsTitle: "Deductions and assumptions",
    deductionsSummary: "Expenses, benefits and working-day assumptions",
  },
  irsCalculation: {
    specificDeductions: "Specific deductions",
    expenses: "Expenses",
    youthIrsDiscount: "Youth IRS discount",
    householdTaxableIncome: "Household taxable income",
    taxableIncomeForRates: "Taxable income used for IRS rates",
    dividedBy2: "(divided by 2)",
    averageRatePortion: "Average-rate portion",
    normalRatePortion: "Normal-rate portion",
    quotient: "(quotient)",
    taxRank: "Tax rank",
    levelOfTotal: "Level {level} of {total}",
    irsBeforeDependentDeduction: "IRS before dependent deduction",
    dependentDeductionApplied: "Dependent deduction applied",
    finalIrs: "Final IRS",
    dialog: {
      title: "Tax Ranks",
      intro:
        "Your taxable income used for IRS rates ({amount}) is in level {level}.",
      biggerThan: "bigger than {amount}",
      lowerThan: "lower than {amount}",
      and: "and",
      level: "Level",
      minimum: "Minimum",
      maximum: "Maximum",
      normalTax: "Normal Tax",
      averageTax: "Average Tax",
    },
  },
  socialSecurityCalculation: {
    relevantIncome: "Relevant income at 70%",
    selectedAdjustment: "Selected adjustment",
    adjustedRelevantIncome: "Adjusted relevant income",
    maximumBase: "Maximum base of 12 IAS",
    contributionBase: "Contribution base applied",
    calculatedMonthlyContribution: "Calculated monthly contribution",
    finalMonthlyContribution: "Final monthly contribution",
    annualFinalContribution: "Annual final contribution",
    dailyFinalContribution: "Daily final contribution",
    currentStatus: "Current status",
  },
  deductions: {
    professionalExpenses: "Professional expenses",
    expensesMode: "Expenses mode",
    automatic: "Automatic",
    manual: "Manual",
    expensesStillNeeded: "Expenses still needed",
    paidMonths: "Paid months per year",
    unpaidDays: "Unpaid days off",
    businessDaysAssumed: "Business days assumed",
    youthIrs: "Youth IRS",
    activityYearReduction: "Activity-year reduction",
    active: "Active",
    notActive: "Not active",
    activeYear: "Active, year {year}",
    ssFirstYear: "First 12 months SS exemption",
  },
  taxData: {
    status: {
      title: "Fiscal data",
      summary: "{status} · reviewed {date}",
      latestSupported: "latest supported",
      historicalSupported: "historical supported",
      unsupported: "unsupported tax year",
      coverageCurrent:
        "Fiscal data coverage is current for the supported years.",
      reviewRequired:
        "Newer fiscal data may be available after {year}. Review required.",
      reviewedAt: "reviewed {date}",
      latestYear: "Latest supported year",
      selectedYear: "Selected tax year",
      supportedYears: "Supported tax years",
      lastReviewed: "Last reviewed",
      estimateDisclaimer:
        "Calculations remain estimates and do not replace accounting, legal, or tax advice.",
      sourceReferences: "Source references",
      viewSources: "View sources",
      officialSources: "Official sources",
      internalPolicy: "Internal tax update policy",
      detailsLabel: "View fiscal data coverage and sources for {year}",
      supportMeaning:
        "Supported means this simulator ships IRS brackets, IAS values, Youth IRS metadata, Social Security assumptions, and related deductions for the listed years.",
    },
    about: {
      title: "Tax data coverage",
      description:
        "The app ships static, versioned fiscal-data metadata. It does not scrape or fetch official portals at runtime.",
      supportedYears: "Supported tax years",
      latestSupportedYear: "Latest supported tax year",
      lastReviewed: "Last reviewed",
      sources: "Sources",
      limitations:
        "Coverage means the simulator includes IRS brackets, IAS values, Youth IRS metadata, Social Security assumptions, and related deductions for the listed years. The result is still an estimate, and users should validate their own situation with official sources or a qualified professional.",
    },
    sources: {
      autoridadeTributaria: {
        label: "Autoridade Tributária e Aduaneira",
        publisher: "Portal das Finanças",
      },
      segurancaSocial: {
        label: "Segurança Social",
        publisher: "Segurança Social",
      },
      diarioRepublica: {
        label: "Diário da República",
        publisher: "Official legislation publication",
      },
      taxUpdatePolicy: {
        label: "Tax update policy",
        publisher: "Internal repository documentation",
      },
    },
    notes: {
      conservativeSourceReview:
        "Source links point to official portals and the repository tax update policy; exact legal references are reviewed during tax-data updates.",
    },
  },
  simulations: {
    title: "Saved simulations",
    empty: "No saved simulations yet.",
    namePlaceholder: "Simulation name",
  },
  about: {
    title: "Freelancer Calculator Portugal",
    intro:
      "This open-source calculator estimates net income, Portuguese IRS and Social Security for freelancers using the simplified Category B model implemented in the simulator. It supports individual assessment, a joint single-income scenario, dependent deductions and saved simulations stored in your browser localStorage.",
    maintained:
      "The project is maintained by Bruno Ramos de Matos as a derivative of the original open-source work by Francisco Macedo:",
    disclaimer:
      "The calculations are indicative estimates, not accounting, legal or tax advice. They do not cover every Portuguese tax rule, such as shared custody, disability deductions, minimum-existence rules, additional collection deductions or the solidarity surcharge. Validate your own situation with Autoridade Tributaria e Aduaneira or a qualified professional.",
  },
  footer: {
    headline:
      "Indicative estimate · {businessDays} business days · VAT excluded",
    assumptionsTitle: "Assumptions and limitations",
    independentWorkers:
      "This estimate is for independent workers with green receipts (trabalhadores independentes com recibos verdes).",
    vatIgnored:
      "VAT (IVA) is ignored for the scenario where clients are outside Portugal.",
    dailyValues:
      "Daily values use {businessDays} business days minus unpaid days off.",
    aboutDisclaimer: "About and disclaimer",
  },
  accessibility: {
    decreaseValue: "Decrease value",
    increaseValue: "Increase value",
    counterValue: "Counter value",
    moreInformation: "More information",
  },
  validation: {
    noValue: "-",
  },
} as const;

export default messages;
