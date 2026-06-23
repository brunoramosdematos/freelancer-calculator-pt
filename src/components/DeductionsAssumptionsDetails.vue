<template>
  <dl class="divide-y divide-neutral-100 text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="professional-expenses-row"
    >
      <dt class="text-neutral-600">Professional expenses</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ asCurrency(store.expenses, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Expenses mode</dt>
      <dd class="font-medium text-neutral-900">
        {{ store.expensesAuto ? "Automatic" : "Manual" }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="expenses-still-needed-row"
    >
      <dt class="text-neutral-600">Expenses still needed</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ asCurrency(store.expensesNeeded, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Paid months per year</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ store.nrMonthsDisplay }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Unpaid days off</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ store.nrDaysOff }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Business days assumed</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ YEAR_BUSINESS_DAYS }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Youth IRS</dt>
      <dd class="font-medium text-neutral-900">
        {{ youthIrsStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">Activity-year reduction</dt>
      <dd class="font-medium text-neutral-900">
        {{ activityYearStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">NHR / RNH</dt>
      <dd class="font-medium text-neutral-900">
        {{ store.rnh ? "Active" : "Not active" }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">First 12 months SS exemption</dt>
      <dd class="font-medium text-neutral-900">
        {{ store.ssFirstYear ? "Active" : "Not active" }}
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaxesStore, YEAR_BUSINESS_DAYS } from "@/store";
import { asCurrency } from "@/utils.js";

const store = useTaxesStore();

const youthIrsStatus = computed(() =>
  store.benefitsOfYouthIrs
    ? `Active, year ${store.yearOfYouthIrs}`
    : "Not active",
);

const activityYearStatus = computed(() => {
  if (store.firstYear) {
    return "First fiscal year";
  }

  if (store.secondYear) {
    return "Second fiscal year";
  }

  return "None";
});
</script>
