<template>
  <DisclosurePanel
    id="calculation-details"
    title="Calculation details"
    summary="IRS, Social Security, deductions and assumptions"
    :open="open"
    toggle-data-cy="calculation-details-toggle"
    panel-data-cy="calculation-details-panel"
    @update:open="$emit('update:open', $event)"
  >
    <div class="space-y-3">
      <DisclosurePanel
        id="irs-calculation-details"
        title="IRS calculation"
        summary="Taxable income, brackets and dependent deductions"
        heading-level="3"
        toggle-data-cy="irs-calculation-details-toggle"
        panel-data-cy="irs-calculation-details-panel"
      >
        <IrsCalculationDetails />
      </DisclosurePanel>

      <DisclosurePanel
        id="social-security-calculation-details"
        title="Social Security calculation"
        summary="70% base, adjustment, cap and final contribution"
        heading-level="3"
        :open="socialSecurityOpen"
        toggle-data-cy="social-security-calculation-details-toggle"
        panel-data-cy="social-security-calculation-details-panel"
        @update:open="$emit('update:socialSecurityOpen', $event)"
      >
        <SocialSecurityCalculationDetails />
      </DisclosurePanel>

      <DisclosurePanel
        id="deductions-assumptions-details"
        title="Deductions and assumptions"
        summary="Expenses, benefits and working-day assumptions"
        heading-level="3"
        toggle-data-cy="deductions-assumptions-details-toggle"
        panel-data-cy="deductions-assumptions-details-panel"
      >
        <DeductionsAssumptionsDetails />
      </DisclosurePanel>
    </div>
  </DisclosurePanel>
</template>

<script setup lang="ts">
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import DeductionsAssumptionsDetails from "@/components/DeductionsAssumptionsDetails.vue";
import IrsCalculationDetails from "@/components/IrsCalculationDetails.vue";
import SocialSecurityCalculationDetails from "@/components/SocialSecurityCalculationDetails.vue";

withDefaults(
  defineProps<{
    open?: boolean;
    socialSecurityOpen?: boolean;
  }>(),
  {
    open: false,
    socialSecurityOpen: false,
  },
);

defineEmits<{
  (event: "update:open", value: boolean): void;
  (event: "update:socialSecurityOpen", value: boolean): void;
}>();
</script>
