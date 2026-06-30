import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useTaxesStore } from "@/store";
import { AssessmentScenario, FrequencyChoices } from "@/typings";
import { createReportData, sanitizeReportUrl } from "@/report/reportData";

describe("report data builder", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("uses injected generatedAt and includes raw income and tax values", () => {
    const store = useTaxesStore();
    const generatedAt = new Date("2026-06-30T12:34:56.000Z");

    store.setIncome(60_000, false);
    store.setCurrentTaxRankYear(2024, false);

    const report = createReportData(store, { generatedAt });

    expect(report?.generatedAt).toBe(generatedAt);
    expect(report?.summary.grossIncome.year).toBe(60_000);
    expect(report?.summary.netIncome.year).toBe(store.netIncome.year);
    expect(report?.summary.irs.year).toBe(store.irsPay.year);
    expect(report?.summary.socialSecurity.year).toBe(store.ssPay.year);
    expect(report?.summary.totalTaxes.year).toBe(
      store.irsPay.year + store.ssPay.year,
    );
  });

  it("includes selected tax year, assessment scenario and dependent age groups", () => {
    const store = useTaxesStore();

    store.setIncome(60_000, false);
    store.setCurrentTaxRankYear(2024, false);
    store.setAssessmentScenario(AssessmentScenario.JointSingleIncome, false);
    store.setNumberOfDependents(3, false);
    store.setDependentsAged3OrUnder(1, false);
    store.setDependentsAged4To6(1, false);

    const report = createReportData(store);

    expect(report?.assumptions.taxYear).toBe(2024);
    expect(report?.assumptions.assessmentScenario).toBe(
      AssessmentScenario.JointSingleIncome,
    );
    expect(report?.assumptions.dependents).toEqual({
      total: 3,
      aged3OrUnder: 1,
      aged4To6: 1,
      aged7OrOver: 1,
    });
  });

  it("includes fiscal-data status and source references", () => {
    const store = useTaxesStore();

    store.setIncome(60_000, false);
    store.setCurrentTaxRankYear(2026, false);

    const report = createReportData(store);

    expect(report?.fiscalData.selectedTaxYear).toBe(2026);
    expect(report?.fiscalData.latestSupportedTaxYear).toBe(2026);
    expect(report?.fiscalData.lastReviewedAt).toBe("2026-06-30");
    expect(report?.fiscalData.status.kind).toBe("latest-supported");
    expect(report?.fiscalData.sourceLabelKeys).toContain(
      "taxData.sources.autoridadeTributaria.label",
    );
  });

  it("does not include locale or theme preference data", () => {
    const store = useTaxesStore();

    store.setIncome(60_000, false);

    const report = createReportData(store, {
      currentUrl:
        "https://example.test/#/?income=60000&locale=pt-BR&theme=dark",
    });
    const serializedReport = JSON.stringify(report);

    expect(report?.currentUrl).toBe("https://example.test/#/?income=60000");
    expect(serializedReport).not.toContain("pt-BR");
    expect(serializedReport).not.toContain("dark");
    expect(serializedReport).not.toContain("locale");
    expect(serializedReport).not.toContain("theme");
  });

  it("does not mutate store state", () => {
    const store = useTaxesStore();

    store.setIncome(60_000, false);
    store.setAssessmentScenario(AssessmentScenario.JointSingleIncome, false);
    store.setNumberOfDependents(2, false);

    const beforeState = JSON.parse(JSON.stringify(store.$state));

    createReportData(store);

    expect(JSON.parse(JSON.stringify(store.$state))).toEqual(beforeState);
  });

  it("handles zero values and no dependents", () => {
    const store = useTaxesStore();

    store.setIncome(30_000, false);
    store.setSsFirstYear(true, false);

    const report = createReportData(store);

    expect(report?.summary.socialSecurity.year).toBe(0);
    expect(report?.assumptions.dependents).toEqual({
      total: 0,
      aged3OrUnder: 0,
      aged4To6: 0,
      aged7OrOver: 0,
    });
  });

  it("handles manual expenses", () => {
    const store = useTaxesStore();

    store.setIncome(60_000, false);
    store.setExpensesManual(1_234, false);

    const report = createReportData(store);

    expect(report?.assumptions.expenses.mode).toBe("manual");
    expect(report?.assumptions.expenses.amount).toBe(1_234);
  });

  it("returns null when there is no valid income", () => {
    const store = useTaxesStore();

    expect(createReportData(store)).toBeNull();
    store.setIncome(0, false);
    expect(createReportData(store)).toBeNull();
  });

  it("sanitizes preference parameters from normal and hash query strings", () => {
    expect(
      sanitizeReportUrl(
        "https://example.test/?theme=dark#/?income=60000&locale=pt-PT",
      ),
    ).toBe("https://example.test/#/?income=60000");
  });

  it("preserves display and income frequency as raw enum values", () => {
    const store = useTaxesStore();

    store.setIncome(5_000, false);
    store.setIncomeFrequency(FrequencyChoices.Month, false);
    store.setDisplayFrequency(FrequencyChoices.Year, false);

    const report = createReportData(store);

    expect(report?.assumptions.incomeFrequency).toBe(FrequencyChoices.Month);
    expect(report?.assumptions.displayFrequency).toBe(FrequencyChoices.Year);
    expect(report?.summary.displayFrequency).toBe(FrequencyChoices.Year);
  });
});
