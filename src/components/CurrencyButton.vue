<template>
  <button
    class="bg-surface-elevated rounded-full px-3 py-2 hover:bg-surface-hover whitespace-nowrap"
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
