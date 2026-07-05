<template>
  <section data-cy="scenario-comparison">
    <DisclosurePanel
      id="scenario-comparison"
      :title="t('scenarioComparison.title')"
      :summary="t('scenarioComparison.summary')"
      :open="isOpen"
      toggle-data-cy="scenario-comparison-toggle"
      panel-data-cy="scenario-comparison-panel"
      @update:open="isOpen = $event"
    >
      <div class="space-y-5">
        <p class="text-sm leading-6 text-muted">
          {{ t("scenarioComparison.explanation") }}
        </p>

        <div
          class="grid gap-3 sm:grid-cols-2"
          role="group"
          :aria-label="t('scenarioComparison.actions.add')"
        >
          <button
            v-for="preset in presetOptions"
            :key="preset.id"
            type="button"
            class="min-h-24 rounded-lg border border-default bg-surface-muted p-3 text-left transition hover:border-income hover:bg-income-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            data-cy="scenario-add-preset"
            :data-scenario-preset="preset.id"
            :disabled="preset.disabled"
            @click="addPreset(preset.id)"
          >
            <span class="block text-sm font-semibold text-foreground">
              {{ t(preset.labelKey) }}
            </span>
            <span class="mt-1 block text-xs leading-5 text-muted">
              {{ t(preset.descriptionKey) }}
            </span>
            <span
              v-if="preset.statusKey"
              class="mt-2 inline-flex rounded-full border border-default px-2 py-0.5 text-xs font-medium text-subtle"
            >
              {{ t(preset.statusKey) }}
            </span>
          </button>
        </div>

        <p class="text-xs leading-5 text-subtle">
          {{ t("scenarioComparison.screenOnlyNote") }}
        </p>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p v-if="alternatives.length === 0" class="text-sm text-muted">
            {{ t("scenarioComparison.statuses.noAlternatives") }}
          </p>
          <p v-else class="text-sm text-muted">
            {{
              t(
                "scenarioComparison.statuses.alternativeCount",
                { count: alternatives.length },
                alternatives.length,
              )
            }}
          </p>

          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-full border border-default px-3 py-2 text-sm font-medium text-muted transition hover:border-danger hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            data-cy="scenario-clear-all"
            :aria-label="t('scenarioComparison.actions.clearAll')"
            :disabled="alternatives.length === 0"
            @click="clearAll"
          >
            {{ t("scenarioComparison.actions.clearAll") }}
          </button>
        </div>

        <div class="grid gap-3 lg:grid-cols-2" data-cy="scenario-results">
          <article
            v-for="row in rows"
            :key="`card-${row.id}`"
            class="rounded-lg border p-4"
            :class="scenarioCardClass(row)"
            :data-cy="
              row.isCurrent ? 'scenario-current-row' : 'scenario-comparison-row'
            "
            :data-scenario-id="row.id"
          >
            <div
              class="flex h-full flex-col gap-4"
              data-cy="scenario-result-card"
            >
              <header class="space-y-2">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-semibold text-foreground">
                      {{ t(row.labelKey) }}
                    </h3>
                    <p class="mt-1 text-xs leading-5 text-muted">
                      {{ t(row.descriptionKey) }}
                    </p>
                  </div>
                  <div
                    class="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1.5"
                  >
                    <span
                      v-for="chip in scenarioStatusChips(row)"
                      :key="`card-${row.id}-${chip.kind}`"
                      data-cy="scenario-status-chip"
                      :aria-label="
                        chip.ariaLabelKey ? t(chip.ariaLabelKey) : undefined
                      "
                      :class="chip.className"
                    >
                      <span :data-cy="chip.dataCy">
                        {{ t(chip.labelKey) }}
                      </span>
                    </span>
                  </div>
                </div>
              </header>

              <section>
                <p class="text-xs font-semibold text-subtle">
                  {{ t("scenarioComparison.card.keyResult") }}
                </p>
                <dl class="mt-2 grid gap-3 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <dt class="text-xs text-subtle">
                      {{ scenarioAnnualNetIncomeLabel(row) }}
                    </dt>
                    <dd
                      class="mt-1 text-2xl font-semibold tabular-nums text-foreground"
                      data-cy="scenario-net-income-year"
                    >
                      {{ money(row.netIncome.year) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs text-subtle">
                      {{ scenarioMonthlyNetIncomeLabel(row) }}
                    </dt>
                    <dd
                      class="mt-1 text-sm font-semibold tabular-nums text-foreground"
                      data-cy="scenario-net-income-month"
                    >
                      {{ money(row.netIncome.month) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs text-subtle">
                      {{ t("scenarioComparison.table.difference") }}
                    </dt>
                    <dd
                      class="mt-1 rounded-md bg-surface-muted px-2 py-1 text-sm font-semibold"
                      :class="diffClass(row.diff.netIncomeYear)"
                      data-cy="scenario-diff-net-income"
                    >
                      {{ diffLabel(row) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="border-t border-default pt-3">
                <p class="text-xs font-semibold text-subtle">
                  {{ t("scenarioComparison.card.supportingMetrics") }}
                </p>
                <dl class="mt-2 space-y-2 text-xs">
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-subtle">
                      {{ scenarioGrossIncomeLabel(row) }}
                    </dt>
                    <dd
                      class="text-right font-medium tabular-nums text-foreground"
                      data-cy="scenario-gross-income-year"
                    >
                      {{ money(row.grossIncome.year) }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-subtle">
                      {{ t("scenarioComparison.table.irs") }}
                    </dt>
                    <dd
                      class="text-right font-medium tabular-nums text-foreground"
                      data-cy="scenario-irs-year"
                    >
                      {{ money(row.irsPay.year) }}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="text-subtle">
                      {{ t("scenarioComparison.table.socialSecurity") }}
                    </dt>
                    <dd
                      class="text-right font-medium tabular-nums text-foreground"
                      data-cy="scenario-social-security-year"
                    >
                      {{ money(row.ssPay.year) }}
                    </dd>
                  </div>
                </dl>
              </section>

              <button
                v-if="!row.isCurrent"
                type="button"
                class="mt-auto self-start text-xs font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                data-cy="scenario-remove-button"
                :aria-label="
                  t('scenarioComparison.actions.removeScenario', {
                    scenario: t(row.labelKey),
                  })
                "
                @click="removePreset(row.preset)"
              >
                {{ t("scenarioComparison.actions.remove") }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </DisclosurePanel>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import {
  captureScenarioInputSnapshot,
  createScenarioComparison,
  isScenarioOverrideEquivalentToCurrent,
  MAX_COMPARISON_ALTERNATIVES,
  SCENARIO_PRESETS,
  ScenarioPreset,
  ScenarioResult,
} from "@/scenarios/scenarioComparison";
import { useTaxesStore } from "@/store";
import { AssessmentScenario } from "@/typings";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });
const { formatCurrency } = useLocalizedFormatters();

const isOpen = ref(false);
const selectedPresets = ref<ScenarioPreset[]>([]);
const currentSnapshot = computed(() => captureScenarioInputSnapshot(store));
const comparison = computed(() =>
  createScenarioComparison(currentSnapshot.value, selectedPresets.value),
);
const rows = computed(() => comparison.value.rows);
const alternatives = computed(() => comparison.value.alternatives);
const hasReachedLimit = computed(
  () => selectedPresets.value.length >= MAX_COMPARISON_ALTERNATIVES,
);

type ScenarioStatusChip = {
  kind: "current" | "alternative" | "best";
  labelKey: string;
  dataCy: string;
  className: string;
  ariaLabelKey?: string;
};

const statusChipBaseClass =
  "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight whitespace-nowrap";

const currentChipClass = `${statusChipBaseClass} border-default bg-surface text-foreground`;
const alternativeChipClass = `${statusChipBaseClass} border-default bg-surface-muted text-muted`;
const bestChipClass = `${statusChipBaseClass} border-income/30 bg-income-soft text-foreground`;

const scenarioCardClass = (row: ScenarioResult) => [
  row.isCurrent
    ? "border-income/40 bg-surface"
    : "border-default bg-surface-muted",
  row.isBest && !row.isCurrent ? "border-income/40" : "",
];

const scenarioStatusChips = (row: ScenarioResult): ScenarioStatusChip[] => {
  const roleChip: ScenarioStatusChip = row.isCurrent
    ? {
        kind: "current",
        labelKey: "scenarioComparison.table.currentChip",
        dataCy: "scenario-current-chip",
        className: currentChipClass,
      }
    : {
        kind: "alternative",
        labelKey: "scenarioComparison.table.alternativeChip",
        dataCy: "scenario-alternative-chip",
        className: alternativeChipClass,
      };

  if (!row.isBest) {
    return [roleChip];
  }

  return [
    roleChip,
    {
      kind: "best",
      labelKey: "scenarioComparison.table.bestChip",
      ariaLabelKey: "scenarioComparison.table.bestChipAriaLabel",
      dataCy: "scenario-best-chip",
      className: bestChipClass,
    },
  ];
};

const presetOptions = computed(() =>
  SCENARIO_PRESETS.map((preset) => {
    const alreadyCurrent = isScenarioOverrideEquivalentToCurrent(
      currentSnapshot.value,
      preset.overrides,
    );
    const alreadySelected = selectedPresets.value.includes(preset.id);
    const needsSpouseIncome =
      preset.id === "jointTwoIncomes" &&
      currentSnapshot.value.spouseAnnualGrossIncome <= 0;
    const disabled =
      alreadyCurrent ||
      alreadySelected ||
      hasReachedLimit.value ||
      needsSpouseIncome;
    const statusKey = alreadyCurrent
      ? "scenarioComparison.statuses.alreadyCurrent"
      : alreadySelected
        ? "scenarioComparison.statuses.added"
        : hasReachedLimit.value
          ? "scenarioComparison.statuses.limitReached"
          : needsSpouseIncome
            ? "scenarioComparison.statuses.spouseIncomeRequired"
            : "";

    return {
      ...preset,
      disabled,
      statusKey,
    };
  }),
);

const addPreset = (preset: ScenarioPreset) => {
  const option = presetOptions.value.find((item) => item.id === preset);

  if (!option || option.disabled) {
    return;
  }

  selectedPresets.value = [...selectedPresets.value, preset].slice(
    0,
    MAX_COMPARISON_ALTERNATIVES,
  );
};

const removePreset = (preset: ScenarioPreset | undefined) => {
  if (!preset) {
    return;
  }

  selectedPresets.value = selectedPresets.value.filter(
    (selectedPreset) => selectedPreset !== preset,
  );
};

const clearAll = () => {
  selectedPresets.value = [];
};

const money = (value: number) => formatCurrency(value, 2);

const scenarioUsesHouseholdIncome = (row: ScenarioResult) =>
  row.input.assessmentScenario === AssessmentScenario.JointTwoIncomes;

const scenarioGrossIncomeLabel = (row: ScenarioResult) =>
  scenarioUsesHouseholdIncome(row)
    ? t("scenarioComparison.table.householdGrossIncome")
    : t("scenarioComparison.table.grossIncome");

const scenarioAnnualNetIncomeLabel = (row: ScenarioResult) =>
  scenarioUsesHouseholdIncome(row)
    ? t("scenarioComparison.card.annualHouseholdNetIncome")
    : t("scenarioComparison.card.annualNetIncome");

const scenarioMonthlyNetIncomeLabel = (row: ScenarioResult) =>
  scenarioUsesHouseholdIncome(row)
    ? t("scenarioComparison.card.monthlyHouseholdNetIncome")
    : t("scenarioComparison.card.monthlyNetIncome");

const diffLabel = (row: ScenarioResult) => {
  const amount = money(Math.abs(row.diff.netIncomeYear));

  if (Math.abs(row.diff.netIncomeYear) < 0.005) {
    return t("scenarioComparison.statuses.sameAsCurrent");
  }

  return row.diff.netIncomeYear > 0
    ? t("scenarioComparison.statuses.betterThanCurrent", { amount })
    : t("scenarioComparison.statuses.worseThanCurrent", { amount });
};

const diffClass = (value: number) => {
  if (Math.abs(value) < 0.005) {
    return "text-muted";
  }

  return value > 0 ? "text-income" : "text-danger";
};
</script>
