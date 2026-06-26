<template>
  <dl class="divide-y divide-default text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-relevant-income-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.relevantIncome") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-relevant-income-before-adjustment"
      >
        {{ formatCurrency(store.ssRelevantIncomeBeforeAdjustment, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-selected-adjustment-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.selectedAdjustment") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-selected-adjustment"
      >
        {{ renderPercentage(store.ssDiscount) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-adjusted-relevant-income-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.adjustedRelevantIncome") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-adjusted-relevant-income"
      >
        {{ formatCurrency(store.ssAdjustedRelevantIncome, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-contribution-base-cap-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.maximumBase") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-contribution-base-cap"
      >
        {{ formatCurrency(store.ssContributionBaseCap, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-contribution-base-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.contributionBase") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-contribution-base"
      >
        {{ formatCurrency(store.ssContributionBase, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.calculatedMonthlyContribution") }}
      </dt>
      <dd
        class="font-medium text-foreground tabular-nums"
        data-cy="ss-calculated-monthly-contribution"
      >
        {{ formatCurrency(store.ssCalculatedMonthlyContribution, 2) }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-final-monthly-contribution-row"
    >
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.finalMonthlyContribution") }}
      </dt>
      <dd
        class="font-medium text-social-security tabular-nums"
        data-cy="ss-final-monthly-contribution"
      >
        {{ formatCurrency(store.ssPay.month, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.annualFinalContribution") }}
      </dt>
      <dd
        class="font-medium text-social-security tabular-nums"
        data-cy="ss-annual-final-contribution"
      >
        {{ formatCurrency(store.ssPay.year, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.dailyFinalContribution") }}
      </dt>
      <dd
        class="font-medium text-social-security tabular-nums"
        data-cy="ss-daily-final-contribution"
      >
        {{ formatCurrency(store.ssPay.day, 2) }}
      </dd>
    </div>
    <div class="py-3">
      <dt class="text-muted">
        {{ t("socialSecurityCalculation.currentStatus") }}
      </dt>
      <dd
        class="mt-1 rounded-md bg-surface-muted px-3 py-2 text-foreground"
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
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });
const { formatCurrency, formatPercentage } = useLocalizedFormatters();

const renderPercentage = (value: number) => {
  return formatPercentage(value, 0, { signDisplay: "exceptZero" });
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
