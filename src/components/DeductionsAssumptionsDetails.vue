<template>
  <dl class="divide-y divide-neutral-100 text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="professional-expenses-row"
    >
      <dt class="text-neutral-600">
        {{ t("deductions.professionalExpenses") }}
      </dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ asCurrency(store.expenses, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">{{ t("deductions.expensesMode") }}</dt>
      <dd class="font-medium text-neutral-900">
        {{
          store.expensesAuto
            ? t("deductions.automatic")
            : t("deductions.manual")
        }}
      </dd>
    </div>
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="expenses-still-needed-row"
    >
      <dt class="text-neutral-600">
        {{ t("deductions.expensesStillNeeded") }}
      </dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ asCurrency(store.expensesNeeded, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">{{ t("deductions.paidMonths") }}</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ store.nrMonthsDisplay }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">{{ t("deductions.unpaidDays") }}</dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ store.nrDaysOff }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">
        {{ t("deductions.businessDaysAssumed") }}
      </dt>
      <dd class="font-medium text-neutral-900 tabular-nums">
        {{ YEAR_BUSINESS_DAYS }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">{{ t("deductions.youthIrs") }}</dt>
      <dd class="font-medium text-neutral-900">
        {{ youthIrsStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">
        {{ t("deductions.activityYearReduction") }}
      </dt>
      <dd class="font-medium text-neutral-900">
        {{ activityYearStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">NHR / RNH</dt>
      <dd class="font-medium text-neutral-900">
        {{ store.rnh ? t("deductions.active") : t("deductions.notActive") }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-neutral-600">{{ t("deductions.ssFirstYear") }}</dt>
      <dd class="font-medium text-neutral-900">
        {{
          store.ssFirstYear ? t("deductions.active") : t("deductions.notActive")
        }}
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTaxesStore, YEAR_BUSINESS_DAYS } from "@/store";
import { asCurrency } from "@/utils.js";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });

const youthIrsStatus = computed(() =>
  store.benefitsOfYouthIrs
    ? t("deductions.activeYear", { year: store.yearOfYouthIrs })
    : t("deductions.notActive"),
);

const activityYearStatus = computed(() => {
  if (store.firstYear) {
    return t("advancedSettings.activityYear.first");
  }

  if (store.secondYear) {
    return t("advancedSettings.activityYear.second");
  }

  return t("advancedSettings.activityYear.none");
});
</script>
