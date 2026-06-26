<template>
  <div class="relative" @click="showDropdown = !showDropdown">
    <input
      type="button"
      class="cursor-pointer w-full text-start py-2 placeholder:text-subtle bg-inherit border-b-2 border-strong relative focus:outline-none focus:border-focus"
      :id="id"
      :value="value"
      :aria-label="label"
      :aria-expanded="showDropdown"
      aria-haspopup="true"
      :class="{ 'text-primary': showDropdown }"
    />
    <ChevronDownIcon
      class="absolute h-5 right-0 bottom-3 text-subtle"
      :class="{ ' fill-primary': showDropdown }"
    />
    <div
      v-if="showDropdown"
      class="absolute top-full shadow-theme bg-surface-elevated overflow-y-auto overflow-x-hidden h-max-64 z-10 min-w-full w-20"
    >
      <button
        v-for="choice in choices"
        :key="choice"
        type="button"
        class="text-muted block px-4 py-2 text-sm hover:bg-surface-hover w-full"
        @click="changeChoice(choice)"
      >
        {{ getChoiceLabel(choice) }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

type Choice = string | number;

const emit = defineEmits<{
  (event: "change", value: Choice): void;
}>();

const props = withDefaults(
  defineProps<{
    id?: string;
    value?: Choice;
    displayValue?: string;
    label?: string;
    choices?: Choice[];
    choiceLabels?: Record<string, string>;
  }>(),
  {
    id: "menu-button",
    value: "",
    displayValue: undefined,
    label: "",
    choices: () => [],
    choiceLabels: () => ({}),
  },
);

const showDropdown = ref(false);
const value = computed(() => props.displayValue ?? props.value ?? "");
const getChoiceLabel = (choice: Choice) => {
  return props.choiceLabels[String(choice)] ?? String(choice);
};
const changeChoice = (choice: Choice) => {
  emit("change", choice);
};
</script>
