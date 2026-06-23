<template>
  <dl class="divide-y divide-neutral-100 text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="ss-relevant-income-row"
    >
      <dt class="text-neutral-600">Relevant income at 70%</dt>
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
      <dt class="text-neutral-600">Selected adjustment</dt>
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
      <dt class="text-neutral-600">Adjusted relevant income</dt>
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
      <dt class="text-neutral-600">Maximum base of 12 IAS</dt>
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
      <dt class="text-neutral-600">Contribution base applied</dt>
      <dd
        class="font-medium text-neutral-900 tabular-nums"
        data-cy="ss-contribution-base"
      >
        {{ asCurrency(store.ssContributionBase, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Calculated monthly contribution</dt>
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
      <dt class="text-neutral-600">Final monthly contribution</dt>
      <dd
        class="font-medium text-blue-700 tabular-nums"
        data-cy="ss-final-monthly-contribution"
      >
        {{ asCurrency(store.ssPay.month, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Annual final contribution</dt>
      <dd class="font-medium text-blue-700 tabular-nums">
        {{ asCurrency(store.ssPay.year, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Daily final contribution</dt>
      <dd class="font-medium text-blue-700 tabular-nums">
        {{ asCurrency(store.ssPay.day, 2) }}
      </dd>
    </div>
    <div class="py-3">
      <dt class="text-neutral-600">Current status</dt>
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
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";

const store = useTaxesStore();

const renderPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(0)}%`;
};

const ssAdjustmentStatusMessage = computed(() => {
  if (store.ssFirstYear) {
    return "Social Security exemption is active; this adjustment currently has no monetary effect.";
  }

  if (store.ssIsAtMinimumContribution) {
    return "Minimum monthly Social Security contribution applied.";
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return "Maximum contribution base reached. All available adjustments produce the same capped Social Security contribution.";
    }

    return `Maximum contribution base reached. ${renderPercentage(
      firstDiscountBelowCap,
    )} is the first available adjustment that changes the result.`;
  }

  return "No cap, minimum, or exemption is changing the Social Security result.";
});
</script>
