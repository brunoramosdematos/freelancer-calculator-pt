import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPinia } from "pinia";
import {
  DEFAULT_TAX_RANK_YEAR,
  SUPPORTED_TAX_RANK_YEARS,
  YEAR_BUSINESS_DAYS,
  useTaxesStore,
} from "@/store";
import router from "@/router";
import { AssessmentScenario, FrequencyChoices } from "@/typings";
import { asCurrency } from "@/utils";

const MONTHS_IN_YEAR = 12;

const taxesStore = useTaxesStore(createPinia());

describe("Taxes Store", () => {
  const DEFAULT_INCOME = 60_000;
  const DEFAULT_TAXABLE_INCOME = DEFAULT_INCOME * 0.75;

  beforeEach(() => {
    taxesStore.expensesAuto = true;
    taxesStore.expenses = 0;
    taxesStore.nrMonthsDisplay = 12;
    taxesStore.nrDaysOff = 0;
    taxesStore.setIncome(DEFAULT_INCOME);
    taxesStore.setIncomeFrequency(FrequencyChoices.Year);
    taxesStore.setDisplayFrequency(FrequencyChoices.Month);
    taxesStore.setCurrentTaxRankYear(2024);
    taxesStore.setSsDiscount(0);
    taxesStore.setAssessmentScenario(AssessmentScenario.Individual);
    taxesStore.setNumberOfDependents(0);

    taxesStore.firstYear = false;
    taxesStore.secondYear = false;
    taxesStore.rnh = false;
    taxesStore.ssFirstYear = false;
    taxesStore.benefitsOfYouthIrs = false;
    taxesStore.yearOfYouthIrs = 1;
  });

  it("should calculate the correct gross income by year", () => {
    expect(taxesStore.grossIncome.year).toBe(DEFAULT_INCOME);
    expect(taxesStore.grossIncome.month).toBe(DEFAULT_INCOME / MONTHS_IN_YEAR);
    expect(taxesStore.grossIncome.day).toBe(
      DEFAULT_INCOME / YEAR_BUSINESS_DAYS,
    );
  });

  it("should calculate the correct gross income by month", () => {
    const newGrossIncome = DEFAULT_INCOME / MONTHS_IN_YEAR;
    taxesStore.setIncome(newGrossIncome);

    taxesStore.setIncomeFrequency(FrequencyChoices.Month);

    expect(taxesStore.grossIncome.year).toBe(newGrossIncome * MONTHS_IN_YEAR);
    expect(taxesStore.grossIncome.month).toBe(newGrossIncome);
    expect(taxesStore.grossIncome.day).toBe(
      taxesStore.grossIncome.year / YEAR_BUSINESS_DAYS,
    );
  });

  it("should calculate the correct gross income by day", () => {
    const newGrossIncome = DEFAULT_INCOME / YEAR_BUSINESS_DAYS;
    taxesStore.setIncome(newGrossIncome);

    taxesStore.setIncomeFrequency(FrequencyChoices.Day);

    expect(taxesStore.grossIncome.year).toBe(
      newGrossIncome * YEAR_BUSINESS_DAYS,
    );
    expect(taxesStore.grossIncome.month).toBe(
      taxesStore.grossIncome.year / MONTHS_IN_YEAR,
    );
    expect(taxesStore.grossIncome.day).toBe(newGrossIncome);
  });

  it("should calculate the correct SS pay in the first year", () => {
    taxesStore.ssFirstYear = true;

    expect(taxesStore.ssPay.year).toBe(0);
    expect(taxesStore.ssPay.month).toBe(0);
    expect(taxesStore.ssPay.day).toBe(0);
  });

  describe("should calculate the correct SS pay in the second year and so on", () => {
    const taxesStore = useTaxesStore(createPinia());
    const SS_TAX = 0.214;

    it("when the income is below the SS max income", () => {
      const newGrossIncome = 24_000;
      taxesStore.setIncome(newGrossIncome);

      expect(taxesStore.ssPay.year).toBe(SS_TAX * (newGrossIncome * 0.7));
      expect(taxesStore.ssPay.month).toBe(
        (SS_TAX * (newGrossIncome * 0.7)) / MONTHS_IN_YEAR,
      );
      expect(taxesStore.ssPay.day).toBe(
        (SS_TAX * (newGrossIncome * 0.7)) / YEAR_BUSINESS_DAYS,
      );
    });

    it("when the income is above the SS max income", () => {
      const newGrossIncome = 120_000;
      taxesStore.setIncome(newGrossIncome);

      expect(taxesStore.ssPay.year).toBe(
        SS_TAX * taxesStore.maxSsIncome * MONTHS_IN_YEAR,
      );
      expect(taxesStore.ssPay.month).toBe(SS_TAX * taxesStore.maxSsIncome);
      expect(taxesStore.ssPay.day).toBe(
        (SS_TAX * taxesStore.maxSsIncome * MONTHS_IN_YEAR) / YEAR_BUSINESS_DAYS,
      );
    });

    it("when the income is lower than max ss pay, positive SS discount is applied", () => {
      const newGrossIncome = 30_000;
      taxesStore.setIncome(newGrossIncome);
      taxesStore.setSsDiscount(0.25);

      const monthlySsPay = Math.min(
        taxesStore.maxSsIncome,
        taxesStore.grossIncome.month * 0.7 * 1.25,
      );

      expect(taxesStore.ssPay.year).toBe(
        SS_TAX * monthlySsPay * MONTHS_IN_YEAR,
      );
      expect(taxesStore.ssPay.month).toBe(SS_TAX * monthlySsPay);
      expect(taxesStore.ssPay.day).toBe(
        (SS_TAX * monthlySsPay * MONTHS_IN_YEAR) / YEAR_BUSINESS_DAYS,
      );
    });

    it("when income is lower, negative SS discount is applied", () => {
      const newGrossIncome = 30_000;
      taxesStore.setIncome(newGrossIncome);
      taxesStore.setSsDiscount(-0.25);

      const monthlySsPay = Math.min(
        taxesStore.maxSsIncome,
        taxesStore.grossIncome.month * 0.7 * 0.75,
      );

      expect(taxesStore.ssPay.year).toBe(
        SS_TAX * monthlySsPay * MONTHS_IN_YEAR,
      );
      expect(taxesStore.ssPay.month).toBe(SS_TAX * monthlySsPay);
      expect(taxesStore.ssPay.day).toBe(
        (SS_TAX * monthlySsPay * MONTHS_IN_YEAR) / YEAR_BUSINESS_DAYS,
      );
    });

    test.each([
      { income: 30_000, discount: 0.25 },
      { income: 30_000, discount: -0.25 },
    ])(
      "Low incomes can apply discounts because with the discount," +
        "the monthly gross income is still lower than the maximum SS pay",
      ({ income, discount }) => {
        taxesStore.setIncome(income);
        taxesStore.setSsDiscount(discount);

        const monthlySsPay = Math.min(
          taxesStore.maxSsIncome,
          taxesStore.grossIncome.month * 0.7 * (1 + discount),
        );

        expect(taxesStore.ssPay.year).toBe(
          SS_TAX * monthlySsPay * MONTHS_IN_YEAR,
        );
        expect(taxesStore.ssPay.month).toBe(SS_TAX * monthlySsPay);
        expect(taxesStore.ssPay.day).toBe(
          (SS_TAX * monthlySsPay * MONTHS_IN_YEAR) / YEAR_BUSINESS_DAYS,
        );
      },
    );

    test.each([
      { income: 200_000, discount: 0.25 },
      { income: 200_000, discount: -0.25 },
    ])(
      "High incomes cannot apply discounts because even with the discount," +
        "the monthly gross income is higher than the maximum SS pay",
      ({ income, discount }) => {
        taxesStore.setIncome(income);
        taxesStore.setSsDiscount(discount);

        expect(taxesStore.ssPay.year).toBe(
          SS_TAX * taxesStore.maxSsIncome * MONTHS_IN_YEAR,
        );
        expect(taxesStore.ssPay.month).toBe(SS_TAX * taxesStore.maxSsIncome);
        expect(taxesStore.ssPay.day).toBe(
          (SS_TAX * taxesStore.maxSsIncome * MONTHS_IN_YEAR) /
            YEAR_BUSINESS_DAYS,
        );
      },
    );
  });

  describe("Social Security adjustment transparency", () => {
    let socialSecurityStore: ReturnType<typeof useTaxesStore>;

    const configureMonthlyIncome = (income: number) => {
      socialSecurityStore = useTaxesStore(createPinia());
      socialSecurityStore.expensesAuto = true;
      socialSecurityStore.expenses = 0;
      socialSecurityStore.setCurrentTaxRankYear(2026);
      socialSecurityStore.setIncomeFrequency(FrequencyChoices.Month);
      socialSecurityStore.setDisplayFrequency(FrequencyChoices.Month);
      socialSecurityStore.setNrMonthsDisplay(12);
      socialSecurityStore.setNrDaysOff(0);
      socialSecurityStore.setIncome(income);
      socialSecurityStore.setSsDiscount(0);
      socialSecurityStore.setSsFirstYear(false);
    };

    beforeEach(() => {
      configureMonthlyIncome(11_000);
    });

    it("exposes the 2026 cap and relevant income before adjustment", () => {
      expect(socialSecurityStore.ssContributionBaseCap).toBeCloseTo(6_445.56);
      expect(socialSecurityStore.ssRelevantIncomeBeforeAdjustment).toBeCloseTo(
        7_700,
      );
    });

    it.each([
      { discount: 0, expectedMonthlyContribution: 1_379.34984 },
      { discount: -0.05, expectedMonthlyContribution: 1_379.34984 },
      { discount: -0.1, expectedMonthlyContribution: 1_379.34984 },
      { discount: -0.15, expectedMonthlyContribution: 1_379.34984 },
      { discount: -0.2, expectedMonthlyContribution: 1_318.24 },
      { discount: -0.25, expectedMonthlyContribution: 1_235.85 },
    ])(
      "keeps the existing 2026 SS result for $discount adjustment",
      ({ discount, expectedMonthlyContribution }) => {
        socialSecurityStore.setSsDiscount(discount);

        expect(socialSecurityStore.ssPay.month).toBeCloseTo(
          expectedMonthlyContribution,
        );
      },
    );

    it("identifies -20% as the first available choice below the 12-IAS cap", () => {
      expect(
        socialSecurityStore.ssFirstAvailableDiscountBelowContributionBaseCap,
      ).toBe(-0.2);
    });

    it.each([0.05, 0.1, 0.15, 0.2, 0.25])(
      "keeps positive adjustment %s capped",
      (discount) => {
        socialSecurityStore.setSsDiscount(discount);

        expect(socialSecurityStore.ssIsContributionBaseCapped).toBe(true);
        expect(socialSecurityStore.ssContributionBase).toBeCloseTo(
          socialSecurityStore.ssContributionBaseCap,
        );
        expect(socialSecurityStore.ssPay.month).toBeCloseTo(1_379.34984);
      },
    );

    it("lets positive and negative adjustments change SS for lower income above the minimum", () => {
      configureMonthlyIncome(2_000);
      const baseContribution = socialSecurityStore.ssPay.month;

      socialSecurityStore.setSsDiscount(0.05);

      expect(socialSecurityStore.ssIsContributionBaseCapped).toBe(false);
      expect(socialSecurityStore.ssIsAtMinimumContribution).toBe(false);
      expect(socialSecurityStore.ssPay.month).toBeGreaterThan(baseContribution);

      socialSecurityStore.setSsDiscount(-0.05);

      expect(socialSecurityStore.ssIsContributionBaseCapped).toBe(false);
      expect(socialSecurityStore.ssIsAtMinimumContribution).toBe(false);
      expect(socialSecurityStore.ssPay.month).toBeLessThan(baseContribution);
    });

    it("keeps extremely high income capped even at -25%", () => {
      configureMonthlyIncome(50_000);
      socialSecurityStore.setSsDiscount(-0.25);

      expect(socialSecurityStore.ssIsContributionBaseCapped).toBe(true);
      expect(
        socialSecurityStore.ssFirstAvailableDiscountBelowContributionBaseCap,
      ).toBeNull();
      expect(socialSecurityStore.ssPay.month).toBeCloseTo(1_379.34984);
    });

    it("keeps the first-year exemption at zero", () => {
      socialSecurityStore.setSsDiscount(-0.2);
      socialSecurityStore.setSsFirstYear(true);

      expect(socialSecurityStore.ssPay.year).toBe(0);
      expect(socialSecurityStore.ssPay.month).toBe(0);
      expect(socialSecurityStore.ssPay.day).toBe(0);
      expect(socialSecurityStore.ssCalculatedMonthlyContribution).toBeCloseTo(
        1_318.24,
      );
    });

    it("keeps minimum-contribution behavior unchanged", () => {
      configureMonthlyIncome(100);

      expect(socialSecurityStore.ssCalculatedMonthlyContribution).toBeCloseTo(
        14.98,
      );
      expect(socialSecurityStore.ssIsAtMinimumContribution).toBe(true);
      expect(socialSecurityStore.ssPay.month).toBe(20);

      socialSecurityStore.setSsDiscount(-0.25);

      expect(socialSecurityStore.ssIsAtMinimumContribution).toBe(true);
      expect(socialSecurityStore.ssPay.month).toBe(20);
    });
  });

  describe("should calculate the correct specific deductions", () => {
    const taxesStore = useTaxesStore(createPinia());

    it("when the income is below the specific deduction", () => {
      expect(taxesStore.specificDeductions).toBe(4104);
    });

    it("when the income is above the specific deduction", () => {
      const newGrossIncome = 120_000;
      taxesStore.setIncome(newGrossIncome);

      expect(taxesStore.specificDeductions).toBe(120_000 * 0.1);
    });
  });

  it("should calculate correctly the max professional related expenses", () => {
    expect(taxesStore.maxExpenses).toBe(DEFAULT_INCOME * 0.15);
  });

  it("should calculate correctly the expenses needed", () => {
    expect(taxesStore.expensesNeeded).toBe(
      taxesStore.maxExpenses - taxesStore.specificDeductions,
    );
  });

  describe("should calculate correctly the taxable income", () => {
    it("when is first year of activity", () => {
      taxesStore.firstYear = true;

      expect(taxesStore.taxableIncome).toBe(DEFAULT_INCOME * 0.375);
    });

    it("when is second year of activity", () => {
      taxesStore.secondYear = true;

      expect(taxesStore.taxableIncome).toBe(DEFAULT_INCOME * 0.5625);
    });

    it("when is third year of activity and so on", () => {
      expect(taxesStore.taxableIncome).toBe(DEFAULT_INCOME * 0.75);
    });

    it("when expenses are lower than needed", () => {
      const newGrossIncome = 120_000;
      taxesStore.setIncome(newGrossIncome);
      taxesStore.expenses = 1000;

      expect(taxesStore.taxableIncome).toBe(
        newGrossIncome * 0.75 + taxesStore.expensesNeeded - taxesStore.expenses,
      );
    });
  });

  it("should get the correct taxRank value", () => {
    expect(taxesStore.taxRank.max).greaterThanOrEqual(DEFAULT_TAXABLE_INCOME);
    expect(taxesStore.taxRank.min).lessThanOrEqual(DEFAULT_TAXABLE_INCOME);
  });

  SUPPORTED_TAX_RANK_YEARS.forEach((year) => {
    it(`should get the correct taxRanks for ${year}`, () => {
      taxesStore.currentTaxRankYear = year;

      expect(taxesStore.currentTaxRankYear).toEqual(
        taxesStore.getCurrentTaxRankYear,
      );
      expect(taxesStore.taxRanks[year]).toEqual(taxesStore.getTaxRanks);
    });
  });

  it("should get the correct taxRankAvg value", () => {
    const average = taxesStore.getTaxRanks.find(
      (taxRank) =>
        taxesStore.taxRank.id === 1 || taxRank.id === taxesStore.taxRank.id - 1,
    );
    expect(taxesStore.taxRankAvg.max).toEqual(average.max);
    expect(taxesStore.taxRankAvg.min).toEqual(average.min);
  });

  it("should get the correct taxIncomeAvg value", () => {
    expect(taxesStore.taxIncomeAvg).toBe(taxesStore.taxRankAvg.max);

    taxesStore.setIncome(9000);

    expect(taxesStore.taxIncomeAvg).toBe(6_750);
  });

  it("should get the correct taxIncomeNormal value", () => {
    expect(taxesStore.taxIncomeNormal).toBe(
      DEFAULT_TAXABLE_INCOME - taxesStore.taxIncomeAvg,
    );

    taxesStore.setIncome(9000);

    expect(taxesStore.taxIncomeNormal).toBe(0);
  });

  it("should set income and normal taxes to null when user is NHR", () => {
    taxesStore.rnh = true;

    expect(taxesStore.taxIncomeAvg).toBeNull();
    expect(taxesStore.taxIncomeNormal).toBeNull();
  });

  it("should calculate correctly the irs pay", () => {
    const yearIRSCalculation =
      taxesStore.taxIncomeAvg * taxesStore.taxRankAvg.averageTax +
      taxesStore.taxIncomeNormal * taxesStore.taxRank.normalTax;

    expect(taxesStore.irsPay?.year).toBe(yearIRSCalculation);
    expect(taxesStore.irsPay?.month).toBe(yearIRSCalculation / MONTHS_IN_YEAR);
    expect(taxesStore.irsPay?.day).toBe(
      yearIRSCalculation / YEAR_BUSINESS_DAYS,
    );
  });

  it("should calculate correctly the irs pay for NHR", () => {
    taxesStore.rnh = true;

    const yearNHRIRSCalculation = DEFAULT_TAXABLE_INCOME * 0.2;

    expect(taxesStore.irsPay?.year).toBe(yearNHRIRSCalculation);
    expect(taxesStore.irsPay?.month).toBe(
      yearNHRIRSCalculation / MONTHS_IN_YEAR,
    );
    expect(taxesStore.irsPay?.day).toBe(
      yearNHRIRSCalculation / YEAR_BUSINESS_DAYS,
    );
  });

  it("keeps the existing default IRS result for individual assessment without dependents", () => {
    const expectedGrossIrs = 43_000 * 0.27154 + 2_000 * 0.45;

    expect(taxesStore.assessmentScenario).toBe(AssessmentScenario.Individual);
    expect(taxesStore.numberOfDependents).toBe(0);
    expect(taxesStore.grossIrsBeforeDependentDeduction).toBeCloseTo(
      expectedGrossIrs,
    );
    expect(taxesStore.irsPay.year).toBeCloseTo(expectedGrossIrs);
  });

  it("uses assessment divisors for individual and joint-single-income", () => {
    expect(taxesStore.assessmentDivisor).toBe(1);

    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    expect(taxesStore.assessmentDivisor).toBe(2);
  });

  it("uses full taxable income for individual rates and half for joint-single-income", () => {
    expect(taxesStore.taxableIncomeForRates).toBe(DEFAULT_TAXABLE_INCOME);

    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    expect(taxesStore.taxableIncomeForRates).toBe(DEFAULT_TAXABLE_INCOME / 2);
  });

  it("selects the tax band from the quotient in joint-single-income", () => {
    expect(taxesStore.taxRank.id).toBe(8);

    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    expect(taxesStore.taxableIncomeForRates).toBe(22_500);
    expect(taxesStore.taxRank.id).toBe(5);
  });

  it("calculates progressive joint IRS on half the income and multiplies by two", () => {
    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    const expectedGrossIrs = (21_321 * 0.18419 + 1_179 * 0.32) * 2;

    expect(taxesStore.taxIncomeAvg).toBe(21_321);
    expect(taxesStore.taxIncomeNormal).toBe(1_179);
    expect(taxesStore.grossIrsBeforeDependentDeduction).toBeCloseTo(
      expectedGrossIrs,
    );
    expect(taxesStore.irsPay.year).toBeCloseTo(expectedGrossIrs);
  });

  it("applies the dependent deduction once after the quotient calculation", () => {
    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);
    taxesStore.setNumberOfDependents(2);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(1);

    const expectedGrossIrs = (21_321 * 0.18419 + 1_179 * 0.32) * 2;

    expect(taxesStore.dependentTaxDeduction).toBe(1_500);
    expect(taxesStore.dependentTaxDeductionApplied).toBe(1_500);
    expect(taxesStore.grossIrsBeforeDependentDeduction).toBeCloseTo(
      expectedGrossIrs,
    );
    expect(taxesStore.irsPay.year).toBeCloseTo(7_108.78998);
  });

  it("floors final IRS at zero after dependent deduction", () => {
    taxesStore.setIncome(1_000);
    taxesStore.setNumberOfDependents(1);
    taxesStore.setDependentsAged3OrUnder(1);

    expect(taxesStore.grossIrsBeforeDependentDeduction).toBeGreaterThan(0);
    expect(taxesStore.dependentTaxDeduction).toBe(726);
    expect(taxesStore.dependentTaxDeductionApplied).toBeCloseTo(
      taxesStore.grossIrsBeforeDependentDeduction,
    );
    expect(taxesStore.irsPay.year).toBe(0);
  });

  it("does not change social security or Category B values when assessment scenario changes", () => {
    const grossIncome = { ...taxesStore.grossIncome };
    const ssPay = { ...taxesStore.ssPay };
    const taxableIncome = taxesStore.taxableIncome;
    const expensesNeeded = taxesStore.expensesNeeded;
    const specificDeductions = taxesStore.specificDeductions;

    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    expect(taxesStore.grossIncome).toEqual(grossIncome);
    expect(taxesStore.ssPay).toEqual(ssPay);
    expect(taxesStore.taxableIncome).toBe(taxableIncome);
    expect(taxesStore.expensesNeeded).toBe(expensesNeeded);
    expect(taxesStore.specificDeductions).toBe(specificDeductions);
  });

  it("keeps RNH gross IRS unchanged by assessment scenario and applies dependent credits", () => {
    taxesStore.setRnh(true);

    const individualGrossIrs = taxesStore.grossIrsBeforeDependentDeduction;

    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);

    expect(taxesStore.grossIrsBeforeDependentDeduction).toBe(
      individualGrossIrs,
    );
    expect(taxesStore.grossIrsBeforeDependentDeduction).toBe(
      DEFAULT_TAXABLE_INCOME * 0.2,
    );

    taxesStore.setNumberOfDependents(2);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(1);

    expect(taxesStore.dependentTaxDeductionApplied).toBe(1_500);
    expect(taxesStore.irsPay.year).toBe(DEFAULT_TAXABLE_INCOME * 0.2 - 1_500);
  });

  it("keeps dependent age buckets valid when totals or younger buckets change", () => {
    taxesStore.setNumberOfDependents(3);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(2);

    expect(taxesStore.dependentsAged7OrOver).toBe(0);

    taxesStore.setDependentsAged3OrUnder(2);

    expect(taxesStore.dependentsAged3OrUnder).toBe(2);
    expect(taxesStore.dependentsAged4To6).toBe(1);
    expect(taxesStore.dependentsAged7OrOver).toBe(0);

    taxesStore.setNumberOfDependents(1);

    expect(taxesStore.numberOfDependents).toBe(1);
    expect(taxesStore.dependentsAged3OrUnder).toBe(1);
    expect(taxesStore.dependentsAged4To6).toBe(0);
    expect(taxesStore.dependentsAged7OrOver).toBe(0);
  });

  describe("dashboard visibility state", () => {
    it("derives dashboard visibility from valid income only", () => {
      const visibilityStore = useTaxesStore(createPinia());

      expect(visibilityStore.showDashboard).toBe(false);

      visibilityStore.setIncome(50_000, false);

      expect(visibilityStore.showDashboard).toBe(true);

      visibilityStore.reset();

      expect(visibilityStore.income).toBeNull();
      expect(visibilityStore.showDashboard).toBe(false);
    });

    it("hydrates income and empty queries into the matching visibility state", () => {
      const visibilityStore = useTaxesStore(createPinia());

      visibilityStore.setParametersFromURL({ income: "50000" });

      expect(visibilityStore.income).toBe(50_000);
      expect(visibilityStore.showDashboard).toBe(true);

      visibilityStore.setParametersFromURL({});

      expect(visibilityStore.income).toBeNull();
      expect(visibilityStore.showDashboard).toBe(false);
    });

    it("reset preserves stored simulations and automatic-expense defaults", () => {
      const visibilityStore = useTaxesStore(createPinia());
      const storedSimulation = {
        id: "saved-simulation",
        simulationName: "Saved simulation",
        createdAt: "2026-06-24T00:00:00.000Z",
        parameters: { income: "50000" },
      };

      visibilityStore.setStoredSimulations([storedSimulation]);
      visibilityStore.setIncome(60_000, false);
      visibilityStore.setExpensesManual(1_234, false);

      visibilityStore.reset();

      expect(visibilityStore.storedSimulations).toEqual([storedSimulation]);
      expect(visibilityStore.expensesAuto).toBe(true);
      expect(visibilityStore.expenses).toBe(0);
      expect(visibilityStore.showDashboard).toBe(false);
    });

    it("derives visibility deterministically without presentation-only state", () => {
      const visibilityStore = useTaxesStore(createPinia());

      expect(visibilityStore.showDashboard).toBe(false);
      visibilityStore.setIncome(50_000, false);
      expect(visibilityStore.showDashboard).toBe(true);
      visibilityStore.setIncome(null, false);
      expect(visibilityStore.showDashboard).toBe(false);
    });
  });

  it("strictly validates new URL parameters and rejects impossible dependent buckets", () => {
    taxesStore.reset();
    taxesStore.setParametersFromURL({
      assessmentScenario: "joint-single-income",
      numberOfDependents: "3",
      dependentsAged3OrUnder: "1",
      dependentsAged4To6: "1",
    });

    expect(taxesStore.assessmentScenario).toBe(
      AssessmentScenario.JointSingleIncome,
    );
    expect(taxesStore.numberOfDependents).toBe(3);
    expect(taxesStore.dependentsAged3OrUnder).toBe(1);
    expect(taxesStore.dependentsAged4To6).toBe(1);
    expect(taxesStore.dependentsAged7OrOver).toBe(1);

    taxesStore.reset();
    taxesStore.setParametersFromURL({
      assessmentScenario: "invalid",
      numberOfDependents: "2.5",
      dependentsAged3OrUnder: "-1",
      dependentsAged4To6: "abc",
    });

    expect(taxesStore.assessmentScenario).toBe(AssessmentScenario.Individual);
    expect(taxesStore.numberOfDependents).toBe(0);
    expect(taxesStore.dependentsAged3OrUnder).toBe(0);
    expect(taxesStore.dependentsAged4To6).toBe(0);

    taxesStore.setParametersFromURL({
      numberOfDependents: "2",
      dependentsAged3OrUnder: "2",
      dependentsAged4To6: "1",
    });

    expect(taxesStore.numberOfDependents).toBe(2);
    expect(taxesStore.dependentsAged3OrUnder).toBe(2);
    expect(taxesStore.dependentsAged4To6).toBe(0);
  });

  it("hydrates old simulations with new tax state defaults", () => {
    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);
    taxesStore.setNumberOfDependents(3);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(1);
    taxesStore.setSecondYear(true);

    taxesStore.setParametersFromURL({ income: "50000" });

    expect(taxesStore.assessmentScenario).toBe(AssessmentScenario.Individual);
    expect(taxesStore.numberOfDependents).toBe(0);
    expect(taxesStore.dependentsAged3OrUnder).toBe(0);
    expect(taxesStore.dependentsAged4To6).toBe(0);
    expect(taxesStore.firstYear).toBe(false);
    expect(taxesStore.secondYear).toBe(false);
  });

  it("hydrates an old income-only simulation after joint-single-income without leaking dependent state", () => {
    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);
    taxesStore.setNumberOfDependents(2);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(1);

    taxesStore.setParametersFromURL({ income: "50000" });

    expect(taxesStore.assessmentScenario).toBe(AssessmentScenario.Individual);
    expect(taxesStore.numberOfDependents).toBe(0);
    expect(taxesStore.dependentsAged3OrUnder).toBe(0);
    expect(taxesStore.dependentsAged4To6).toBe(0);
  });

  it("hydrates Social Security adjustment passively without URL writes", () => {
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      taxesStore.setParametersFromURL({ income: "50000", ssDiscount: "-0.2" });

      expect(taxesStore.ssDiscount).toBe(-0.2);
      expect(pushSpy).not.toHaveBeenCalled();
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("preserves an explicit Youth IRS URL year while hydrating without URL writes", () => {
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      taxesStore.setParametersFromURL({
        income: "50000",
        currentTaxRankYear: "2025",
        benefitsOfYouthIrs: "true",
        yearOfYouthIrs: "2",
      });

      expect(taxesStore.currentTaxRankYear).toBe(2025);
      expect(taxesStore.benefitsOfYouthIrs).toBe(true);
      expect(taxesStore.yearOfYouthIrs).toBe(2);
      expect(pushSpy).not.toHaveBeenCalled();
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("resets Youth IRS year atomically when a user changes tax year while Youth IRS is active", () => {
    taxesStore.setIncome(50_000, false);
    taxesStore.setCurrentTaxRankYear(2025, false);
    taxesStore.setBenefitsOfYouthIrs(true, false);
    taxesStore.setYearOfYouthIrs(2, false);

    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      taxesStore.setCurrentTaxRankYearFromUser(2024);

      expect(taxesStore.currentTaxRankYear).toBe(2024);
      expect(taxesStore.yearOfYouthIrs).toBe(1);
      expect(taxesStore.expenses).toBe(taxesStore.expensesNeeded);
      expect(pushSpy).toHaveBeenCalledTimes(1);
      expect(pushSpy.mock.calls[0]?.[0]).toMatchObject({
        query: {
          currentTaxRankYear: 2024,
          yearOfYouthIrs: 1,
        },
      });
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("changes only the tax year from the user action when Youth IRS is inactive", () => {
    taxesStore.setCurrentTaxRankYear(2025, false);
    taxesStore.setBenefitsOfYouthIrs(false, false);
    taxesStore.setYearOfYouthIrs(2, false);

    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      taxesStore.setCurrentTaxRankYearFromUser(2024);

      expect(taxesStore.currentTaxRankYear).toBe(2024);
      expect(taxesStore.yearOfYouthIrs).toBe(2);
      expect(pushSpy).toHaveBeenCalledTimes(1);
      expect(pushSpy.mock.calls[0]?.[0]).toMatchObject({
        query: {
          currentTaxRankYear: 2024,
        },
      });
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("keeps the generic tax year setter passive when syncUrl is false", () => {
    taxesStore.setCurrentTaxRankYear(2025, false);
    taxesStore.setBenefitsOfYouthIrs(true, false);
    taxesStore.setYearOfYouthIrs(2, false);

    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      taxesStore.setCurrentTaxRankYear(2024, false);

      expect(taxesStore.currentTaxRankYear).toBe(2024);
      expect(taxesStore.yearOfYouthIrs).toBe(2);
      expect(pushSpy).not.toHaveBeenCalled();
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("resets all simulation inputs omitted from legacy URLs before hydrating income", () => {
    taxesStore.setExpensesManual(1234);
    taxesStore.setSsDiscount(-0.2);
    taxesStore.setCurrentTaxRankYear(2024);
    taxesStore.setSsFirstYear(true);
    taxesStore.setFirstYear(true);
    taxesStore.setRnh(true);
    taxesStore.setBenefitsOfYouthIrs(true);
    taxesStore.setYearOfYouthIrs(2);

    taxesStore.setParametersFromURL({ income: "50000" });

    expect(taxesStore.income).toBe(50000);
    expect(taxesStore.incomeFrequency).toBe(FrequencyChoices.Year);
    expect(taxesStore.displayFrequency).toBe(FrequencyChoices.Month);
    expect(taxesStore.nrMonthsDisplay).toBe(12);
    expect(taxesStore.nrDaysOff).toBe(0);
    expect(taxesStore.ssDiscount).toBe(0);
    expect(taxesStore.expensesAuto).toBe(true);
    expect(taxesStore.expenses).toBe(taxesStore.expensesNeeded);
    expect(taxesStore.currentTaxRankYear).toBe(DEFAULT_TAX_RANK_YEAR);
    expect(taxesStore.ssFirstYear).toBe(false);
    expect(taxesStore.firstYear).toBe(false);
    expect(taxesStore.secondYear).toBe(false);
    expect(taxesStore.rnh).toBe(false);
    expect(taxesStore.benefitsOfYouthIrs).toBe(false);
    expect(taxesStore.yearOfYouthIrs).toBe(1);
  });

  it("hydrates expenses as manual only when a valid expenses parameter is present", () => {
    taxesStore.setParametersFromURL({ income: "60000" });

    expect(taxesStore.expensesAuto).toBe(true);
    expect(taxesStore.expenses).toBe(taxesStore.expensesNeeded);

    taxesStore.setParametersFromURL({ income: "60000", expenses: "0" });

    expect(taxesStore.expensesAuto).toBe(false);
    expect(taxesStore.expenses).toBe(0);

    taxesStore.setParametersFromURL({ income: "60000", expenses: "-1" });

    expect(taxesStore.expensesAuto).toBe(true);
    expect(taxesStore.expenses).toBe(taxesStore.expensesNeeded);
  });

  it("recalculates automatic expenses after dependent inputs change and preserves manual expenses", () => {
    taxesStore.setIncome(60000);
    taxesStore.setExpensesAuto(false);

    const expensesBeforeExemption = taxesStore.expenses;
    taxesStore.setSsFirstYear(true);

    expect(taxesStore.expensesAuto).toBe(true);
    expect(taxesStore.expenses).toBe(taxesStore.expensesNeeded);
    expect(taxesStore.expenses).not.toBe(expensesBeforeExemption);

    taxesStore.setExpensesManual(1234);
    taxesStore.setIncome(100000);

    expect(taxesStore.expensesAuto).toBe(false);
    expect(taxesStore.expenses).toBe(1234);
  });

  it("hydrates URL parameters without pushing intermediate router navigations", () => {
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    taxesStore.setParametersFromURL({
      income: "50000",
      ssDiscount: "-0.05",
      currentTaxRankYear: "2024",
      ssFirstYear: "true",
    });

    expect(pushSpy).not.toHaveBeenCalled();
    pushSpy.mockRestore();
  });

  it("hydrates legacy activity-year URL flags after resetting defaults", () => {
    taxesStore.setFirstYear(true);

    taxesStore.setParametersFromURL({ income: "50000", secondYear: "true" });

    expect(taxesStore.firstYear).toBe(false);
    expect(taxesStore.secondYear).toBe(true);
  });

  it("resets assessment scenario and dependent state", () => {
    taxesStore.setAssessmentScenario(AssessmentScenario.JointSingleIncome);
    taxesStore.setNumberOfDependents(3);
    taxesStore.setDependentsAged3OrUnder(1);
    taxesStore.setDependentsAged4To6(1);

    taxesStore.reset();

    expect(taxesStore.assessmentScenario).toBe(AssessmentScenario.Individual);
    expect(taxesStore.numberOfDependents).toBe(0);
    expect(taxesStore.dependentsAged3OrUnder).toBe(0);
    expect(taxesStore.dependentsAged4To6).toBe(0);
    expect(taxesStore.dependentsAged7OrOver).toBe(0);
  });

  it("should show taxes displayed correctly", () => {
    expect(taxesStore.taxesDisplay).toBe(
      asCurrency(taxesStore.irsPay?.month + taxesStore.ssPay?.month),
    );
  });

  it("should calculate correctly the net income", () => {
    expect(taxesStore.netIncome.year).toBe(
      DEFAULT_INCOME - taxesStore.irsPay?.year - taxesStore.ssPay?.year,
    );

    expect(taxesStore.netIncome.month).toBe(
      DEFAULT_INCOME / MONTHS_IN_YEAR -
        taxesStore.irsPay?.month -
        taxesStore.ssPay?.month,
    );

    expect(taxesStore.netIncome.day).toBe(
      (DEFAULT_INCOME - taxesStore.irsPay?.year - taxesStore.ssPay?.year) /
        YEAR_BUSINESS_DAYS,
    );
  });

  describe("Tax store frequency calculations and displays", () => {
    const tests = [
      { key: "irs", payProperty: "irsPay" },
      { key: "ss", payProperty: "ssPay" },
      { key: "netIncome", payProperty: "netIncome" },
    ];

    tests.forEach(({ key, payProperty }) => {
      it(`should calculate correctly the ${key} frequency`, () => {
        expect(taxesStore[`${key}Frequency`]).toBe(
          taxesStore[payProperty]?.month,
        );
      });

      it(`should show ${key} displayed correctly`, () => {
        expect(taxesStore[`${key}Display`]).toBe(
          asCurrency(taxesStore[`${key}Frequency`]),
        );
      });
    });
  });

  it("should get the correctly values when tax year changes", () => {
    expect(taxesStore.getTaxRanks[0].max).toEqual(7703);
    expect(taxesStore.getTaxRanks[1].max).toEqual(11623);
    expect(taxesStore.getTaxRanks[2].max).toEqual(16472);
    expect(taxesStore.getTaxRanks[3].max).toEqual(21321);
    expect(taxesStore.getTaxRanks[4].max).toEqual(27146);
    expect(taxesStore.getTaxRanks[5].max).toEqual(39791);
    expect(taxesStore.getTaxRanks[6].max).toEqual(43000);
    expect(taxesStore.getTaxRanks[7].max).toEqual(80000);
    expect(taxesStore.getTaxRanks[8].max).toBeFalsy();

    taxesStore.setCurrentTaxRankYear(2023);

    expect(taxesStore.getTaxRanks[0].max).toEqual(7479);
    expect(taxesStore.getTaxRanks[1].max).toEqual(11284);
    expect(taxesStore.getTaxRanks[2].max).toEqual(15992);
    expect(taxesStore.getTaxRanks[3].max).toEqual(20700);
    expect(taxesStore.getTaxRanks[4].max).toEqual(26355);
    expect(taxesStore.getTaxRanks[5].max).toEqual(38632);
    expect(taxesStore.getTaxRanks[6].max).toEqual(50483);
    expect(taxesStore.getTaxRanks[7].max).toEqual(78834);
    expect(taxesStore.getTaxRanks[8].max).toBeFalsy();

    taxesStore.setCurrentTaxRankYear(2026);

    expect(taxesStore.getTaxRanks[0].max).toEqual(8342);
    expect(taxesStore.getTaxRanks[1].max).toEqual(12587);
    expect(taxesStore.getTaxRanks[2].max).toEqual(17838);
    expect(taxesStore.getTaxRanks[3].max).toEqual(23089);
    expect(taxesStore.getTaxRanks[4].max).toEqual(29397);
    expect(taxesStore.getTaxRanks[5].max).toEqual(43090);
    expect(taxesStore.getTaxRanks[6].max).toEqual(46566);
    expect(taxesStore.getTaxRanks[7].max).toEqual(86634);
    expect(taxesStore.getTaxRanks[8].max).toBeFalsy();
  });
});
