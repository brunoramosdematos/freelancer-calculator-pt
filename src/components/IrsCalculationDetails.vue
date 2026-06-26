<template>
  <div>
    <transition
      enter-active-class="duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-100 ease-in motion-reduce:transition-none"
      leave-from-class="opacity-100"
      leave-to-class="transform opacity-0"
    >
      <TaxRanksDialog
        v-if="showTaxRanksTable"
        @close="showTaxRanksTable = false"
      />
    </transition>

    <dl class="divide-y divide-neutral-100 text-sm">
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">
          {{ t("irsCalculation.specificDeductions") }}
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(specificDeductions) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">{{ t("irsCalculation.expenses") }}</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(expenses) }}
        </dd>
      </div>
      <div
        v-if="benefitsOfYouthIrs"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      >
        <dt class="text-neutral-600">
          {{ t("irsCalculation.youthIrsDiscount") }}
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(youthIrsDiscount) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="household-taxable-income-row"
      >
        <dt class="text-neutral-600">
          {{ t("irsCalculation.householdTaxableIncome") }}
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxableIncome) }}
        </dd>
      </div>
      <div
        v-if="!rnh"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="taxable-income-for-rates-row"
      >
        <dt class="text-neutral-600">
          {{ t("irsCalculation.taxableIncomeForRates") }}
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            {{ t("irsCalculation.dividedBy2") }}
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxableIncomeForRates) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">
          {{ t("irsCalculation.averageRatePortion") }}
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            {{ t("irsCalculation.quotient") }}
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxIncomeAvg) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">
          {{ t("irsCalculation.normalRatePortion") }}
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            {{ t("irsCalculation.quotient") }}
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxIncomeNormal) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">{{ t("irsCalculation.taxRank") }}</dt>
        <dd class="text-right font-medium text-neutral-900">
          <span class="tabular-nums">
            {{
              t("irsCalculation.levelOfTotal", {
                level: taxRank.id,
                total: getTaxRanks.length,
              })
            }}
          </span>
          <button
            type="button"
            class="ml-2 text-sm font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            @click="showTaxRanksTable = true"
          >
            {{ t("actions.viewRanks") }}
          </button>
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="gross-irs-before-dependent-deduction-row"
      >
        <dt class="text-neutral-600">
          {{ t("irsCalculation.irsBeforeDependentDeduction") }}
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(grossIrsBeforeDependentDeduction) }}
        </dd>
      </div>
      <div
        v-if="dependentTaxDeduction > 0"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="dependent-tax-deduction-applied-row"
      >
        <dt class="text-neutral-600">
          {{ t("irsCalculation.dependentDeductionApplied") }}
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(dependentTaxDeductionApplied) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="irs-final-detail-row"
      >
        <dt class="font-semibold text-neutral-900">
          {{ t("irsCalculation.finalIrs") }}
        </dt>
        <dd class="font-semibold text-red-700 tabular-nums">
          {{ renderCellValue(irsPay.year) }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useTaxesStore } from "@/store";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import TaxRanksDialog from "@/components/TaxRanksDialog.vue";

const {
  taxableIncome,
  taxableIncomeForRates,
  assessmentDivisor,
  specificDeductions,
  expenses,
  taxRank,
  irsPay,
  grossIrsBeforeDependentDeduction,
  dependentTaxDeduction,
  dependentTaxDeductionApplied,
  taxIncomeNormal,
  taxIncomeAvg,
  getTaxRanks,
  youthIrsDiscount,
  benefitsOfYouthIrs,
  rnh,
} = storeToRefs(useTaxesStore());

const showTaxRanksTable = ref(false);
const { t } = useI18n({ useScope: "global" });
const { formatCurrency } = useLocalizedFormatters();

const renderCellValue = (value: number | null | undefined) => {
  return typeof value === "number" && Number.isFinite(value)
    ? formatCurrency(value, 2)
    : t("validation.noValue");
};
</script>
