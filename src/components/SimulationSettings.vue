<template>
  <section
    class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
    data-cy="simulation-settings"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-neutral-900">
          Simulation settings
        </h2>
        <p class="mt-1 text-xs text-neutral-500">
          Core assumptions used in the estimate.
        </p>
      </div>
      <InfoButton label="Income tax year information">
        <p>
          Tax years can change IAS values and IRS brackets. The selected year
          controls those published thresholds.
        </p>
      </InfoButton>
    </div>

    <div class="space-y-6">
      <div class="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-4">
        <label
          for="tax-rank-years-dropdown"
          class="text-sm font-medium text-neutral-700"
        >
          Income tax year
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
        <legend class="text-sm font-medium text-neutral-700">
          Tax assessment
        </legend>
        <div
          class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        >
          <label
            class="cursor-pointer rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-primary"
            :class="
              store.assessmentScenario === AssessmentScenario.Individual
                ? 'border-primary bg-sky-50'
                : 'border-neutral-300 hover:border-neutral-500'
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
            <span class="block text-sm font-semibold">Individual</span>
            <span class="block text-xs text-neutral-500">
              One taxpayer; no spouse or partner included.
            </span>
          </label>
          <label
            class="cursor-pointer rounded-lg border px-3 py-2 transition focus-within:ring-2 focus-within:ring-primary"
            :class="
              store.assessmentScenario === AssessmentScenario.JointSingleIncome
                ? 'border-primary bg-sky-50'
                : 'border-neutral-300 hover:border-neutral-500'
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
            <span class="block text-sm font-semibold">Joint - one income</span>
            <span class="block text-xs text-neutral-500">
              Household assessment with one EUR 0 income.
            </span>
          </label>
        </div>
        <p
          v-if="
            store.assessmentScenario === AssessmentScenario.JointSingleIncome
          "
          class="mt-2 text-xs text-neutral-500"
        >
          Uses the marital quotient for IRS bands.
        </p>
      </fieldset>

      <DependentAgeGroups />

      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
      >
        <div>
          <label
            for="paid-months-per-year-input"
            class="mb-2 block text-sm font-medium text-neutral-700"
          >
            Paid months per year
          </label>
          <AdjustCounter
            :value="store.nrMonthsDisplay"
            :min="1"
            unit="months"
            input-id="paid-months-per-year-input"
            input-label="Paid months per year"
            decrease-label="Decrease paid months per year"
            increase-label="Increase paid months per year"
            data-cy="nr-months-display"
            @update:value="store.setNrMonthsDisplay"
          />
        </div>
        <div>
          <label
            for="unpaid-days-off-input"
            class="mb-2 block text-sm font-medium text-neutral-700"
          >
            Unpaid days off
          </label>
          <AdjustCounter
            :value="store.nrDaysOff"
            :min="0"
            :max="YEAR_BUSINESS_DAYS - 1"
            unit="days"
            input-id="unpaid-days-off-input"
            input-label="Unpaid days off"
            decrease-label="Decrease unpaid days off"
            increase-label="Increase unpaid days off"
            data-cy="nr-days-off"
            @update:value="store.setNrDaysOff"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
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

const changeCurrentTaxRankYear = (
  taxRank: (typeof SUPPORTED_TAX_RANK_YEARS)[number],
) => {
  store.setCurrentTaxRankYearFromUser(taxRank);
};
</script>
