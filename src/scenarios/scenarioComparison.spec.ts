import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import router from "@/router";
import { useTaxesStore } from "@/store";
import {
  applyScenarioOverrides,
  captureScenarioInputSnapshot,
  createScenarioComparison,
  getScenarioPreset,
} from "@/scenarios/scenarioComparison";
import { AssessmentScenario, FrequencyChoices } from "@/typings";

const createConfiguredStore = () => {
  const store = useTaxesStore(createPinia());

  store.setIncome(60_000, false);
  store.setIncomeFrequency(FrequencyChoices.Year, false);
  store.setDisplayFrequency(FrequencyChoices.Month, false);
  store.setCurrentTaxRankYear(2024, false);
  store.setSsDiscount(0, false);
  store.setAssessmentScenario(AssessmentScenario.Individual, false);
  store.setSpouseAnnualGrossIncome(0, false);
  store.setNumberOfDependents(0, false);
  store.setSsFirstYear(false, false);
  store.setFirstYear(false, false);
  store.setSecondYear(false, false);
  store.setRnh(false, false);
  store.setBenefitsOfYouthIrs(false, false);
  store.setYearOfYouthIrs(1, false);

  return store;
};

describe("scenario comparison", () => {
  it("snapshots current store parameters without mutation", () => {
    const store = createConfiguredStore();
    store.setNumberOfDependents(2, false);
    store.setDependentsAged3OrUnder(1, false);
    store.setDependentsAged4To6(1, false);
    const before = { ...store.$state };

    const snapshot = captureScenarioInputSnapshot(store);

    expect(snapshot).toMatchObject({
      income: 60_000,
      assessmentScenario: AssessmentScenario.Individual,
      spouseAnnualGrossIncome: 0,
      numberOfDependents: 2,
      dependentsAged3OrUnder: 1,
      dependentsAged4To6: 1,
    });
    expect(store.$state).toMatchObject(before);
  });

  it("computes an equivalent current scenario with the same IRS, SS and net income as the store", () => {
    const store = createConfiguredStore();
    const comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      [],
    );

    expect(comparison.current.irsPay.year).toBe(store.irsPay.year);
    expect(comparison.current.ssPay.year).toBe(store.ssPay.year);
    expect(comparison.current.netIncome.year).toBe(store.netIncome.year);
  });

  it("individual preset changes only the assessment scenario", () => {
    const store = createConfiguredStore();
    store.setAssessmentScenario(AssessmentScenario.JointSingleIncome, false);
    const snapshot = captureScenarioInputSnapshot(store);

    const result = applyScenarioOverrides(
      snapshot,
      getScenarioPreset("individual").overrides,
    );

    expect(result).toEqual({
      ...snapshot,
      assessmentScenario: AssessmentScenario.Individual,
    });
  });

  it("joint preset changes only the assessment scenario", () => {
    const store = createConfiguredStore();
    const snapshot = captureScenarioInputSnapshot(store);

    const result = applyScenarioOverrides(
      snapshot,
      getScenarioPreset("jointSingleIncome").overrides,
    );

    expect(result).toEqual({
      ...snapshot,
      assessmentScenario: AssessmentScenario.JointSingleIncome,
    });
  });

  it("joint-two-income preset changes only the assessment scenario and preserves spouse income", () => {
    const store = createConfiguredStore();
    store.setSpouseAnnualGrossIncome(20_000, false);
    const snapshot = captureScenarioInputSnapshot(store);

    const result = applyScenarioOverrides(
      snapshot,
      getScenarioPreset("jointTwoIncomes").overrides,
    );

    expect(result).toEqual({
      ...snapshot,
      assessmentScenario: AssessmentScenario.JointTwoIncomes,
    });
    expect(result.spouseAnnualGrossIncome).toBe(20_000);
  });

  it("SS -20% preset changes only the Social Security adjustment", () => {
    const store = createConfiguredStore();
    store.setSpouseAnnualGrossIncome(20_000, false);
    const snapshot = captureScenarioInputSnapshot(store);

    const result = applyScenarioOverrides(
      snapshot,
      getScenarioPreset("socialSecurityMinus20").overrides,
    );

    expect(result.ssDiscount).toBe(-0.2);
    expect(result.expensesAuto).toBe(true);
    expect(result).toMatchObject({
      ...snapshot,
      ssDiscount: -0.2,
      expenses: result.expenses,
    });
  });

  it("no-dependents preset sets dependent count and age groups to zero", () => {
    const store = createConfiguredStore();
    store.setSpouseAnnualGrossIncome(20_000, false);
    store.setNumberOfDependents(3, false);
    store.setDependentsAged3OrUnder(1, false);
    store.setDependentsAged4To6(1, false);
    const snapshot = captureScenarioInputSnapshot(store);

    const result = applyScenarioOverrides(
      snapshot,
      getScenarioPreset("noDependents").overrides,
    );

    expect(result.numberOfDependents).toBe(0);
    expect(result.dependentsAged3OrUnder).toBe(0);
    expect(result.dependentsAged4To6).toBe(0);
    expect(result.spouseAnnualGrossIncome).toBe(20_000);
  });

  it("does not change the current store after computing alternatives", () => {
    const store = createConfiguredStore();
    const before = { ...store.$state };

    createScenarioComparison(captureScenarioInputSnapshot(store), [
      "jointSingleIncome",
      "jointTwoIncomes",
      "socialSecurityMinus20",
      "noDependents",
    ]);

    expect(store.$state).toMatchObject(before);
  });

  it("computes joint-two-income alternatives with household gross income", () => {
    const store = createConfiguredStore();
    store.setSpouseAnnualGrossIncome(20_000, false);

    const comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["jointTwoIncomes"],
    );
    const jointTwo = comparison.alternatives[0];

    expect(jointTwo.input.spouseAnnualGrossIncome).toBe(20_000);
    expect(jointTwo.input.assessmentScenario).toBe(
      AssessmentScenario.JointTwoIncomes,
    );
    expect(jointTwo.grossIncome.year).toBe(80_000);
    expect(jointTwo.irsPay.year).toBeCloseTo(13_894.05528);
    expect(store.assessmentScenario).toBe(AssessmentScenario.Individual);
  });

  it("calculates diffs versus the current scenario", () => {
    const store = createConfiguredStore();
    const comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["jointSingleIncome"],
    );
    const joint = comparison.alternatives[0];

    expect(joint.diff.netIncomeYear).toBeCloseTo(
      joint.netIncome.year - comparison.current.netIncome.year,
    );
    expect(joint.diff.netIncomeMonth).toBeCloseTo(
      joint.netIncome.month - comparison.current.netIncome.month,
    );
  });

  it("identifies the best net income scenario", () => {
    const store = createConfiguredStore();
    const comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["jointSingleIncome", "socialSecurityMinus20"],
    );
    const bestNetIncome = Math.max(
      ...comparison.rows.map((row) => row.netIncome.year),
    );

    expect(comparison.rows.filter((row) => row.isBest)).toHaveLength(1);
    expect(comparison.rows.find((row) => row.isBest)?.netIncome.year).toBe(
      bestNetIncome,
    );
  });

  it("deduplicates identical preset requests and marks already-current alternatives", () => {
    const store = createConfiguredStore();
    const comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["individual", "individual"],
    );

    expect(comparison.alternatives).toHaveLength(1);
    expect(comparison.alternatives[0].isEquivalentToCurrent).toBe(true);
    expect(comparison.alternatives[0].diff.netIncomeYear).toBe(0);
  });

  it("does not call URL/router sync while calculating scenarios", () => {
    const store = createConfiguredStore();
    const pushSpy = vi.spyOn(router, "push").mockResolvedValue(undefined);

    try {
      createScenarioComparison(captureScenarioInputSnapshot(store), [
        "jointSingleIncome",
        "socialSecurityMinus20",
      ]);

      expect(pushSpy).not.toHaveBeenCalled();
    } finally {
      pushSpy.mockRestore();
    }
  });

  it("keeps 2024 annual IRS regression values unchanged", () => {
    const store = createConfiguredStore();

    let comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["jointSingleIncome"],
    );

    expect(comparison.current.irsPay.year).toBeCloseTo(12_576.22);
    expect(comparison.alternatives[0].irsPay.year).toBeCloseTo(8_608.78998);

    store.setAssessmentScenario(AssessmentScenario.JointSingleIncome, false);
    store.setNumberOfDependents(2, false);
    store.setDependentsAged3OrUnder(1, false);
    store.setDependentsAged4To6(1, false);
    comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      [],
    );

    expect(comparison.current.irsPay.year).toBeCloseTo(7_108.78998);
  });

  it("keeps 2026 monthly Social Security regression values unchanged", () => {
    const store = createConfiguredStore();
    store.setIncomeFrequency(FrequencyChoices.Month, false);
    store.setIncome(11_000, false);
    store.setCurrentTaxRankYear(2026, false);
    store.setSsDiscount(0, false);

    let comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      ["socialSecurityMinus20"],
    );

    expect(comparison.current.ssPay.month).toBeCloseTo(1_379.34984);
    expect(comparison.alternatives[0].ssPay.month).toBeCloseTo(1_318.24);

    store.setSsDiscount(-0.25, false);
    comparison = createScenarioComparison(
      captureScenarioInputSnapshot(store),
      [],
    );

    expect(comparison.current.ssPay.month).toBeCloseTo(1_235.85);
  });
});
