<template>
  <section
    class="rounded-lg border border-default bg-surface p-4 shadow-sm"
    data-cy="simulation-settings"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-foreground">
          {{ t("simulationSettings.title") }}
        </h2>
        <p class="mt-1 text-xs text-subtle">
          {{ t("simulationSettings.summary") }}
        </p>
      </div>
      <InfoButton :label="t('simulationSettings.infoLabel')">
        <p>
          {{ t("simulationSettings.infoText") }}
        </p>
      </InfoButton>
    </div>

    <div class="space-y-6">
      <div class="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-4">
        <label
          for="tax-rank-years-dropdown"
          class="text-sm font-medium text-foreground"
        >
          {{ t("simulationSettings.taxYear") }}
        </label>
        <DropDown
          id="tax-rank-years-dropdown"
          :choices="SUPPORTED_TAX_RANK_YEARS"
          :value="getCurrentTaxRankYear.toString()"
          data-cy="tax-rank-years-dropdown"
          @change="changeCurrentTaxRankYear"
        />
      </div>

      <fieldset data-cy="assessment-scenario">
        <legend class="text-sm font-medium text-foreground">
          {{ t("assessment.label") }}
        </legend>
        <div
          class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        >
          <label
            class="cursor-pointer rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-focus"
            :class="
              store.assessmentScenario === AssessmentScenario.Individual
                ? 'border-primary bg-primary-soft'
                : 'border-default hover:border-strong'
            "
          >
            <input
              type="radio"
              name="assessment-scenario"
              class="sr-only"
              :checked="
                store.assessmentScenario === AssessmentScenario.Individual
              "
              data-cy="assessment-scenario-individual"
              @change="
                store.setAssessmentScenario(AssessmentScenario.Individual)
              "
            />
            <span class="block text-sm font-semibold">
              {{ t("assessment.individual.label") }}
            </span>
            <span
              class="block text-xs"
              :class="
                store.assessmentScenario === AssessmentScenario.Individual
                  ? 'text-muted'
                  : 'text-subtle'
              "
            >
              {{ t("assessment.individual.description") }}
            </span>
          </label>
          <label
            class="cursor-pointer rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-focus"
            :class="
              store.assessmentScenario === AssessmentScenario.JointSingleIncome
                ? 'border-primary bg-primary-soft'
                : 'border-default hover:border-strong'
            "
          >
            <input
              type="radio"
              name="assessment-scenario"
              class="sr-only"
              :checked="
                store.assessmentScenario ===
                AssessmentScenario.JointSingleIncome
              "
              data-cy="assessment-scenario-joint-single-income"
              @change="
                store.setAssessmentScenario(
                  AssessmentScenario.JointSingleIncome,
                )
              "
            />
            <span class="block text-sm font-semibold">
              {{ t("assessment.jointSingleIncome.label") }}
            </span>
            <span
              class="block text-xs"
              :class="
                store.assessmentScenario ===
                AssessmentScenario.JointSingleIncome
                  ? 'text-muted'
                  : 'text-subtle'
              "
            >
              {{ t("assessment.jointSingleIncome.description") }}
            </span>
          </label>
        </div>
        <p
          v-if="
            store.assessmentScenario === AssessmentScenario.JointSingleIncome
          "
          class="mt-2 text-xs text-subtle"
        >
          {{ t("assessment.jointSingleIncome.help") }}
        </p>
      </fieldset>

      <DependentAgeGroups />

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
      >
        <div>
          <label
            for="paid-months-per-year-input"
            class="mb-2 block text-sm font-medium text-foreground"
          >
            {{ t("schedule.paidMonths.label") }}
          </label>
          <AdjustCounter
            :value="store.nrMonthsDisplay"
            :min="1"
            :unit="paidMonthsUnit"
            input-id="paid-months-per-year-input"
            :input-label="t('schedule.paidMonths.label')"
            :decrease-label="t('schedule.paidMonths.decrease')"
            :increase-label="t('schedule.paidMonths.increase')"
            data-cy="nr-months-display"
            @update:value="store.setNrMonthsDisplay"
          />
        </div>
        <div>
          <label
            for="unpaid-days-off-input"
            class="mb-2 block text-sm font-medium text-foreground"
          >
            {{ t("schedule.unpaidDays.label") }}
          </label>
          <AdjustCounter
            :value="store.nrDaysOff"
            :min="0"
            :max="YEAR_BUSINESS_DAYS - 1"
            :unit="unpaidDaysUnit"
            input-id="unpaid-days-off-input"
            :input-label="t('schedule.unpaidDays.label')"
            :decrease-label="t('schedule.unpaidDays.decrease')"
            :increase-label="t('schedule.unpaidDays.increase')"
            data-cy="nr-days-off"
            @update:value="store.setNrDaysOff"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { AssessmentScenario } from "@/typings";
import {
  SUPPORTED_TAX_RANK_YEARS,
  useTaxesStore,
  YEAR_BUSINESS_DAYS,
} from "@/store";
import AdjustCounter from "@/components/AdjustCounter.vue";
import DependentAgeGroups from "@/components/DependentAgeGroups.vue";
import DropDown from "@/components/DropDown.vue";
import InfoButton from "@/components/InfoButton.vue";

const store = useTaxesStore();
const { getCurrentTaxRankYear } = storeToRefs(store);
const { t } = useI18n({ useScope: "global" });

const paidMonthsUnit = computed(() =>
  t("units.monthUnit", {}, store.nrMonthsDisplay),
);
const unpaidDaysUnit = computed(() => t("units.dayUnit", {}, store.nrDaysOff));

const changeCurrentTaxRankYear = (
  taxRank: (typeof SUPPORTED_TAX_RANK_YEARS)[number],
) => {
  store.setCurrentTaxRankYearFromUser(taxRank);
};
</script>
