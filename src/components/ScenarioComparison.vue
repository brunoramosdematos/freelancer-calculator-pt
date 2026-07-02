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

        <div class="hidden md:block">
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left text-xs">
              <thead>
                <tr class="border-b border-default text-subtle">
                  <th scope="col" class="py-2 pr-3 font-semibold">
                    {{ t("scenarioComparison.table.scenario") }}
                  </th>
                  <th scope="col" class="px-3 py-2 text-right font-semibold">
                    {{ t("scenarioComparison.table.grossIncome") }}
                  </th>
                  <th scope="col" class="px-3 py-2 text-right font-semibold">
                    {{ t("scenarioComparison.table.irs") }}
                  </th>
                  <th scope="col" class="px-3 py-2 text-right font-semibold">
                    {{ t("scenarioComparison.table.socialSecurity") }}
                  </th>
                  <th scope="col" class="px-3 py-2 text-right font-semibold">
                    {{ t("scenarioComparison.table.netIncomeYear") }}
                  </th>
                  <th scope="col" class="px-3 py-2 text-right font-semibold">
                    {{ t("scenarioComparison.table.netIncomeMonth") }}
                  </th>
                  <th scope="col" class="py-2 pl-3 font-semibold">
                    {{ t("scenarioComparison.table.difference") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default">
                <tr
                  v-for="row in rows"
                  :key="`table-${row.id}`"
                  :data-cy="
                    row.isCurrent
                      ? 'scenario-current-row'
                      : 'scenario-comparison-row'
                  "
                  :data-scenario-id="row.id"
                  class="align-top"
                >
                  <th scope="row" class="py-3 pr-3 font-medium text-foreground">
                    <span class="block">{{ t(row.labelKey) }}</span>
                    <span class="mt-1 block text-xs font-normal text-muted">
                      {{ t(row.descriptionKey) }}
                    </span>
                    <span
                      v-if="row.isBest"
                      class="mt-2 inline-flex rounded-full border border-income/30 bg-income-soft px-2 py-0.5 text-xs font-semibold text-foreground"
                    >
                      {{ t("scenarioComparison.table.best") }}
                    </span>
                  </th>
                  <td class="px-3 py-3 text-right tabular-nums">
                    {{ money(row.grossIncome.year) }}
                  </td>
                  <td class="px-3 py-3 text-right tabular-nums">
                    {{ money(row.irsPay.year) }}
                  </td>
                  <td class="px-3 py-3 text-right tabular-nums">
                    {{ money(row.ssPay.year) }}
                  </td>
                  <td class="px-3 py-3 text-right font-semibold tabular-nums">
                    {{ money(row.netIncome.year) }}
                  </td>
                  <td class="px-3 py-3 text-right tabular-nums">
                    {{ money(row.netIncome.month) }}
                  </td>
                  <td
                    class="py-3 pl-3 text-sm"
                    data-cy="scenario-diff-net-income"
                  >
                    <span
                      class="block font-medium"
                      :class="diffClass(row.diff.netIncomeYear)"
                    >
                      {{ diffLabel(row) }}
                    </span>
                    <button
                      v-if="!row.isCurrent"
                      type="button"
                      class="mt-2 text-xs font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                      :aria-label="
                        t('scenarioComparison.actions.removeScenario', {
                          scenario: t(row.labelKey),
                        })
                      "
                      @click="removePreset(row.preset)"
                    >
                      {{ t("scenarioComparison.actions.remove") }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-3 md:hidden">
          <article
            v-for="row in rows"
            :key="`card-${row.id}`"
            class="rounded-lg border border-default bg-surface-muted p-3"
            :data-cy="
              row.isCurrent ? 'scenario-current-row' : 'scenario-comparison-row'
            "
            :data-scenario-id="row.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-foreground">
                  {{ t(row.labelKey) }}
                </h3>
                <p class="mt-1 text-xs leading-5 text-muted">
                  {{ t(row.descriptionKey) }}
                </p>
              </div>
              <span
                v-if="row.isBest"
                class="shrink-0 rounded-full border border-income/30 bg-income-soft px-2 py-0.5 text-xs font-semibold text-foreground"
              >
                {{ t("scenarioComparison.table.best") }}
              </span>
            </div>

            <dl class="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt class="text-subtle">
                  {{ t("scenarioComparison.table.grossIncome") }}
                </dt>
                <dd class="mt-1 tabular-nums">
                  {{ money(row.grossIncome.year) }}
                </dd>
              </div>
              <div>
                <dt class="text-subtle">
                  {{ t("scenarioComparison.table.irs") }}
                </dt>
                <dd class="mt-1 tabular-nums">{{ money(row.irsPay.year) }}</dd>
              </div>
              <div>
                <dt class="text-subtle">
                  {{ t("scenarioComparison.table.socialSecurity") }}
                </dt>
                <dd class="mt-1 tabular-nums">{{ money(row.ssPay.year) }}</dd>
              </div>
              <div>
                <dt class="text-subtle">
                  {{ t("scenarioComparison.table.netIncomeMonth") }}
                </dt>
                <dd class="mt-1 font-semibold tabular-nums">
                  {{ money(row.netIncome.month) }}
                </dd>
              </div>
              <div class="col-span-2">
                <dt class="text-subtle">
                  {{ t("scenarioComparison.table.difference") }}
                </dt>
                <dd
                  class="mt-1 font-medium"
                  :class="diffClass(row.diff.netIncomeYear)"
                  data-cy="scenario-diff-net-income"
                >
                  {{ diffLabel(row) }}
                </dd>
              </div>
            </dl>

            <button
              v-if="!row.isCurrent"
              type="button"
              class="mt-3 text-xs font-medium text-muted underline decoration-dotted underline-offset-4 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              :aria-label="
                t('scenarioComparison.actions.removeScenario', {
                  scenario: t(row.labelKey),
                })
              "
              @click="removePreset(row.preset)"
            >
              {{ t("scenarioComparison.actions.remove") }}
            </button>
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

const presetOptions = computed(() =>
  SCENARIO_PRESETS.map((preset) => {
    const alreadyCurrent = isScenarioOverrideEquivalentToCurrent(
      currentSnapshot.value,
      preset.overrides,
    );
    const alreadySelected = selectedPresets.value.includes(preset.id);
    const disabled = alreadyCurrent || alreadySelected || hasReachedLimit.value;
    const statusKey = alreadyCurrent
      ? "scenarioComparison.statuses.alreadyCurrent"
      : alreadySelected
        ? "scenarioComparison.statuses.added"
        : hasReachedLimit.value
          ? "scenarioComparison.statuses.limitReached"
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
