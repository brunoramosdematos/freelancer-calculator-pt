<template>
  <DisclosurePanel
    id="calculation-details"
    :title="t('calculationDetails.title')"
    :summary="t('calculationDetails.summary')"
    :open="open"
    toggle-data-cy="calculation-details-toggle"
    panel-data-cy="calculation-details-panel"
    @update:open="$emit('update:open', $event)"
  >
    <div class="space-y-3">
      <DisclosurePanel
        id="irs-calculation-details"
        :title="t('calculationDetails.irsTitle')"
        :summary="t('calculationDetails.irsSummary')"
        heading-level="3"
        toggle-data-cy="irs-calculation-details-toggle"
        panel-data-cy="irs-calculation-details-panel"
      >
        <IrsCalculationDetails />
      </DisclosurePanel>

      <DisclosurePanel
        id="social-security-calculation-details"
        :title="t('calculationDetails.socialSecurityTitle')"
        :summary="t('calculationDetails.socialSecuritySummary')"
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
        :title="t('calculationDetails.deductionsTitle')"
        :summary="t('calculationDetails.deductionsSummary')"
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
import { useI18n } from "vue-i18n";
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

const { t } = useI18n({ useScope: "global" });
</script>
