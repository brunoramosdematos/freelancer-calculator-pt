<template>
  <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
    <div class="order-2 space-y-4 lg:order-1 lg:col-span-5">
      <SimulationSettings />
      <AdvancedTaxSettings
        @view-social-security-calculation="openSocialSecurityDetails"
      />
    </div>

    <div class="order-1 lg:order-2 lg:col-span-7">
      <ResultsSummary />
    </div>

    <div class="order-3 space-y-4 lg:col-span-7 lg:col-start-6">
      <DisclosurePanel
        id="income-breakdown-chart"
        title="Income breakdown chart"
        summary="Visual split of net income, IRS and Social Security"
        toggle-data-cy="income-breakdown-chart-toggle"
        panel-data-cy="income-breakdown-chart-panel"
        :unmount-content="true"
      >
        <Chart />
      </DisclosurePanel>

      <CalculationDetails
        :open="calculationDetailsOpen"
        :social-security-open="socialSecurityDetailsOpen"
        @update:open="calculationDetailsOpen = $event"
        @update:social-security-open="socialSecurityDetailsOpen = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import AdvancedTaxSettings from "@/components/AdvancedTaxSettings.vue";
import CalculationDetails from "@/components/CalculationDetails.vue";
import Chart from "@/components/Chart.vue";
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import ResultsSummary from "@/components/ResultsSummary.vue";
import SimulationSettings from "@/components/SimulationSettings.vue";

const calculationDetailsOpen = ref(false);
const socialSecurityDetailsOpen = ref(false);

const openSocialSecurityDetails = async () => {
  calculationDetailsOpen.value = true;
  socialSecurityDetailsOpen.value = true;

  await nextTick();
  document
    .getElementById("social-security-calculation-details-toggle")
    ?.focus();
};
</script>
