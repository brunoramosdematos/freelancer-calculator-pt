<template>
  <section class="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h2 class="text-sm font-semibold text-neutral-900">Results</h2>
        <p class="mt-1 text-xs text-neutral-500">
          Shown per {{ displayFrequency }}.
        </p>
      </div>
      <div
        class="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1"
        aria-label="Show income per"
      >
        <button
          v-for="frequencyChoice in Object.keys(FrequencyChoices)"
          :key="frequencyChoice"
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-semibold uppercase text-neutral-700 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          :class="{
            'bg-secondary hover:bg-secondary cursor-default':
              displayFrequency === FrequencyChoices[frequencyChoice],
          }"
          data-cy="frequency-button"
          @click="setFrequency(frequencyChoice)"
        >
          {{ frequencyChoice }}
        </button>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div class="rounded-lg border border-neutral-200 p-4">
        <p
          class="text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Gross income
        </p>
        <p class="mt-2 text-2xl font-semibold text-neutral-900 tabular-nums">
          {{ grossIncomeDisplay }}
        </p>
        <p class="mt-1 text-xs text-neutral-500">/ {{ displayFrequency }}</p>
      </div>
      <div class="rounded-lg border border-green-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-green-700">
          Net income
        </p>
        <p class="mt-2 text-2xl font-semibold text-green-700 tabular-nums">
          {{ netIncomeDisplay }}
        </p>
        <p class="mt-1 text-xs text-neutral-500">/ {{ displayFrequency }}</p>
      </div>
      <div class="rounded-lg border border-red-200 p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-red-700">
          Total taxes
        </p>
        <p class="mt-2 text-2xl font-semibold text-red-700 tabular-nums">
          {{ taxesDisplay }}
        </p>
        <dl class="mt-3 space-y-1 text-xs text-neutral-600">
          <div class="flex justify-between gap-3">
            <dt>IRS</dt>
            <dd class="font-medium tabular-nums text-red-700">
              {{ irsDisplay }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt>Social Security</dt>
            <dd class="font-medium tabular-nums text-blue-700">
              {{ ssDisplay }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <p
      v-if="specialSocialSecurityStatus"
      class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
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
import { storeToRefs } from "pinia";
import { FrequencyChoices } from "@/typings";
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";
import Table from "@/components/Table.vue";

const store = useTaxesStore();
const {
  displayFrequency,
  grossIncome,
  netIncomeDisplay,
  taxesDisplay,
  ssDisplay,
  irsDisplay,
} = storeToRefs(store);

const setFrequency = (frequencyChoice: string) => {
  store.setDisplayFrequency(FrequencyChoices[frequencyChoice]);
};

const formatSignedPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value * 100}%`;
};

const grossIncomeDisplay = computed(() =>
  asCurrency(grossIncome.value[displayFrequency.value]),
);

const specialSocialSecurityStatus = computed(() => {
  if (store.ssFirstYear) {
    return "Social Security exemption is active; final Social Security is EUR 0.";
  }

  if (store.ssIsAtMinimumContribution) {
    return "Minimum monthly Social Security contribution applied.";
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return `Maximum Social Security base applied · ${asCurrency(
        store.ssContributionBase,
        2,
      )}/month.`;
    }

    return `Maximum Social Security base applied · ${asCurrency(
      store.ssContributionBase,
      2,
    )}/month. ${formatSignedPercentage(
      firstDiscountBelowCap,
    )} is the first available adjustment that changes the result.`;
  }

  return "";
});
</script>
