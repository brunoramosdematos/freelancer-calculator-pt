<template>
  <button
    class="bg-neutral-200 rounded-full px-3 py-2 hover:bg-neutral-300 whitespace-nowrap"
    @click="store.setIncome(value)"
  >
    {{ formatCurrency(value) }}
  </button>
</template>
<script lang="ts" setup>
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import { useTaxesStore } from "@/store";

const store = useTaxesStore();
const { formatCurrency } = useLocalizedFormatters();
defineProps({ value: { type: Number } });
</script>
