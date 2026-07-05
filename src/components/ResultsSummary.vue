<template>
  <section
    class="rounded-lg border border-default bg-surface p-4 shadow-sm"
    data-cy="results-summary"
  >
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h2 class="text-sm font-semibold text-foreground">
          {{ t("results.title") }}
        </h2>
        <p class="mt-1 text-xs text-subtle">
          {{ t("results.shownPer", { frequency: displayFrequencyLabel }) }}
        </p>
      </div>
      <div
        class="inline-flex rounded-lg border border-default bg-surface-muted p-1"
        :aria-label="t('frequency.showIncomePer')"
      >
        <button
          v-for="frequencyChoice in Object.keys(FrequencyChoices)"
          :key="frequencyChoice"
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-semibold uppercase text-foreground transition hover:bg-surface-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          :class="{
            'bg-secondary hover:bg-secondary ring-1 ring-primary cursor-default':
              displayFrequency === FrequencyChoices[frequencyChoice],
          }"
          data-cy="frequency-button"
          @click="setFrequency(frequencyChoice)"
        >
          {{ t(`frequency.${frequencyChoice}`) }}
        </button>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div class="rounded-lg border border-default p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-subtle">
          {{ grossIncomeLabel }}
        </p>
        <p class="mt-2 text-2xl font-semibold text-foreground tabular-nums">
          {{ grossIncomeDisplay }}
        </p>
        <p class="mt-1 text-xs text-subtle">/ {{ displayFrequencyLabel }}</p>
      </div>
      <div class="rounded-lg border border-income-soft p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-income">
          {{ netIncomeLabel }}
        </p>
        <p class="mt-2 text-2xl font-semibold text-income tabular-nums">
          {{ netIncomeDisplay }}
        </p>
        <p class="mt-1 text-xs text-subtle">/ {{ displayFrequencyLabel }}</p>
      </div>
      <div class="rounded-lg border border-irs-soft p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-irs">
          {{ t("results.totalTaxes") }}
        </p>
        <p class="mt-2 text-2xl font-semibold text-irs tabular-nums">
          {{ taxesDisplay }}
        </p>
        <dl class="mt-3 space-y-1 text-xs text-muted">
          <div class="flex justify-between gap-3">
            <dt>IRS</dt>
            <dd class="font-medium tabular-nums text-irs">
              {{ irsDisplay }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt>{{ t("table.socialSecurity") }}</dt>
            <dd class="font-medium tabular-nums text-social-security">
              {{ ssDisplay }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <p
      v-if="isJointTwoIncomes"
      class="mt-4 rounded-md border border-primary/20 bg-primary-soft px-3 py-2 text-xs text-muted"
      role="status"
      data-cy="household-results-note"
    >
      {{ t("results.householdIncludesSpouse") }}
    </p>

    <p
      v-if="specialSocialSecurityStatus"
      class="mt-4 rounded-md border border-warning-soft bg-warning-soft px-3 py-2 text-xs text-warning"
      role="status"
      data-cy="ss-special-status"
    >
      {{ specialSocialSecurityStatus }}
    </p>

    <div class="mt-5">
      <Table />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { FrequencyChoices } from "@/typings";
import { useTaxesStore } from "@/store";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import Table from "@/components/Table.vue";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });
const {
  displayFrequency,
  resultGrossIncome,
  netIncomeFrequency,
  isJointTwoIncomes,
  ssFrequency,
  irsFrequency,
} = storeToRefs(store);
const { formatCurrency, formatPercentage } = useLocalizedFormatters();

const setFrequency = (frequencyChoice: string) => {
  store.setDisplayFrequency(FrequencyChoices[frequencyChoice]);
};

const formatSignedPercentage = (value: number) => {
  return formatPercentage(value, 0, { signDisplay: "exceptZero" });
};

const grossIncomeLabel = computed(() =>
  isJointTwoIncomes.value
    ? t("results.householdGrossIncome")
    : t("results.grossIncome"),
);
const netIncomeLabel = computed(() =>
  isJointTwoIncomes.value
    ? t("results.householdNetIncome")
    : t("results.netIncome"),
);
const grossIncomeDisplay = computed(() =>
  formatCurrency(resultGrossIncome.value[displayFrequency.value]),
);
const netIncomeDisplay = computed(() =>
  formatCurrency(netIncomeFrequency.value),
);
const taxesDisplay = computed(() =>
  formatCurrency(irsFrequency.value + ssFrequency.value),
);
const irsDisplay = computed(() => formatCurrency(irsFrequency.value));
const ssDisplay = computed(() => formatCurrency(ssFrequency.value));

const displayFrequencyLabel = computed(() =>
  t(`frequency.${displayFrequency.value}`),
);

const specialSocialSecurityStatus = computed(() => {
  if (store.ssFirstYear) {
    return t("socialSecurityStatus.exemptionFinalZero");
  }

  if (store.ssIsAtMinimumContribution) {
    return t("socialSecurityStatus.minimumApplied");
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return t("socialSecurityStatus.cappedWithBase", {
        base: formatCurrency(store.ssContributionBase, 2),
      });
    }

    return t("socialSecurityStatus.cappedWithFirstChangingAdjustment", {
      base: formatCurrency(store.ssContributionBase, 2),
      percentage: formatSignedPercentage(firstDiscountBelowCap),
    });
  }

  return "";
});
</script>
