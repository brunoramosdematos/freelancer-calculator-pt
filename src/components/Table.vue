<template>
  <div data-cy="financial-summary-table">
    <table v-if="breakpoint.mdAndUp" class="w-full text-sm text-neutral-700">
      <thead
        class="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500"
      >
        <tr>
          <th scope="col" class="py-3 text-left font-semibold">
            {{ t("table.title") }}
          </th>
          <th scope="col" class="py-3 text-right font-semibold">
            {{ t("frequency.Year") }}
          </th>
          <th scope="col" class="py-3 text-right font-semibold">
            {{ t("frequency.Month") }}
          </th>
          <th scope="col" class="py-3 text-right font-semibold">
            {{ t("frequency.Day") }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-100">
        <tr data-cy="gross-income-row">
          <th scope="row" class="py-3 text-left font-medium text-neutral-900">
            {{ t("table.grossIncome") }}
          </th>
          <td class="py-3 text-right tabular-nums whitespace-nowrap">
            {{ renderCellValue(grossIncome.year) }}
          </td>
          <td class="py-3 text-right tabular-nums whitespace-nowrap">
            {{ renderCellValue(grossIncome.month) }}
          </td>
          <td class="py-3 text-right tabular-nums whitespace-nowrap">
            {{ renderCellValue(grossIncome.day) }}
          </td>
        </tr>
        <tr data-cy="final-irs-row">
          <th scope="row" class="py-3 text-left font-medium text-neutral-900">
            IRS
          </th>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-red-700"
          >
            {{ renderCellValue(irsPay.year) }}
          </td>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-red-700"
          >
            {{ renderCellValue(irsPay.month) }}
          </td>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-red-700"
          >
            {{ renderCellValue(irsPay.day) }}
          </td>
        </tr>
        <tr data-cy="social-security-row">
          <th scope="row" class="py-3 text-left font-medium text-neutral-900">
            {{ t("table.socialSecurity") }}
          </th>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-blue-700"
          >
            {{ renderCellValue(ssPay.year) }}
          </td>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-blue-700"
          >
            {{ renderCellValue(ssPay.month) }}
          </td>
          <td
            class="py-3 text-right tabular-nums whitespace-nowrap text-blue-700"
          >
            {{ renderCellValue(ssPay.day) }}
          </td>
        </tr>
        <tr data-cy="net-income-row">
          <th scope="row" class="py-3 text-left font-semibold text-neutral-900">
            {{ t("table.netIncome") }}
          </th>
          <td
            class="py-3 text-right font-semibold tabular-nums whitespace-nowrap text-green-700"
          >
            {{ renderCellValue(netIncome.year) }}
          </td>
          <td
            class="py-3 text-right font-semibold tabular-nums whitespace-nowrap text-green-700"
          >
            {{ renderCellValue(netIncome.month) }}
          </td>
          <td
            class="py-3 text-right font-semibold tabular-nums whitespace-nowrap text-green-700"
          >
            {{ renderCellValue(netIncome.day) }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="space-y-2">
      <div
        v-for="row in mobileRows"
        :key="row.label"
        class="flex items-center justify-between gap-3 border-b border-neutral-100 py-2 text-sm"
        :data-cy="row.dataCy"
      >
        <span class="font-medium text-neutral-700">{{ row.label }}</span>
        <span
          class="text-right tabular-nums whitespace-nowrap"
          :class="row.valueClass"
        >
          {{ renderCellValue(row.value) }}
        </span>
      </div>
      <DisclosurePanel
        id="mobile-frequency-comparison"
        :title="t('frequency.compare')"
        heading-level="3"
        toggle-data-cy="mobile-frequency-comparison-toggle"
      >
        <div class="grid grid-cols-3 gap-2 text-xs text-neutral-600">
          <template v-for="frequency in frequencies" :key="frequency">
            <div class="font-semibold uppercase">
              {{ t(`frequency.${frequency}`) }}
            </div>
          </template>
          <template v-for="row in comparisonRows" :key="row.label">
            <div class="col-span-3 mt-2 font-medium text-neutral-900">
              {{ row.label }}
            </div>
            <div
              v-for="frequency in frequencies"
              :key="`${row.label}-${frequency}`"
              class="tabular-nums whitespace-nowrap"
            >
              {{ renderCellValue(row.values[frequency]) }}
            </div>
          </template>
        </div>
      </DisclosurePanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useTaxesStore } from "@/store";
import { FrequencyChoices } from "@/typings";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import { useBreakpoint } from "@/composables/breakpoints";
import DisclosurePanel from "@/components/DisclosurePanel.vue";

const { breakpoint } = useBreakpoint();
const { t } = useI18n({ useScope: "global" });
const { formatCurrency } = useLocalizedFormatters();
const { displayFrequency, grossIncome, netIncome, ssPay, irsPay } =
  storeToRefs(useTaxesStore());

const frequencies = [
  FrequencyChoices.Year,
  FrequencyChoices.Month,
  FrequencyChoices.Day,
];

const renderCellValue = (value: number | null | undefined) => {
  return typeof value === "number" && Number.isFinite(value)
    ? formatCurrency(value, breakpoint.smAndDown ? 0 : 2)
    : t("validation.noValue");
};

const mobileRows = computed(() => [
  {
    label: t("table.grossIncome"),
    dataCy: "gross-income-row",
    value: grossIncome.value[displayFrequency.value],
    valueClass: "text-neutral-900",
  },
  {
    label: "IRS",
    dataCy: "final-irs-row",
    value: irsPay.value[displayFrequency.value],
    valueClass: "text-red-700",
  },
  {
    label: t("table.socialSecurity"),
    dataCy: "social-security-row",
    value: ssPay.value[displayFrequency.value],
    valueClass: "text-blue-700",
  },
  {
    label: t("table.netIncome"),
    dataCy: "net-income-row",
    value: netIncome.value[displayFrequency.value],
    valueClass: "font-semibold text-green-700",
  },
]);

const comparisonRows = computed(() => [
  { label: t("table.grossIncome"), values: grossIncome.value },
  { label: "IRS", values: irsPay.value },
  { label: t("table.socialSecurity"), values: ssPay.value },
  { label: t("table.netIncome"), values: netIncome.value },
]);
</script>
