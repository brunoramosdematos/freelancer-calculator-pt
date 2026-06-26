<template>
  <div class="flex justify-start items-center">
    <button
      class="bg-surface-hover text-muted rounded-full font-bold px-1 py-1 hover:bg-surface-hover hover:text-foreground disabled:bg-surface-muted disabled:text-subtle"
      :disabled="counter <= min"
      :aria-label="resolvedDecreaseLabel"
      data-cy="counter-decrease"
      @click="decreaseValue"
    >
      <MinusIcon class="w-3" />
    </button>
    <span type="number" class="text-center py-2 w-20">
      <slot>
        <FormattedNumberInput
          :id="inputId"
          v-model:value="counterDisplay"
          class="text-center"
          :aria-label="inputId ? undefined : resolvedInputLabel"
        />
      </slot>
    </span>
    <span v-if="unit" class="mr-2 text-subtle text-xs">{{ unit }}</span>
    <button
      class="bg-surface-hover text-muted rounded-full font-bold px-1 py-1 hover:bg-surface-hover hover:text-foreground disabled:bg-surface-muted disabled:text-subtle"
      :disabled="max !== undefined && counter >= max"
      :aria-label="resolvedIncreaseLabel"
      data-cy="counter-increase"
      @click="increaseValue"
    >
      <PlusIcon class="w-3" />
    </button>
  </div>
</template>
<script lang="ts" setup>
import { MinusIcon, PlusIcon } from "@heroicons/vue/24/outline";

import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import FormattedNumberInput from "@/components/FormattedNumberInput.vue";
const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: false,
  },
  max: {
    type: Number,
    required: false,
  },
  unit: {
    type: String,
    required: false,
  },
  inputId: {
    type: String,
    required: false,
  },
  inputLabel: {
    type: String,
    required: false,
  },
  decreaseLabel: {
    type: String,
    required: false,
  },
  increaseLabel: {
    type: String,
    required: false,
  },
  step: {
    type: Number,
    default: 1,
  },
});

// value
const emits = defineEmits(["update:value"]);
const { t } = useI18n({ useScope: "global" });
const resolvedDecreaseLabel = computed(
  () => props.decreaseLabel ?? t("accessibility.decreaseValue"),
);
const resolvedIncreaseLabel = computed(
  () => props.increaseLabel ?? t("accessibility.increaseValue"),
);
const resolvedInputLabel = computed(
  () => props.inputLabel ?? t("accessibility.counterValue"),
);

const increaseValue = () => {
  if (props.max === undefined || counter.value < props.max) {
    const result = counter.value + props.step;
    counter.value =
      props.max !== undefined && result > props.max ? props.max : result;
    emits("update:value", counter.value);
  }
};

const decreaseValue = () => {
  if (props.min === undefined || counter.value > props.min) {
    const result = counter.value - props.step;
    counter.value =
      props.min !== undefined && result < props.min ? props.min : result;
    emits("update:value", counter.value);
  }
};

// counter
const counter = ref(props.value);
const counterDisplay = computed({
  get() {
    return counter.value;
  },
  set(value) {
    let _value = value;
    if (props.max !== undefined && _value > props.max) {
      _value = props.max;
    } else if (props.min !== undefined && _value < props.min) {
      _value = props.min;
    }
    counter.value = _value;
    emits("update:value", counter.value);
  },
});

// value updates counter
watch(
  () => props.value,
  (newValue) => {
    counter.value = newValue;
  },
);
</script>
