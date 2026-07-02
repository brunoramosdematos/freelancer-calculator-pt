<template>
  <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
    <div
      data-cy="dashboard-settings-column"
      class="contents lg:order-1 lg:col-span-5 lg:block lg:space-y-4"
    >
      <div class="order-2 lg:order-none">
        <SimulationSettings />
      </div>
      <div class="order-3 lg:order-none">
        <AdvancedTaxSettings
          @view-social-security-calculation="openSocialSecurityDetails"
        />
      </div>
    </div>

    <div
      data-cy="dashboard-results-column"
      class="contents lg:order-2 lg:col-span-7 lg:block lg:space-y-4"
    >
      <div class="order-1 lg:order-none">
        <ResultsSummary />
      </div>

      <div
        data-cy="income-breakdown-chart-container"
        class="order-4 lg:order-none"
      >
        <DisclosurePanel
          id="income-breakdown-chart"
          :title="t('chart.title')"
          :summary="t('chart.summary')"
          :open="chartOpen"
          toggle-data-cy="income-breakdown-chart-toggle"
          panel-data-cy="income-breakdown-chart-panel"
          :unmount-content="true"
          @update:open="setChartOpen"
        >
          <Suspense v-if="chartRequested">
            <AsyncChart />
            <template #fallback>
              <p class="py-6 text-center text-sm text-muted" role="status">
                {{ t("chart.loading") }}
              </p>
            </template>
          </Suspense>
        </DisclosurePanel>
      </div>

      <div
        data-cy="calculation-details-container"
        class="order-4 lg:order-none"
      >
        <CalculationDetails
          :open="calculationDetailsOpen"
          :social-security-open="socialSecurityDetailsOpen"
          @update:open="calculationDetailsOpen = $event"
          @update:social-security-open="socialSecurityDetailsOpen = $event"
        />
      </div>

      <div class="order-6 lg:order-none">
        <ScenarioComparison />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import AdvancedTaxSettings from "@/components/AdvancedTaxSettings.vue";
import CalculationDetails from "@/components/CalculationDetails.vue";
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import ResultsSummary from "@/components/ResultsSummary.vue";
import ScenarioComparison from "@/components/ScenarioComparison.vue";
import SimulationSettings from "@/components/SimulationSettings.vue";

const AsyncChart = defineAsyncComponent(() => import("@/components/Chart.vue"));
const calculationDetailsOpen = ref(false);
const socialSecurityDetailsOpen = ref(false);
const chartOpen = ref(false);
const chartRequested = ref(false);
const { t } = useI18n({ useScope: "global" });

const setChartOpen = (open: boolean) => {
  chartOpen.value = open;
  if (open) {
    chartRequested.value = true;
  }
};

const openSocialSecurityDetails = async () => {
  calculationDetailsOpen.value = true;
  socialSecurityDetailsOpen.value = true;

  await nextTick();
  document
    .getElementById("social-security-calculation-details-toggle")
    ?.focus();
};
</script>
