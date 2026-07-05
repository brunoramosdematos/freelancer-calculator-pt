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

    <dl class="divide-y divide-default text-sm">
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-muted">
          {{ t("irsCalculation.specificDeductions") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(specificDeductions) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-muted">{{ t("irsCalculation.expenses") }}</dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(expenses) }}
        </dd>
      </div>
      <div
        v-if="benefitsOfYouthIrs"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.youthIrsDiscount") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(youthIrsDiscount) }}
        </dd>
      </div>
      <div
        v-if="isJointTwoIncomes"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="freelancer-taxable-income-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.freelancerTaxableIncome") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(freelancerTaxableIncome) }}
        </dd>
      </div>
      <div
        v-if="isJointTwoIncomes"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="spouse-annual-gross-income-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.spouseAnnualGrossIncome") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(activeSpouseAnnualGrossIncome) }}
        </dd>
      </div>
      <div
        v-if="isJointTwoIncomes"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="spouse-specific-deduction-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.spouseSpecificDeduction") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(spouseSpecificDeduction) }}
        </dd>
      </div>
      <div
        v-if="isJointTwoIncomes"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="spouse-taxable-income-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.spouseTaxableIncome") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(spouseTaxableIncome) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="household-taxable-income-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.householdTaxableIncome") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(taxableIncome) }}
        </dd>
      </div>
      <div
        v-if="!rnh"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="taxable-income-for-rates-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.taxableIncomeForRates") }}
          <span v-if="assessmentDivisor > 1" class="text-subtle">
            {{ t("irsCalculation.dividedBy2") }}
          </span>
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(taxableIncomeForRates) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-muted">
          {{ t("irsCalculation.averageRatePortion") }}
          <span v-if="assessmentDivisor > 1" class="text-subtle">
            {{ t("irsCalculation.quotient") }}
          </span>
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(taxIncomeAvg) }}
        </dd>
      </div>
      <div v-if="!rnh" class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-muted">
          {{ t("irsCalculation.normalRatePortion") }}
          <span v-if="assessmentDivisor > 1" class="text-subtle">
            {{ t("irsCalculation.quotient") }}
          </span>
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(taxIncomeNormal) }}
        </dd>
      </div>
      <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
        <dt class="text-muted">{{ t("irsCalculation.taxRank") }}</dt>
        <dd class="text-right font-medium text-foreground">
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
            class="ml-2 text-sm font-medium text-primary underline underline-offset-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            data-cy="view-tax-ranks-button"
            @click="showTaxRanksTable = true"
          >
            {{ t("actions.viewRanks") }}
          </button>
        </dd>
      </div>
      <div
        v-if="isJointTwoIncomes"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="social-security-freelancer-only-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.socialSecurityScope") }}
        </dt>
        <dd class="text-right font-medium text-foreground">
          {{ t("irsCalculation.socialSecurityFreelancerOnly") }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="gross-irs-before-dependent-deduction-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.irsBeforeDependentDeduction") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(grossIrsBeforeDependentDeduction) }}
        </dd>
      </div>
      <div
        v-if="dependentTaxDeduction > 0"
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="dependent-tax-deduction-applied-row"
      >
        <dt class="text-muted">
          {{ t("irsCalculation.dependentDeductionApplied") }}
        </dt>
        <dd class="font-medium text-foreground tabular-nums">
          {{ renderCellValue(dependentTaxDeductionApplied) }}
        </dd>
      </div>
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3"
        data-cy="irs-final-detail-row"
      >
        <dt class="font-semibold text-foreground">
          {{ t("irsCalculation.finalIrs") }}
        </dt>
        <dd class="font-semibold text-irs tabular-nums">
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
  freelancerTaxableIncome,
  activeSpouseAnnualGrossIncome,
  spouseSpecificDeduction,
  spouseTaxableIncome,
  isJointTwoIncomes,
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
