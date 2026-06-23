<template>
  <div class="relative mx-auto h-64 w-64">
    <canvas ref="canvasRef"></canvas>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <p
        class="text-center text-lg font-semibold text-neutral-700 whitespace-nowrap tabular-nums"
      >
        {{ asCurrency(grossIncome[displayFrequency]) }}
      </p>
      <small class="block text-center text-xs text-neutral-500">
        gross income
      </small>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Chart, registerables, type Chart as ChartInstance } from "chart.js";

import { storeToRefs } from "pinia";
import { asCurrency, asPercentage } from "@/utils.js";

import { useTaxesStore } from "@/store";
import ChartDataLabels from "chartjs-plugin-datalabels";

const { grossIncome, netIncome, irsPay, ssPay, colors, displayFrequency } =
  storeToRefs(useTaxesStore());

Chart.register(...registerables);
Chart.register(ChartDataLabels);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: ChartInstance<"doughnut"> | null = null;
onMounted(() => {
  buildChart();
});

const chartData = computed(() => {
  return {
    labels: ["Net Income", "IRS", "SS"],
    datasets: [
      {
        data: [
          netIncome.value[displayFrequency.value],
          irsPay.value[displayFrequency.value],
          ssPay.value[displayFrequency.value],
        ],
        backgroundColor: [
          colors.value.netIncome,
          colors.value.irs,
          colors.value.ss,
        ],
        hoverOffset: 4,
      },
    ],
  };
});
const chartOptions = computed(() => {
  return {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        textAlign: "center",
        formatter: (val, ctx) => {
          return (
            ctx.chart.data.labels[ctx.dataIndex] +
            "\n" +
            asPercentage(val / grossIncome.value[displayFrequency.value])
          );
        },
        color: "#fff",
      },
      tooltip: {
        callbacks: {
          label: function (item) {
            return asCurrency(item.raw, 2);
          },
        },
      },
    },
    responsive: true,
  };
});

watch(
  () => chartData.value,
  (newData) => {
    if (!chart) {
      return;
    }

    newData.datasets.forEach((d, i) => {
      chart.data.datasets[i].data = d.data;
    });
    chart.update();
  },
);

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
