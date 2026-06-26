import { defineStore } from "pinia";
import {
  AssessmentScenario,
  FrequencyChoices,
  GrossIncome,
  TaxRank,
  Colors,
  YouthIrsRank,
  YouthIrs,
} from "@/typings";
import { generateUUID } from "@/utils.js";
import { updateUrlQuery, clearUrlQuery } from "@/router";
import { calculateDependentTaxDeduction } from "@/store/dependentDeduction";

export const YEAR_BUSINESS_DAYS = 248;
//export const MONTH_BUSINESS_DAYS = 22; // No longer used by this simulator, only year business days are taken into account
export const SUPPORTED_TAX_RANK_YEARS = [2023, 2024, 2025, 2026].sort(
  (a, b) => b - a,
);
export const DEFAULT_TAX_RANK_YEAR: (typeof SUPPORTED_TAX_RANK_YEARS)[number] = 2025;
const SIMULATIONS_LOCAL_STORE_KEY = "net_income_simulations";
const ASSESSMENT_SCENARIOS = Object.values(AssessmentScenario);
const FALLBACK_TAX_RANK: TaxRank = {
  id: 1,
  min: 0,
  max: null,
  normalTax: 0,
  averageTax: 0,
};

const normalizeNonNegativeInteger = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.trunc(value), 0);
};

const parseStrictNonNegativeInteger = (value: unknown) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return NaN;
  }

  return Number(value);
};

interface SimulationInputState {
  income: number | null;
  incomeFrequency: FrequencyChoices;
  displayFrequency: FrequencyChoices;
  nrMonthsDisplay: number;
  nrDaysOff: number;
  ssDiscount: number;
  expenses: number;
  expensesAuto: boolean;
  currentTaxRankYear: (typeof SUPPORTED_TAX_RANK_YEARS)[number];
  firstYear: boolean;
  secondYear: boolean;
  ssFirstYear: boolean;
  rnh: boolean;
  benefitsOfYouthIrs: boolean;
  yearOfYouthIrs: number;
  assessmentScenario: AssessmentScenario;
  numberOfDependents: number;
  dependentsAged3OrUnder: number;
  dependentsAged4To6: number;
}

export const createDefaultSimulationInputs = (): SimulationInputState => ({
  income: null,
  incomeFrequency: FrequencyChoices.Year,
  displayFrequency: FrequencyChoices.Month,
  nrMonthsDisplay: 12,
  nrDaysOff: 0,
  ssDiscount: 0,
  expenses: 0,
  expensesAuto: true,
  currentTaxRankYear: DEFAULT_TAX_RANK_YEAR,
  ssFirstYear: false,
  firstYear: false,
  secondYear: false,
  rnh: false,
  benefitsOfYouthIrs: false,
  yearOfYouthIrs: 1,
  assessmentScenario: AssessmentScenario.Individual,
  numberOfDependents: 0,
  dependentsAged3OrUnder: 0,
  dependentsAged4To6: 0,
});

interface TaxesState extends SimulationInputState {
  defaultIncomes: number[];
  ssTax: number;
  expensesTax: number;
  maxExpensesTax: number;
  ssDiscountChoices: number[];
  taxRanks: { [K in (typeof SUPPORTED_TAX_RANK_YEARS)[number]]: TaxRank[] };
  iasPerYear: { [K in (typeof SUPPORTED_TAX_RANK_YEARS)[number]]: number };
  youthIrs: { [K in (typeof SUPPORTED_TAX_RANK_YEARS)[number]]: YouthIrs };
  colors: Colors;
  rnhTax: number;
  storedSimulations:
    | [
        {
          id: string;
          simulationName: string;
          createdAt: string;
          parameters: Record<string, string>;
        },
      ]
    | null;
}
const useTaxesStore = defineStore({
  id: "taxes",
  state: (): TaxesState => ({
    ...createDefaultSimulationInputs(),
    defaultIncomes: [30000, 50000, 60000, 70000, 100000],
    ssDiscountChoices: [
      -0.25, -0.2, -0.15, -0.1, -0.05, 0, +0.05, +0.1, +0.15, +0.2, +0.25,
    ],
    expensesTax: 15,
    maxExpensesTax: 15,
    ssTax: 0.214,
    taxRanks: {
      2023: [
        { id: 1, min: 0, max: 7479, normalTax: 0.145, averageTax: 0.145 },
        { id: 2, min: 7479, max: 11284, normalTax: 0.21, averageTax: 0.1669 },
        { id: 3, min: 11284, max: 15992, normalTax: 0.265, averageTax: 0.1958 },
        { id: 4, min: 15992, max: 20700, normalTax: 0.285, averageTax: 0.2161 },
        { id: 5, min: 20700, max: 26355, normalTax: 0.35, averageTax: 0.2448 },
        { id: 6, min: 26355, max: 38632, normalTax: 0.37, averageTax: 0.2846 },
        { id: 7, min: 38632, max: 50483, normalTax: 0.435, averageTax: 0.3199 },
        { id: 8, min: 50483, max: 78834, normalTax: 0.45, averageTax: 0.3667 },
        { id: 9, min: 78834, normalTax: 0.48, max: null, averageTax: null },
      ],
      2024: [
        { id: 1, min: 0, max: 7703, normalTax: 0.13, averageTax: 0.13 },
        { id: 2, min: 7703, max: 11623, normalTax: 0.165, averageTax: 0.1418 },
        { id: 3, min: 11623, max: 16472, normalTax: 0.22, averageTax: 0.16482 },
        { id: 4, min: 16472, max: 21321, normalTax: 0.25, averageTax: 0.18419 },
        { id: 5, min: 21321, max: 27146, normalTax: 0.32, averageTax: 0.21334 },
        { id: 6, min: 27146, max: 39791, normalTax: 0.35, averageTax: 0.25835 },
        {
          id: 7,
          min: 39791,
          max: 43000,
          normalTax: 0.435,
          averageTax: 0.27154,
        },
        { id: 8, min: 43000, max: 80000, normalTax: 0.45, averageTax: 0.35408 },
        { id: 9, min: 80000, normalTax: 0.48, max: null, averageTax: null },
      ],
      2025: [
        { id: 1, min: 0, max: 8059, normalTax: 0.13, averageTax: 0.13 },
        { id: 2, min: 8059, max: 12160, normalTax: 0.165, averageTax: 0.1418 },
        { id: 3, min: 12160, max: 17233, normalTax: 0.22, averageTax: 0.16482 },
        { id: 4, min: 17233, max: 22306, normalTax: 0.25, averageTax: 0.18419 },
        { id: 5, min: 22306, max: 28400, normalTax: 0.32, averageTax: 0.21334 },
        {
          id: 6,
          min: 28400,
          max: 41629,
          normalTax: 0.355,
          averageTax: 0.25835,
        },
        {
          id: 7,
          min: 41629,
          max: 44987,
          normalTax: 0.435,
          averageTax: 0.27154,
        },
        { id: 8, min: 44987, max: 83696, normalTax: 0.45, averageTax: 0.35408 },
        { id: 9, min: 83696, normalTax: 0.48, max: null, averageTax: null },
      ],
      2026: [
        { id: 1, min: 0, max: 8342, normalTax: 0.125, averageTax: 0.125 },
        { id: 2, min: 8342, max: 12587, normalTax: 0.157, averageTax: 0.13579 },
        {
          id: 3,
          min: 12587,
          max: 17838,
          normalTax: 0.212,
          averageTax: 0.15823,
        },
        {
          id: 4,
          min: 17838,
          max: 23089,
          normalTax: 0.241,
          averageTax: 0.17705,
        },
        {
          id: 5,
          min: 23089,
          max: 29397,
          normalTax: 0.311,
          averageTax: 0.20579,
        },
        { id: 6, min: 29397, max: 43090, normalTax: 0.349, averageTax: 0.2513 },
        {
          id: 7,
          min: 43090,
          max: 46566,
          normalTax: 0.431,
          averageTax: 0.26472,
        },
        {
          id: 8,
          min: 46566,
          max: 86634,
          normalTax: 0.446,
          averageTax: 0.34856,
        },
        { id: 9, min: 86634, normalTax: 0.48, max: null, averageTax: null },
      ],
    },
    iasPerYear: {
      2023: 480.43,
      2024: 509.26,
      2025: 522.5,
      2026: 537.13,
    },
    rnhTax: 0.2,
    colors: {
      netIncome: "#76c479",
      irs: "#ff6384",
      ss: "#36a2eb",
    },
    youthIrs: {
      2023: {
        1: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 12.5 },
        2: { maxDiscountPercentage: 0.4, maxDiscountIasMultiplier: 10 },
        3: { maxDiscountPercentage: 0.3, maxDiscountIasMultiplier: 7.5 },
        4: { maxDiscountPercentage: 0.3, maxDiscountIasMultiplier: 7.5 },
        5: { maxDiscountPercentage: 0.2, maxDiscountIasMultiplier: 5 },
      },
      2024: {
        1: { maxDiscountPercentage: 1, maxDiscountIasMultiplier: 40 },
        2: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 30 },
        3: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 20 },
        4: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 20 },
        5: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 10 },
      },
      2025: {
        1: { maxDiscountPercentage: 1, maxDiscountIasMultiplier: 55 },
        2: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        3: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        4: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        5: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        6: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        7: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        8: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
        9: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
        10: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
      },
      2026: {
        1: { maxDiscountPercentage: 1, maxDiscountIasMultiplier: 55 },
        2: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        3: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        4: { maxDiscountPercentage: 0.75, maxDiscountIasMultiplier: 55 },
        5: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        6: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        7: { maxDiscountPercentage: 0.5, maxDiscountIasMultiplier: 55 },
        8: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
        9: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
        10: { maxDiscountPercentage: 0.25, maxDiscountIasMultiplier: 55 },
      },
    },
    storedSimulations: null,
  }),
  getters: {
    showDashboard: (state) => {
      return (
        state.income !== null &&
        Number.isFinite(state.income) &&
        state.income > 0
      );
    },

    grossIncome: (state) => {
      const result: GrossIncome = {
        year: 0,
        month: 0,
        day: 0,
      };
      if (state.nrMonthsDisplay) {
        switch (state.incomeFrequency) {
          case FrequencyChoices.Year:
            result.year = state.income;
            result.month = state.income / state.nrMonthsDisplay;
            result.day = state.income / (YEAR_BUSINESS_DAYS - state.nrDaysOff);
            break;
          case FrequencyChoices.Month:
            result.year = state.income * state.nrMonthsDisplay;
            result.month = state.income;
            result.day = result.year / (YEAR_BUSINESS_DAYS - state.nrDaysOff);
            break;
          case FrequencyChoices.Day:
            result.year = state.income * (YEAR_BUSINESS_DAYS - state.nrDaysOff);
            result.month = result.year / state.nrMonthsDisplay;
            result.day = state.income;
        }
      }
      return result;
    },
    ssRelevantIncomeBeforeAdjustment() {
      return this.grossIncome.month * 0.7;
    },
    ssAdjustedRelevantIncome() {
      return this.ssRelevantIncomeBeforeAdjustment * (1 + this.ssDiscount);
    },
    ssContributionBaseCap() {
      return this.maxSsIncome;
    },
    ssContributionBase() {
      return Math.min(
        this.ssContributionBaseCap,
        this.ssAdjustedRelevantIncome,
      );
    },
    ssCalculatedMonthlyContribution() {
      return this.ssTax * this.ssContributionBase;
    },
    ssFinalMonthlyContribution() {
      if (this.ssFirstYear) {
        return 0;
      }

      return Math.max(this.ssCalculatedMonthlyContribution, 20);
    },
    ssIsContributionBaseCapped() {
      return this.ssAdjustedRelevantIncome >= this.ssContributionBaseCap;
    },
    ssIsAtMinimumContribution() {
      return !this.ssFirstYear && this.ssCalculatedMonthlyContribution < 20;
    },
    ssFirstAvailableDiscountBelowContributionBaseCap(): number | null {
      const sortedChoices = [...this.ssDiscountChoices].sort((a, b) => b - a);
      const firstAvailableDiscount = sortedChoices.find(
        (choice) =>
          this.ssRelevantIncomeBeforeAdjustment * (1 + choice) <
          this.ssContributionBaseCap,
      );

      return firstAvailableDiscount ?? null;
    },
    ssPay() {
      if (this.ssFirstYear) {
        return {
          year: 0,
          month: 0,
          day: 0,
        };
      }
      const yearSSPay = this.ssFinalMonthlyContribution * 12;
      return {
        year: yearSSPay,
        month: this.ssFinalMonthlyContribution,
        day: yearSSPay / (YEAR_BUSINESS_DAYS - this.nrDaysOff),
      };
    },
    specificDeductions() {
      return Math.max(
        4104,
        Math.min(this.ssPay.year, 0.1 * this.grossIncome.year),
      );
    },

    maxExpenses() {
      if (this.income === null) {
        return null;
      }
      const grossIncome = this.grossIncome.year;
      return (this.maxExpensesTax / 100) * grossIncome;
    },

    hasExpenses() {
      return this.expenses > 0;
    },
    expensesNeeded() {
      const expenses = this.maxExpenses - this.specificDeductions;
      return expenses > 0 ? expenses : 0;
    },
    taxableIncome() {
      const grossIncome = this.grossIncome.year;
      const expensesMissing =
        this.expensesNeeded > this.expenses
          ? this.expensesNeeded - this.expenses
          : 0;

      return (
        (grossIncome - this.youthIrsDiscount) *
          (this.firstYear ? 0.375 : this.secondYear ? 0.5625 : 0.75) +
        expensesMissing
      );
    },
    youthIrsDiscount() {
      if (!this.benefitsOfYouthIrs) {
        return 0;
      }
      const youthIrsRank =
        this.youthIrs[this.currentTaxRankYear][this.yearOfYouthIrs];
      const maxDiscount =
        youthIrsRank.maxDiscountPercentage * this.grossIncome.year;
      const maxDiscountIas =
        youthIrsRank.maxDiscountIasMultiplier * this.currentIas;
      return Math.min(maxDiscount, maxDiscountIas);
    },
    youthIrsRange() {
      return Object.keys(this.youthIrs[this.currentTaxRankYear]).length;
    },
    assessmentDivisor() {
      return this.assessmentScenario === AssessmentScenario.JointSingleIncome
        ? 2
        : 1;
    },
    taxableIncomeForRates() {
      return this.taxableIncome / this.assessmentDivisor;
    },
    dependentsAged7OrOver() {
      return (
        this.numberOfDependents -
        this.dependentsAged3OrUnder -
        this.dependentsAged4To6
      );
    },
    dependentTaxDeduction() {
      return calculateDependentTaxDeduction(
        this.numberOfDependents,
        this.dependentsAged3OrUnder,
        this.dependentsAged4To6,
      );
    },
    taxRank(): TaxRank {
      return (
        this.taxRanks[this.currentTaxRankYear].filter(
          (taxRank: TaxRank, index: number) => {
            const isLastRank =
              index === this.taxRanks[this.currentTaxRankYear].length - 1;
            const isBiggerThanMin = taxRank.min <= this.taxableIncomeForRates;
            const isSmallerThanMax =
              taxRank.max !== null && taxRank.max >= this.taxableIncomeForRates;

            if (isLastRank && isBiggerThanMin) {
              return taxRank;
            }
            return isBiggerThanMin && isSmallerThanMax;
          },
        )[0] ?? FALLBACK_TAX_RANK
      );
    },
    getTaxRanks(): TaxRank[] {
      return this.taxRanks[this.currentTaxRankYear];
    },
    getCurrentTaxRankYear(): (typeof SUPPORTED_TAX_RANK_YEARS)[number] {
      return this.currentTaxRankYear;
    },
    maxSsIncome() {
      return 12 * this.currentIas;
    },
    currentIas() {
      return this.iasPerYear[this.currentTaxRankYear];
    },
    taxRankAvg(): TaxRank {
      if (this.taxRank === undefined || this.taxRank.id === 1) {
        return this.taxRank;
      }
      const avgID = this.taxRank.id - 1;
      return (
        this.taxRanks[this.currentTaxRankYear].filter(
          (taxRank: TaxRank) => taxRank.id == avgID,
        )[0] ?? this.taxRank
      );
    },
    taxIncomeAvg() {
      if (this.rnh) {
        return null;
      }
      if (this.taxRank.id <= 1) {
        return this.taxableIncomeForRates;
      }
      return this.taxRankAvg.max;
    },
    taxIncomeNormal() {
      if (this.rnh) {
        return null;
      }
      if (this.taxRank.id <= 1) {
        return 0;
      }
      return this.taxableIncomeForRates - this.taxIncomeAvg;
    },
    grossIrsBeforeDependentDeduction() {
      if (this.rnh) {
        return this.taxableIncome * this.rnhTax;
      }

      const progressiveIrsForOneUnit =
        this.taxIncomeAvg * this.taxRankAvg.averageTax +
        this.taxIncomeNormal * this.taxRank.normalTax;

      return progressiveIrsForOneUnit * this.assessmentDivisor;
    },
    dependentTaxDeductionApplied() {
      return Math.min(
        Math.max(this.grossIrsBeforeDependentDeduction, 0),
        this.dependentTaxDeduction,
      );
    },
    irsPay() {
      const yearIRS =
        this.grossIrsBeforeDependentDeduction -
        this.dependentTaxDeductionApplied;
      const monthIRS = Math.max(yearIRS / this.nrMonthsDisplay, 0);
      const yearIrsPay = Math.max(yearIRS, 0);
      return {
        year: yearIrsPay,
        month: monthIRS,
        day: yearIrsPay / (YEAR_BUSINESS_DAYS - this.nrDaysOff),
      };
    },
    netIncome() {
      const monthIncome =
        this.grossIncome.month - this.irsPay.month - this.ssPay.month;
      const yearIncome =
        this.grossIncome.year - this.irsPay.year - this.ssPay.year;
      return {
        year: yearIncome,
        month: monthIncome,
        day: yearIncome / (YEAR_BUSINESS_DAYS - this.nrDaysOff),
      };
    },
    irsFrequency() {
      return this.irsPay[this.displayFrequency];
    },
    ssFrequency() {
      return this.ssPay[this.displayFrequency];
    },
    taxesFrequency() {
      return this.irsFrequency + this.ssFrequency;
    },
    netIncomeFrequency() {
      return this.netIncome[this.displayFrequency];
    },
    hasStoredSimulations() {
      return this.storedSimulations && this.storedSimulations.length > 0;
    },
    storedSimulationsCount() {
      return this.storedSimulations && this.storedSimulations.length;
    },
  },
  actions: {
    resetSimulationInputs() {
      Object.assign(this, createDefaultSimulationInputs());
    },
    recalculateAutomaticExpenses() {
      if (!this.expensesAuto) {
        return;
      }

      this.expenses = this.expensesNeeded;
    },
    setIncome(value: number | null, syncUrl = true) {
      if (!Number.isFinite(value) || value === null || value <= 0) {
        this.income = null;
      } else {
        this.income = value;
      }
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ income: this.income });
      }
    },
    setSsDiscount(value: number, syncUrl = true) {
      this.ssDiscount = value;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ ssDiscount: this.ssDiscount });
      }
    },
    setIncomeFrequency(frequency: FrequencyChoices, syncUrl = true) {
      this.incomeFrequency = frequency;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ incomeFrequency: this.incomeFrequency });
      }
    },
    setDisplayFrequency(frequency: FrequencyChoices, syncUrl = true) {
      this.displayFrequency = frequency;
      if (syncUrl) {
        updateUrlQuery({ displayFrequency: this.displayFrequency });
      }
    },
    setNrMonthsDisplay(nrMonthsDisplay: number, syncUrl = true) {
      this.nrMonthsDisplay = nrMonthsDisplay;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ nrMonthsDisplay: this.nrMonthsDisplay });
      }
    },
    setNrDaysOff(nrDaysOff: number, syncUrl = true) {
      this.nrDaysOff = nrDaysOff;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ nrDaysOff: this.nrDaysOff });
      }
    },
    setCurrentTaxRankYear(
      taxRankYear: (typeof SUPPORTED_TAX_RANK_YEARS)[number],
      syncUrl = true,
    ) {
      this.currentTaxRankYear = taxRankYear;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ currentTaxRankYear: this.currentTaxRankYear });
      }
    },
    setCurrentTaxRankYearFromUser(
      taxRankYear: (typeof SUPPORTED_TAX_RANK_YEARS)[number],
    ) {
      this.setCurrentTaxRankYear(taxRankYear, false);

      const updatedQuery: {
        currentTaxRankYear: (typeof SUPPORTED_TAX_RANK_YEARS)[number];
        yearOfYouthIrs?: number;
      } = {
        currentTaxRankYear: this.currentTaxRankYear,
      };

      if (this.benefitsOfYouthIrs) {
        this.setYearOfYouthIrs(1, false);
        updatedQuery.yearOfYouthIrs = this.yearOfYouthIrs;
      }

      updateUrlQuery(updatedQuery);
    },
    setExpenses(value: number, syncUrl = true) {
      if (value < 0) {
        this.expenses = 0;
      } else {
        this.expenses = value;
      }
      if (syncUrl) {
        updateUrlQuery({ expenses: this.expenses });
      }
    },
    setExpensesManual(value: number, syncUrl = true) {
      this.expensesAuto = false;
      this.setExpenses(value, syncUrl);
    },
    setExpensesAuto(syncUrl = true) {
      this.expensesAuto = true;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({
          expenses: undefined,
        });
      }
    },
    setSsFirstYear(value: boolean, syncUrl = true) {
      this.ssFirstYear = value;
      this.recalculateAutomaticExpenses();
      if (syncUrl) {
        updateUrlQuery({ ssFirstYear: this.ssFirstYear });
      }
    },
    setBenefitsOfYouthIrs(value: boolean, syncUrl = true) {
      this.benefitsOfYouthIrs = value;
      if (syncUrl) {
        updateUrlQuery({ benefitsOfYouthIrs: this.benefitsOfYouthIrs });
      }
    },
    setYearOfYouthIrs(year: number, syncUrl = true) {
      if (this.isYearOfYouthIrsValid(year)) {
        this.yearOfYouthIrs = year;
        if (syncUrl) {
          updateUrlQuery({ yearOfYouthIrs: this.yearOfYouthIrs });
        }
      }
    },
    setFirstYear(value: boolean, syncUrl = true) {
      this.firstYear = value;
      if (value === true && this.secondYear === true) {
        this.secondYear = false;
        if (syncUrl) {
          updateUrlQuery({
            firstYear: this.firstYear,
            secondYear: this.secondYear,
          });
        }
      } else if (syncUrl) {
        updateUrlQuery({ firstYear: this.firstYear });
      }
    },
    setSecondYear(value: boolean, syncUrl = true) {
      this.secondYear = value;
      if (value === true) {
        this.firstYear = false;
        if (syncUrl) {
          updateUrlQuery({
            firstYear: this.firstYear,
            secondYear: this.secondYear,
          });
        }
      } else if (syncUrl) {
        updateUrlQuery({ secondYear: this.secondYear });
      }
    },
    setRnh(value: boolean, syncUrl = true) {
      this.rnh = value;
      if (syncUrl) {
        updateUrlQuery({ rnh: this.rnh });
      }
    },
    setAssessmentScenario(value: AssessmentScenario, syncUrl = true) {
      if (!ASSESSMENT_SCENARIOS.includes(value)) {
        return;
      }

      this.assessmentScenario = value;
      if (syncUrl) {
        updateUrlQuery({ assessmentScenario: this.assessmentScenario });
      }
    },
    setNumberOfDependents(value: number, syncUrl = true) {
      const total = normalizeNonNegativeInteger(value);
      const young = Math.min(this.dependentsAged3OrUnder, total);
      const middle = Math.min(this.dependentsAged4To6, total - young);

      this.numberOfDependents = total;
      this.dependentsAged3OrUnder = young;
      this.dependentsAged4To6 = middle;
      if (syncUrl) {
        updateUrlQuery({
          numberOfDependents: this.numberOfDependents,
          dependentsAged3OrUnder: this.dependentsAged3OrUnder,
          dependentsAged4To6: this.dependentsAged4To6,
        });
      }
    },
    setDependentsAged3OrUnder(value: number, syncUrl = true) {
      const young = Math.min(
        normalizeNonNegativeInteger(value),
        this.numberOfDependents,
      );
      const middle = Math.min(
        this.dependentsAged4To6,
        this.numberOfDependents - young,
      );

      this.dependentsAged3OrUnder = young;
      this.dependentsAged4To6 = middle;
      if (syncUrl) {
        updateUrlQuery({
          numberOfDependents: this.numberOfDependents,
          dependentsAged3OrUnder: this.dependentsAged3OrUnder,
          dependentsAged4To6: this.dependentsAged4To6,
        });
      }
    },
    setDependentsAged4To6(value: number, syncUrl = true) {
      const middle = Math.min(
        normalizeNonNegativeInteger(value),
        this.numberOfDependents - this.dependentsAged3OrUnder,
      );

      this.dependentsAged4To6 = middle;
      if (syncUrl) {
        updateUrlQuery({
          numberOfDependents: this.numberOfDependents,
          dependentsAged3OrUnder: this.dependentsAged3OrUnder,
          dependentsAged4To6: this.dependentsAged4To6,
        });
      }
    },
    setParameterFromUrl(
      value: any,
      setter: CallableFunction,
      parser: Function | null = null,
      validator: CallableFunction | null = null,
    ): boolean {
      if (value === undefined) {
        // undefined means the parameter was not in the URL
        return false;
      }
      if (parser !== null) {
        value = parser(value);
      }

      if (validator !== null && !validator(value)) {
        return false;
      }

      setter(value, false);
      return true;
    },
    setParametersFromURL(params: Record<string, unknown>) {
      const numericValidator = (value: number) => !isNaN(value);
      const positiveNumericValidator = (value: number) =>
        numericValidator(value) && value > 0;
      const nonNegativeNumericValidator = (value: number) =>
        numericValidator(value) && value >= 0;
      const booleanParser = (value: unknown) =>
        typeof value === "string" && value.toLowerCase() === "true";
      const frequencyChoicesValidator = (value: string) =>
        Object.values(FrequencyChoices).includes(value as FrequencyChoices);
      const taxRankYearValidator = (value: number) =>
        SUPPORTED_TAX_RANK_YEARS.includes(
          value as (typeof SUPPORTED_TAX_RANK_YEARS)[number],
        );
      const nonNegativeIntegerValidator = (value: number) =>
        Number.isInteger(value) && value >= 0;
      const assessmentScenarioValidator = (value: string) =>
        ASSESSMENT_SCENARIOS.includes(value as AssessmentScenario);

      this.resetSimulationInputs();

      this.setParameterFromUrl(
        params["assessmentScenario"],
        this.setAssessmentScenario,
        null,
        assessmentScenarioValidator,
      );
      this.setParameterFromUrl(
        params["numberOfDependents"],
        this.setNumberOfDependents,
        parseStrictNonNegativeInteger,
        nonNegativeIntegerValidator,
      );
      this.setParameterFromUrl(
        params["dependentsAged3OrUnder"],
        this.setDependentsAged3OrUnder,
        parseStrictNonNegativeInteger,
        (value: number) =>
          nonNegativeIntegerValidator(value) &&
          value <= this.numberOfDependents,
      );
      this.setParameterFromUrl(
        params["dependentsAged4To6"],
        this.setDependentsAged4To6,
        parseStrictNonNegativeInteger,
        (value: number) =>
          nonNegativeIntegerValidator(value) &&
          value <= this.numberOfDependents - this.dependentsAged3OrUnder,
      );
      this.setParameterFromUrl(
        params["incomeFrequency"],
        this.setIncomeFrequency,
        null,
        frequencyChoicesValidator,
      );
      this.setParameterFromUrl(
        params["displayFrequency"],
        this.setDisplayFrequency,
        null,
        frequencyChoicesValidator,
      );
      this.setParameterFromUrl(
        params["nrMonthsDisplay"],
        this.setNrMonthsDisplay,
        parseInt,
        (value: number) => value > 0,
      );
      this.setParameterFromUrl(
        params["nrDaysOff"],
        this.setNrDaysOff,
        parseInt,
        (value: number) => value >= 0,
      );
      this.setParameterFromUrl(
        params["ssDiscount"],
        this.setSsDiscount,
        parseFloat,
        (value: number) => this.ssDiscountChoices.includes(value),
      );
      this.setParameterFromUrl(
        params["currentTaxRankYear"],
        this.setCurrentTaxRankYear,
        parseInt,
        taxRankYearValidator,
      );
      this.setParameterFromUrl(
        params["ssFirstYear"],
        this.setSsFirstYear,
        booleanParser,
        null,
      );

      this.setParameterFromUrl(
        params["income"],
        this.setIncome,
        parseInt,
        positiveNumericValidator,
      );
      const manualExpensesResult = this.setParameterFromUrl(
        params["expenses"],
        this.setExpensesManual,
        parseInt,
        nonNegativeNumericValidator,
      );
      if (!manualExpensesResult) {
        this.expensesAuto = true;
        this.recalculateAutomaticExpenses();
      }
      this.setParameterFromUrl(
        params["firstYear"],
        this.setFirstYear,
        booleanParser,
        null,
      );
      this.setParameterFromUrl(
        params["secondYear"],
        this.setSecondYear,
        booleanParser,
        null,
      );
      this.setParameterFromUrl(params["rnh"], this.setRnh, booleanParser, null);
      this.setParameterFromUrl(
        params["benefitsOfYouthIrs"],
        this.setBenefitsOfYouthIrs,
        booleanParser,
        null,
      );
      this.setParameterFromUrl(
        params["yearOfYouthIrs"],
        this.setYearOfYouthIrs,
        parseInt,
        this.isYearOfYouthIrsValid,
      );
    },
    getUrlParams() {
      const urlParams = new URLSearchParams(
        window.location.hash.split("/?")[1],
      );

      const params: { [key: string]: string | boolean } = {};

      urlParams.forEach((value, key) => (params[key] = value));

      return params;
    },
    setStoredSimulations(storedSimulations) {
      this.storedSimulations = storedSimulations;
    },
    loadSimulations() {
      if (!this.storedSimulations) {
        const simulations = localStorage.getItem(SIMULATIONS_LOCAL_STORE_KEY);
        this.storedSimulations = simulations ? JSON.parse(simulations) : [];
      }
    },
    deleteSimulation(id: string) {
      const index = this.storedSimulations.findIndex((s) => s.id === id);
      if (index !== -1) {
        this.storedSimulations.splice(index, 1);

        this.updateStoredSimulations();
      }
    },
    updateStoredSimulations() {
      localStorage.setItem(
        SIMULATIONS_LOCAL_STORE_KEY,
        JSON.stringify(this.storedSimulations),
      );
    },
    storeSimulation(simulationName: string) {
      if (!this.storedSimulations) {
        this.loadSimulations();
      }

      this.storedSimulations.push({
        id: generateUUID(),
        simulationName,
        createdAt: new Date().toISOString(),
        parameters: {
          ...this.getUrlParams(),
        },
      });

      this.updateStoredSimulations();
    },
    isYearOfYouthIrsValid(value: number) {
      return value >= 1 && value <= this.youthIrsRange;
    },
    reset() {
      this.resetSimulationInputs();
      clearUrlQuery();
    },
  },
});

export { useTaxesStore };
