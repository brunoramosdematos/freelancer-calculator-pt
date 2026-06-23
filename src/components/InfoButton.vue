<template>
  <span ref="root" class="relative inline-flex">
    <button
      type="button"
      class="inline-flex rounded-full text-neutral-500 hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      :aria-label="label"
      :aria-expanded="isOpen.toString()"
      :aria-controls="panelId"
      @click="toggle"
      @focus="openFromFocus"
    >
      <QuestionMarkCircleIcon
        class="h-5 w-5 fill-neutral-100"
        aria-hidden="true"
      />
    </button>
    <transition
      enter-active-class="duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-100 ease-in motion-reduce:transition-none"
      leave-from-class="opacity-100"
      leave-to-class="transform opacity-0"
    >
      <div
        v-if="isOpen"
        :id="panelId"
        role="dialog"
        class="absolute z-50 w-72 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-lg"
        :class="positionClass"
      >
        <slot>
          <p>More information about this field.</p>
        </slot>
        <a
          v-if="link"
          class="mt-3 inline-flex text-sm font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official information
        </a>
      </div>
    </transition>
  </span>
</template>

<script lang="ts" setup>
import { QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useBreakpoint } from "@/composables/breakpoints";

const props = withDefaults(
  defineProps<{
    link?: string;
    label?: string;
  }>(),
  {
    link: undefined,
    label: "More information",
  },
);

const emit = defineEmits<{
  (event: "onClick"): void;
}>();

const { breakpoint } = useBreakpoint();
const root = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const openedByFocus = ref(false);
const panelId = `info-${Math.random().toString(36).slice(2)}`;

const open = () => {
  isOpen.value = true;
};

const openFromFocus = () => {
  if (!isOpen.value) {
    openedByFocus.value = true;
    open();
    window.setTimeout(() => {
      openedByFocus.value = false;
    }, 0);
  }
};

const close = () => {
  isOpen.value = false;
};

const toggle = () => {
  if (openedByFocus.value) {
    openedByFocus.value = false;
    emit("onClick");
    return;
  }

  isOpen.value = !isOpen.value;
  emit("onClick");
};

const onDocumentClick = (event: MouseEvent) => {
  if (!root.value?.contains(event.target as Node)) {
    close();
  }
};

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
});

const positionClass = computed(() => {
  if (breakpoint.lgAndUp) {
    return "top-8 left-0";
  }

  if (breakpoint.smAndUp) {
    return "top-8 left-1/2 -translate-x-1/2";
  }

  return "top-8 right-0";
});
</script>
