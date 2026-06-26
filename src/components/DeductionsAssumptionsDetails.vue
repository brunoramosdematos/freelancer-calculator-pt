<template>
  <dl class="divide-y divide-default text-sm">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      data-cy="professional-expenses-row"
    >
      <dt class="text-muted">
        {{ t("deductions.professionalExpenses") }}
      </dt>
      <dd class="font-medium text-foreground tabular-nums">
        {{ formatCurrency(store.expenses, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">{{ t("deductions.expensesMode") }}</dt>
      <dd class="font-medium text-foreground">
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
      <dt class="text-muted">
        {{ t("deductions.expensesStillNeeded") }}
      </dt>
      <dd class="font-medium text-foreground tabular-nums">
        {{ formatCurrency(store.expensesNeeded, 2) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">{{ t("deductions.paidMonths") }}</dt>
      <dd class="font-medium text-foreground tabular-nums">
        {{ formatInteger(store.nrMonthsDisplay) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">{{ t("deductions.unpaidDays") }}</dt>
      <dd class="font-medium text-foreground tabular-nums">
        {{ formatInteger(store.nrDaysOff) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">
        {{ t("deductions.businessDaysAssumed") }}
      </dt>
      <dd class="font-medium text-foreground tabular-nums">
        {{ formatInteger(YEAR_BUSINESS_DAYS) }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">{{ t("deductions.youthIrs") }}</dt>
      <dd class="font-medium text-foreground">
        {{ youthIrsStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">
        {{ t("deductions.activityYearReduction") }}
      </dt>
      <dd class="font-medium text-foreground">
        {{ activityYearStatus }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">NHR / RNH</dt>
      <dd class="font-medium text-foreground">
        {{ store.rnh ? t("deductions.active") : t("deductions.notActive") }}
      </dd>
    </div>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
      <dt class="text-muted">{{ t("deductions.ssFirstYear") }}</dt>
      <dd class="font-medium text-foreground">
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
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });
const { formatCurrency, formatInteger } = useLocalizedFormatters();

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
