<template>
  <transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="transform opacity-0"
  >
    <TaxRanksDialog
      v-if="showTaxRanksTable"
      @close="showTaxRanksTable = false"
    />
  </transition>
  <table class="w-full text-xs md:text-sm text-left text-gray-700">
    <thead class="text-xs text-gray-700 uppercase border-b-2">
      <tr>
        <th class="py-3 text-left">Title</th>
        <th class="py-3 text-left">Year</th>
        <th class="py-3 text-left">Month</th>
        <th class="py-3 text-left">Day</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="py-3">Gross income</td>
        <td class="py-3 whitespace-nowrap">
          {{ renderCellValue(grossIncome.year) }}
        </td>
        <td class="py-3 whitespace-nowrap">
          {{ renderCellValue(grossIncome.month) }}
        </td>
        <td class="py-3 whitespace-nowrap">
          {{ renderCellValue(grossIncome.day) }}
        </td>
      </tr>

      <tr>
        <td colspan="4" class="text-center bg-neutral-200 py-3">
          <div class="flex justify-center space-x-3 items-center">
            <b>IRS estimation</b>
            <span class="text-xs ml-3">
              tax rank level
              <span class="text-red-400">{{ taxRank.id }}</span> (out of
              {{ getTaxRanks.length }})
            </span>
            <InfoButton @onClick="showTaxRanksTable = true">
              <p class="text-xs xl:w-32 text-center">Show tax ranks table</p>
            </InfoButton>
          </div>
        </td>
      </tr>
      <tr class="border-b-2">
        <td class="pl-2 py-3">Specific deductions</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(specificDeductions) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2">
        <td class="pl-2 py-3">Expenses</td>
        <td class="whitespace-nowrap">{{ renderCellValue(expenses) }}</td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr v-if="benefitsOfYouthIrs" class="border-b-2">
        <td class="pl-2 py-3">Youth IRS Discount</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(youthIrsDiscount) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="household-taxable-income-row">
        <td class="pl-2 py-3">Household taxable income</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(taxableIncome) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr v-if="!rnh" class="border-b-2" data-cy="taxable-income-for-rates-row">
        <td class="pl-2 py-3">
          Taxable income used for IRS rates
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (divided by 2)
          </span>
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(taxableIncomeForRates) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr v-if="!rnh" class="border-b-2">
        <td class="pl-2 py-3">
          Taxable income for average tax
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (quotient)
          </span>
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(taxIncomeAvg) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr v-if="!rnh" class="border-b-2">
        <td class="pl-2 py-3">
          Taxable income for normal tax
          <span v-if="assessmentDivisor > 1" class="text-neutral-500">
            (quotient)
          </span>
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(taxIncomeNormal) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="gross-irs-before-dependent-deduction-row">
        <td class="pl-2 py-3">IRS before dependent deduction</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(grossIrsBeforeDependentDeduction) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr
        v-if="dependentTaxDeduction > 0"
        class="border-b-2"
        data-cy="dependent-tax-deduction-applied-row"
      >
        <td class="pl-2 py-3">Dependent deduction applied</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(dependentTaxDeductionApplied) }}
        </td>
        <td class="grey lighten-4"></td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="bg-red-100" data-cy="final-irs-row">
        <td class="pl-2 py-3">Final IRS</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(irsPay.year) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(irsPay.month) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(irsPay.day) }}
        </td>
      </tr>
      <tr>
        <td colspan="4" class="text-center bg-blue-50 py-3">
          <b>Social Security calculation</b>
        </td>
      </tr>
      <tr class="border-b-2" data-cy="ss-relevant-income-row">
        <td class="pl-2 py-3">Relevant income at 70%</td>
        <td class="grey lighten-4"></td>
        <td
          class="whitespace-nowrap"
          data-cy="ss-relevant-income-before-adjustment-value"
        >
          {{ renderCellValue(ssRelevantIncomeBeforeAdjustment) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="ss-selected-adjustment-row">
        <td class="pl-2 py-3">Selected adjustment</td>
        <td class="grey lighten-4"></td>
        <td class="whitespace-nowrap" data-cy="ss-selected-adjustment-value">
          {{ renderPercentage(ssDiscount) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="ss-adjusted-relevant-income-row">
        <td class="pl-2 py-3">Adjusted relevant income</td>
        <td class="grey lighten-4"></td>
        <td
          class="whitespace-nowrap"
          data-cy="ss-adjusted-relevant-income-value"
        >
          {{ renderCellValue(ssAdjustedRelevantIncome) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="ss-contribution-base-cap-row">
        <td class="pl-2 py-3">Maximum base of 12 IAS</td>
        <td class="grey lighten-4"></td>
        <td class="whitespace-nowrap" data-cy="ss-contribution-base-cap-value">
          {{ renderCellValue(ssContributionBaseCap) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="ss-contribution-base-row">
        <td class="pl-2 py-3">Contribution base applied</td>
        <td class="grey lighten-4"></td>
        <td class="whitespace-nowrap" data-cy="ss-contribution-base-value">
          {{ renderCellValue(ssContributionBase) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="border-b-2" data-cy="ss-final-monthly-contribution-row">
        <td class="pl-2 py-3">Final monthly Social Security contribution</td>
        <td class="grey lighten-4"></td>
        <td
          class="whitespace-nowrap"
          data-cy="ss-final-monthly-contribution-value"
        >
          {{ renderCellValue(ssPay.month) }}
        </td>
        <td class="grey lighten-4"></td>
      </tr>
      <tr class="bg-blue-100">
        <td class="pl-2 py-3">Social security</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(ssPay.year) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(ssPay.month) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(ssPay.day) }}
        </td>
      </tr>
      <tr class="bg-green-100">
        <td class="pl-2 py-3">Net income</td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(netIncome.year) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(netIncome.month) }}
        </td>
        <td class="whitespace-nowrap">
          {{ renderCellValue(netIncome.day) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";
import InfoButton from "@/components/InfoButton.vue";
import TaxRanksDialog from "./TaxRanksDialog.vue";
import { useBreakpoint } from "@/composables/breakpoints";
const { breakpoint } = useBreakpoint();
// store
const {
  grossIncome,
  taxableIncome,
  taxableIncomeForRates,
  assessmentDivisor,
  specificDeductions,
  expenses,
  netIncome,
  taxRank,
  ssPay,
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
  ssAdjustedRelevantIncome,
  ssContributionBase,
  ssContributionBaseCap,
  ssDiscount,
  ssRelevantIncomeBeforeAdjustment,
} = storeToRefs(useTaxesStore());

const decimalCases = computed(() => {
  return breakpoint.smAndDown ? 0 : 2;
});

const renderCellValue = (value: number) => {
  return value ? asCurrency(value, decimalCases.value) : "-";
};
const renderPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(0)}%`;
};
const showTaxRanksTable = ref(false);
</script>
