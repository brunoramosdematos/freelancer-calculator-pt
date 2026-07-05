import { createPinia } from "pinia";
import { useTaxesStore } from "@/store";
import { AssessmentScenario, FrequencyChoices, GrossIncome } from "@/typings";

export type ScenarioPreset =
  | "individual"
  | "jointSingleIncome"
  | "jointTwoIncomes"
  | "socialSecurityMinus20"
  | "noDependents";

export type ScenarioSource = "current" | "preset" | "custom";
export type ScenarioId = "current" | ScenarioPreset | string;

export interface ScenarioInputSnapshot {
  income: number | null;
  incomeFrequency: FrequencyChoices;
  displayFrequency: FrequencyChoices;
  nrMonthsDisplay: number;
  nrDaysOff: number;
  ssDiscount: number;
  expenses: number;
  expensesAuto: boolean;
  currentTaxRankYear: 2023 | 2024 | 2025 | 2026;
  firstYear: boolean;
  secondYear: boolean;
  ssFirstYear: boolean;
  rnh: boolean;
  benefitsOfYouthIrs: boolean;
  yearOfYouthIrs: number;
  assessmentScenario: AssessmentScenario;
  spouseAnnualGrossIncome: number;
  numberOfDependents: number;
  dependentsAged3OrUnder: number;
  dependentsAged4To6: number;
}

export type ScenarioOverride = Partial<ScenarioInputSnapshot>;

export interface ScenarioPresetDefinition {
  id: ScenarioPreset;
  labelKey: string;
  descriptionKey: string;
  overrides: ScenarioOverride;
}

export interface ScenarioDiff {
  netIncomeYear: number;
  netIncomeMonth: number;
}

export interface ScenarioResult {
  id: ScenarioId;
  labelKey: string;
  descriptionKey: string;
  source: ScenarioSource;
  preset?: ScenarioPreset;
  input: ScenarioInputSnapshot;
  grossIncome: GrossIncome;
  irsPay: GrossIncome;
  ssPay: GrossIncome;
  netIncome: GrossIncome;
  diff: ScenarioDiff;
  isBest: boolean;
  isCurrent: boolean;
  isEquivalentToCurrent: boolean;
}

export interface ScenarioComparisonResult {
  current: ScenarioResult;
  alternatives: ScenarioResult[];
  rows: ScenarioResult[];
}

type TaxesStore = ReturnType<typeof useTaxesStore>;

export const MAX_COMPARISON_ALTERNATIVES = 3;

export const SCENARIO_PRESETS: ScenarioPresetDefinition[] = [
  {
    id: "individual",
    labelKey: "scenarioComparison.presets.individual.label",
    descriptionKey: "scenarioComparison.presets.individual.description",
    overrides: {
      assessmentScenario: AssessmentScenario.Individual,
    },
  },
  {
    id: "jointSingleIncome",
    labelKey: "scenarioComparison.presets.jointSingleIncome.label",
    descriptionKey: "scenarioComparison.presets.jointSingleIncome.description",
    overrides: {
      assessmentScenario: AssessmentScenario.JointSingleIncome,
    },
  },
  {
    id: "jointTwoIncomes",
    labelKey: "scenarioComparison.presets.jointTwoIncomes.label",
    descriptionKey: "scenarioComparison.presets.jointTwoIncomes.description",
    overrides: {
      assessmentScenario: AssessmentScenario.JointTwoIncomes,
    },
  },
  {
    id: "socialSecurityMinus20",
    labelKey: "scenarioComparison.presets.socialSecurityMinus20.label",
    descriptionKey:
      "scenarioComparison.presets.socialSecurityMinus20.description",
    overrides: {
      ssDiscount: -0.2,
    },
  },
  {
    id: "noDependents",
    labelKey: "scenarioComparison.presets.noDependents.label",
    descriptionKey: "scenarioComparison.presets.noDependents.description",
    overrides: {
      numberOfDependents: 0,
      dependentsAged3OrUnder: 0,
      dependentsAged4To6: 0,
    },
  },
];

const copyFrequencyValues = (values: GrossIncome): GrossIncome => ({
  year: values.year,
  month: values.month,
  day: values.day,
});

export const getScenarioPreset = (preset: ScenarioPreset) => {
  const definition = SCENARIO_PRESETS.find((item) => item.id === preset);

  if (!definition) {
    throw new Error(`Unknown scenario preset: ${preset}`);
  }

  return definition;
};

export const captureScenarioInputSnapshot = (
  store: TaxesStore,
): ScenarioInputSnapshot => ({
  income: store.income,
  incomeFrequency: store.incomeFrequency,
  displayFrequency: store.displayFrequency,
  nrMonthsDisplay: store.nrMonthsDisplay,
  nrDaysOff: store.nrDaysOff,
  ssDiscount: store.ssDiscount,
  expenses: store.expenses,
  expensesAuto: store.expensesAuto,
  currentTaxRankYear:
    store.currentTaxRankYear as ScenarioInputSnapshot["currentTaxRankYear"],
  firstYear: store.firstYear,
  secondYear: store.secondYear,
  ssFirstYear: store.ssFirstYear,
  rnh: store.rnh,
  benefitsOfYouthIrs: store.benefitsOfYouthIrs,
  yearOfYouthIrs: store.yearOfYouthIrs,
  assessmentScenario: store.assessmentScenario,
  spouseAnnualGrossIncome: store.spouseAnnualGrossIncome,
  numberOfDependents: store.numberOfDependents,
  dependentsAged3OrUnder: store.dependentsAged3OrUnder,
  dependentsAged4To6: store.dependentsAged4To6,
});

const createIsolatedScenarioStore = (
  snapshot: ScenarioInputSnapshot,
  overrides: ScenarioOverride = {},
) => {
  const scenarioStore = useTaxesStore(createPinia());

  scenarioStore.$patch({
    ...snapshot,
    ...overrides,
  });
  scenarioStore.recalculateAutomaticExpenses();

  return scenarioStore;
};

export const applyScenarioOverrides = (
  snapshot: ScenarioInputSnapshot,
  overrides: ScenarioOverride = {},
): ScenarioInputSnapshot =>
  captureScenarioInputSnapshot(
    createIsolatedScenarioStore(snapshot, overrides),
  );

export const isScenarioOverrideEquivalentToCurrent = (
  snapshot: ScenarioInputSnapshot,
  overrides: ScenarioOverride,
) =>
  Object.entries(overrides).every(
    ([key, value]) =>
      snapshot[key as keyof ScenarioInputSnapshot] ===
      (value as ScenarioInputSnapshot[keyof ScenarioInputSnapshot]),
  );

const computeScenarioResult = (
  baseSnapshot: ScenarioInputSnapshot,
  currentStore: TaxesStore,
  definition: {
    id: ScenarioId;
    labelKey: string;
    descriptionKey: string;
    source: ScenarioSource;
    preset?: ScenarioPreset;
    overrides?: ScenarioOverride;
  },
): ScenarioResult => {
  const scenarioStore = createIsolatedScenarioStore(
    baseSnapshot,
    definition.overrides,
  );
  const netIncome = copyFrequencyValues(scenarioStore.netIncome);

  return {
    id: definition.id,
    labelKey: definition.labelKey,
    descriptionKey: definition.descriptionKey,
    source: definition.source,
    preset: definition.preset,
    input: captureScenarioInputSnapshot(scenarioStore),
    grossIncome: copyFrequencyValues(scenarioStore.resultGrossIncome),
    irsPay: copyFrequencyValues(scenarioStore.irsPay),
    ssPay: copyFrequencyValues(scenarioStore.ssPay),
    netIncome,
    diff: {
      netIncomeYear: netIncome.year - currentStore.netIncome.year,
      netIncomeMonth: netIncome.month - currentStore.netIncome.month,
    },
    isBest: false,
    isCurrent: definition.source === "current",
    isEquivalentToCurrent: definition.overrides
      ? isScenarioOverrideEquivalentToCurrent(
          baseSnapshot,
          definition.overrides,
        )
      : true,
  };
};

const markBestScenarios = (rows: ScenarioResult[]) => {
  const bestNetIncome = Math.max(...rows.map((row) => row.netIncome.year));

  return rows.map((row) => ({
    ...row,
    isBest: row.netIncome.year === bestNetIncome,
  }));
};

export const createScenarioComparison = (
  currentSnapshot: ScenarioInputSnapshot,
  presets: ScenarioPreset[],
): ScenarioComparisonResult => {
  const currentStore = createIsolatedScenarioStore(currentSnapshot);
  const current = computeScenarioResult(currentSnapshot, currentStore, {
    id: "current",
    labelKey: "scenarioComparison.table.current",
    descriptionKey: "scenarioComparison.currentDescription",
    source: "current",
  });
  const uniquePresets = Array.from(new Set(presets)).slice(
    0,
    MAX_COMPARISON_ALTERNATIVES,
  );
  const alternatives = uniquePresets.map((preset) => {
    const definition = getScenarioPreset(preset);

    return computeScenarioResult(currentSnapshot, currentStore, {
      id: definition.id,
      labelKey: definition.labelKey,
      descriptionKey: definition.descriptionKey,
      source: "preset",
      preset: definition.id,
      overrides: definition.overrides,
    });
  });
  const rows = markBestScenarios([current, ...alternatives]);

  return {
    current: rows[0],
    alternatives: rows.slice(1),
    rows,
  };
};
