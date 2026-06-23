<template>
  <section class="rounded-lg border border-neutral-200 bg-white shadow-sm">
    <component :is="headingTag" class="m-0">
      <button
        :id="buttonId"
        type="button"
        class="flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :aria-expanded="isOpen.toString()"
        :aria-controls="panelId"
        :data-cy="toggleDataCy"
        @click="toggle"
        @keydown="onButtonKeydown"
      >
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-neutral-900">
            {{ title }}
          </span>
          <span
            v-if="summary"
            class="mt-0.5 block truncate text-xs text-neutral-500"
          >
            {{ summary }}
          </span>
        </span>
        <ChevronDownIcon
          class="h-5 w-5 shrink-0 text-neutral-500 transition-transform motion-reduce:transition-none"
          :class="{ 'rotate-180': isOpen }"
          aria-hidden="true"
        />
      </button>
    </component>
    <div
      v-if="unmountContent ? isOpen : true"
      v-show="isOpen"
      :id="panelId"
      :aria-labelledby="buttonId"
      class="border-t border-neutral-200 px-4 py-4"
      :data-cy="panelDataCy"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    summary?: string;
    open?: boolean;
    defaultOpen?: boolean;
    headingLevel?: 2 | 3 | 4;
    toggleDataCy?: string;
    panelDataCy?: string;
    unmountContent?: boolean;
  }>(),
  {
    summary: "",
    open: undefined,
    defaultOpen: false,
    headingLevel: 2,
    toggleDataCy: undefined,
    panelDataCy: undefined,
    unmountContent: false,
  },
);

const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
}>();

const internalOpen = ref(props.defaultOpen);

watch(
  () => props.defaultOpen,
  (value) => {
    if (props.open === undefined) {
      internalOpen.value = value;
    }
  },
);

const isOpen = computed(() =>
  props.open === undefined ? internalOpen.value : props.open,
);
const buttonId = computed(() => `${props.id}-toggle`);
const panelId = computed(() => `${props.id}-panel`);
const headingTag = computed(() => `h${props.headingLevel}`);

const toggle = () => {
  const nextValue = !isOpen.value;

  if (props.open === undefined) {
    internalOpen.value = nextValue;
  }

  emit("update:open", nextValue);
};

const onButtonKeydown = (event: KeyboardEvent) => {
  if (
    event.key !== "Enter" &&
    event.key !== " " &&
    event.key !== "Space" &&
    event.key !== "Spacebar"
  ) {
    return;
  }

  event.preventDefault();
  toggle();
};
</script>
