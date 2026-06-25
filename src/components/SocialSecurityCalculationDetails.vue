<template>
  <dl class="divide-y divide-neutral-100 text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-relevant-income-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.relevantIncome") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-relevant-income-before-adjustment"
      >
        {{ asCurrency(store.ssRelevantIncomeBeforeAdjustment, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-selected-adjustment-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.selectedAdjustment") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-selected-adjustment"
      >
        {{ renderPercentage(store.ssDiscount) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-adjusted-relevant-income-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.adjustedRelevantIncome") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-adjusted-relevant-income"
      >
        {{ asCurrency(store.ssAdjustedRelevantIncome, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-contribution-base-cap-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.maximumBase") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-contribution-base-cap"
      >
        {{ asCurrency(store.ssContributionBaseCap, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-contribution-base-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.contributionBase") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-contribution-base"
      >
        {{ asCurrency(store.ssContributionBase, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.calculatedMonthlyContribution") }}
      </dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-calculated-monthly-contribution"
      >
        {{ asCurrency(store.ssCalculatedMonthlyContribution, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-final-monthly-contribution-row"
    >
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.finalMonthlyContribution") }}
      </dt>
      <dd
        class="font-medium text-blue-700 tabular-nums"
        data-cy="ss-final-monthly-contribution"
      >
        {{ asCurrency(store.ssPay.month, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.annualFinalContribution") }}
      </dt>
      <dd
        class="font-medium text-blue-700 tabular-nums"
        data-cy="ss-annual-final-contribution"
      >
        {{ asCurrency(store.ssPay.year, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.dailyFinalContribution") }}
      </dt>
      <dd
        class="font-medium text-blue-700 tabular-nums"
        data-cy="ss-daily-final-contribution"
      >
        {{ asCurrency(store.ssPay.day, 2) }}
      </dd>
    </div>
    <div class="py-3">
      <dt class="text-neutral-600">
        {{ t("socialSecurityCalculation.currentStatus") }}
      </dt>
      <dd
        class="mt-1 rounded-md bg-neutral-50 px-3 py-2 text-neutral-700"
        data-cy="ss-adjustment-status-message"
      >
        {{ ssAdjustmentStatusMessage }}
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });

const renderPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(0)}%`;
};

const ssAdjustmentStatusMessage = computed(() => {
  if (store.ssFirstYear) {
    return t("socialSecurityStatus.exemptionActive");
  }

  if (store.ssIsAtMinimumContribution) {
    return t("socialSecurityStatus.minimumApplied");
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return t("socialSecurityStatus.allAdjustmentsCapped");
    }

    return t("socialSecurityStatus.cappedFirstChangingAdjustment", {
      percentage: renderPercentage(firstDiscountBelowCap),
    });
  }

  return t("socialSecurityStatus.noEffect");
});
</script>
