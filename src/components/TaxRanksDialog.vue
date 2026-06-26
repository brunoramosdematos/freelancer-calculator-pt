<template>
  <div
    id="defaultModal"
    tabindex="-1"
    aria-hidden="true"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full bg-black bg-opacity-15"
  >
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl md:h-auto"
    >
      <!-- Modal content -->
      <div class="relative bg-neutral-200 rounded-lg shadow">
        <!-- Modal header -->
        <div class="flex items-start justify-between p-4 border-b rounded-t">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ t("irsCalculation.dialog.title") }}
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            data-modal-hide="defaultModal"
            @click="$emit('close')"
          >
            <XMarkIcon class="w-5 h-5" />
            <span class="sr-only">{{ t("actions.closeModal") }}</span>
          </button>
        </div>

        <!-- Modal body -->
        <div class="p-6 space-y-6">
          <p>
            {{
              t("irsCalculation.dialog.intro", {
                amount: formatCurrency(taxableIncomeForRates),
                level: taxRank.id,
              })
            }}
            <span v-if="taxRankBoundaryText" class="text-sm">
              {{ taxRankBoundaryText }}
            </span>
          </p>

          <table class="w-full text-sm text-left text-gray-700 table-auto">
            <thead class="text-xs text-gray-700 uppercase border-b-2">
              <tr>
                <th class="text-center">
                  {{ t("irsCalculation.dialog.level") }}
                </th>
                <th class="text-center">
                  {{ t("irsCalculation.dialog.minimum") }}
                </th>
                <th class="text-center">
                  {{ t("irsCalculation.dialog.maximum") }}
                </th>
                <th class="text-center">
                  {{ t("irsCalculation.dialog.normalTax") }}
                </th>
                <th class="text-center">
                  {{ t("irsCalculation.dialog.averageTax") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in getTaxRanks"
                :key="item.id"
                :class="{ 'bg-neutral-300': item.id === taxRank.id }"
              >
                <td
                  class="py-1 text-center"
                  :class="{ 'text-red-500': item.id === taxRank.id }"
                >
                  {{ item.id }}
                </td>
                <td class="py-1 text-center whitespace-nowrap">
                  {{ formatCurrency(item.min) }}
                </td>
                <td class="py-1 text-center whitespace-nowrap">
                  {{ formatCurrency(item.max) }}
                </td>
                <td class="py-1 text-center whitespace-nowrap">
                  {{ formatPercentage(item.normalTax) }}
                </td>
                <td class="py-1 text-center whitespace-nowrap">
                  {{ formatPercentage(item.averageTax) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTaxesStore } from "@/store";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
// store
const { getTaxRanks, taxRank, taxableIncomeForRates } =
  storeToRefs(useTaxesStore());
const { t } = useI18n({ useScope: "global" });
const { formatCurrency, formatPercentage } = useLocalizedFormatters();

// taxRank
const taxRankBoundaryText = computed(() => {
  const boundaries: string[] = [];

  if (taxRank.value.min) {
    boundaries.push(
      t("irsCalculation.dialog.biggerThan", {
        amount: formatCurrency(taxRank.value.min),
      }),
    );
  }

  if (taxRank.value.max) {
    boundaries.push(
      t("irsCalculation.dialog.lowerThan", {
        amount: formatCurrency(taxRank.value.max),
      }),
    );
  }

  return boundaries.length
    ? `(${boundaries.join(` ${t("irsCalculation.dialog.and")} `)})`
    : "";
});
</script>
