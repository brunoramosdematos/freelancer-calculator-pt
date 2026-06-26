<template>
  <input
    v-model="internalValue"
    type="text"
    class="z-0 inline-flex w-full justify-start py-2 placeholder:text-neutral-400 bg-inherit border-b-[1px] border-neutral-600 relative focus:outline-none focus:border-primary"
    :class="class"
    :placeholder="placeholder"
    inputmode="numeric"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";

const emits = defineEmits(["update:value"]);
const props = defineProps({
  value: {
    type: Number,
    required: false,
  },
  class: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
});
const { formatInputInteger, parseInputInteger } = useLocalizedFormatters();

const internalValue = computed({
  get() {
    const _value = props.value;
    return _value === null || isNaN(_value) || _value === undefined
      ? ""
      : formatInputInteger(_value);
  },
  set(newValue: string) {
    const result = parseInputInteger(newValue);
    emits("update:value", result ?? 0);
  },
});
</script>
