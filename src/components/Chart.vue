<template>
  <div class="relative mx-auto h-64 w-64">
    <canvas
      ref="canvasRef"
      role="img"
      :aria-label="t('chart.ariaLabel')"
    ></canvas>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <p
        class="text-center text-lg font-semibold text-foreground whitespace-nowrap tabular-nums"
      >
        {{ formatCurrency(grossIncome[displayFrequency]) }}
      </p>
      <small class="block text-center text-xs text-subtle">
        {{ t("chart.grossIncome") }}
      </small>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  Chart,
  registerables,
  type Chart as ChartInstance,
  type ChartOptions,
} from "chart.js";
import { useI18n } from "vue-i18n";

import { storeToRefs } from "pinia";

import { useTaxesStore } from "@/store";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import { useTheme } from "@/composables/useTheme";

const { grossIncome, netIncome, irsPay, ssPay, displayFrequency } =
  storeToRefs(useTaxesStore());
const { t, locale } = useI18n({ useScope: "global" });
const { formatCurrency, formatPercentage } = useLocalizedFormatters();
const { resolvedTheme } = useTheme();

Chart.register(...registerables);
Chart.register(ChartDataLabels);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: ChartInstance<"doughnut"> | null = null;
onMounted(() => {
  buildChart();
});

const getThemeRgb = (name: string, fallback: string) => {
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(name).trim();
  return value ? `rgb(${value})` : fallback;
};

const chartPalette = computed(() => {
  const isDark = resolvedTheme.value === "dark";

  return {
    netIncome: getThemeRgb("--color-income", isDark ? "#86efac" : "#15803d"),
    irs: getThemeRgb("--color-irs", isDark ? "#fb7185" : "#be123c"),
    ss: getThemeRgb("--color-social-security", isDark ? "#93c5fd" : "#1d4ed8"),
    label: getThemeRgb("--color-chart-label", isDark ? "#0f172a" : "#ffffff"),
    tooltipBackground: getThemeRgb(
      "--color-chart-tooltip",
      isDark ? "#f8fafc" : "#171717",
    ),
    tooltipText: getThemeRgb(
      "--color-chart-tooltip-text",
      isDark ? "#0f172a" : "#ffffff",
    ),
  };
});

const chartData = computed(() => {
  return {
    labels: [t("chart.netIncome"), "IRS", t("chart.socialSecurity")],
    datasets: [
      {
        data: [
          netIncome.value[displayFrequency.value],
          irsPay.value[displayFrequency.value],
          ssPay.value[displayFrequency.value],
        ],
        backgroundColor: [
          chartPalette.value.netIncome,
          chartPalette.value.irs,
          chartPalette.value.ss,
        ],
        hoverOffset: 4,
      },
    ],
  };
});
const chartOptions = computed<ChartOptions<"doughnut">>(() => {
  return {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        textAlign: "center" as const,
        formatter: (val, ctx) => {
          return (
            ctx.chart.data.labels[ctx.dataIndex] +
            "\n" +
            formatPercentage(val / grossIncome.value[displayFrequency.value])
          );
        },
        color: chartPalette.value.label,
      },
      tooltip: {
        backgroundColor: chartPalette.value.tooltipBackground,
        bodyColor: chartPalette.value.tooltipText,
        titleColor: chartPalette.value.tooltipText,
        callbacks: {
          label: function (item) {
            return formatCurrency(item.raw as number, 2);
          },
        },
      },
    },
    responsive: true,
  };
});

watch([chartData, chartOptions, locale, resolvedTheme], ([data, options]) => {
  if (!chart) {
    return;
  }

  chart.data.labels = data.labels;
  data.datasets.forEach((d, i) => {
    chart.data.datasets[i].data = d.data;
    chart.data.datasets[i].backgroundColor = d.backgroundColor;
  });
  chart.options = options;
  chart.update();
});

onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});

const buildChart = () => {
  chart?.destroy();

  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) {
    return;
  }

  chart = new Chart(ctx, {
    type: "doughnut",
    data: chartData.value,
    options: chartOptions.value,
  });
  chart.update();
};
</script>
