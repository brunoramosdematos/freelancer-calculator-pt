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
        <dt class="text-neutral-600">Specific deductions</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(specificDeductions) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">Expenses</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(expenses) }}
        </dd>
      </div>
      <div
        v-if="benefitsOfYouthIrs"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      >
        <dt class="text-neutral-600">Youth IRS discount</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(youthIrsDiscount) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="household-taxable-income-row"
      >
        <dt class="text-neutral-600">Household taxable income</dt>
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
          Taxable income used for IRS rates
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (divided by 2)
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxableIncomeForRates) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">
          Average-rate portion
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (quotient)
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxIncomeAvg) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">
          Normal-rate portion
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (quotient)
          </span>
        </dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(taxIncomeNormal) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-neutral-600">Tax rank</dt>
        <dd class="text-right font-medium text-neutral-900">
          <span class="tabular-nums">
            Level {{ taxRank.id }} of {{ getTaxRanks.length }}
          </span>
          <button
            type="button"
            class="ml-2 text-sm font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            @click="showTaxRanksTable = true"
          >
            View ranks
          </button>
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="gross-irs-before-dependent-deduction-row"
      >
        <dt class="text-neutral-600">IRS before dependent deduction</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(grossIrsBeforeDependentDeduction) }}
        </dd>
      </div>
      <div
        v-if="dependentTaxDeduction > 0"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="dependent-tax-deduction-applied-row"
      >
        <dt class="text-neutral-600">Dependent deduction applied</dt>
        <dd class="font-medium text-neutral-900 tabular-nums">
          {{ renderCellValue(dependentTaxDeductionApplied) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="irs-final-detail-row"
      >
        <dt class="font-semibold text-neutral-900">Final IRS</dt>
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
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";
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

const renderCellValue = (value: number | null | undefined) => {
  return typeof value === "number" && Number.isFinite(value)
    ? asCurrency(value, 2)
    : "-";
};
</script>
