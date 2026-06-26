<template>
  <span ref="root" class="relative inline-flex" @focusout="onRootFocusout">
    <button
      ref="button"
      type="button"
      class="inline-flex rounded-full text-subtle hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      :aria-label="resolvedLabel"
      aria-haspopup="dialog"
      :aria-expanded="isOpen.toString()"
      :aria-controls="panelId"
      @click="toggle"
    >
      <QuestionMarkCircleIcon class="h-5 w-5 fill-surface" aria-hidden="true" />
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
        :aria-label="resolvedLabel"
        class="absolute z-50 w-72 rounded-lg border border-default bg-surface px-4 py-3 text-sm text-foreground shadow-lg"
        :class="positionClass"
      >
        <slot>
          <p>{{ t("actions.officialInformation") }}</p>
        </slot>
        <a
          v-if="link"
          class="mt-3 inline-flex text-sm font-medium text-primary underline underline-offset-2 hover:text-foreground"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t("actions.officialInformation") }}
        </a>
      </div>
    </transition>
  </span>
</template>

<script lang="ts" setup>
import { QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBreakpoint } from "@/composables/breakpoints";

const props = withDefaults(
  defineProps<{
    link?: string;
    label?: string;
  }>(),
  {
    link: undefined,
    label: undefined,
  },
);

const emit = defineEmits<{
  (event: "onClick"): void;
}>();

const { breakpoint } = useBreakpoint();
const { t } = useI18n({ useScope: "global" });
const resolvedLabel = computed(
  () => props.label ?? t("accessibility.moreInformation"),
);
const root = ref<HTMLElement | null>(null);
const button = ref<HTMLButtonElement | null>(null);
const isOpen = ref(false);
const panelId = `info-${Math.random().toString(36).slice(2)}`;
const INFO_BUTTON_OPEN_EVENT = "info-button-open";

const open = () => {
  window.dispatchEvent(
    new CustomEvent(INFO_BUTTON_OPEN_EVENT, { detail: panelId }),
  );
  isOpen.value = true;
};

const close = (options: { restoreFocus?: boolean } = {}) => {
  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;

  if (options.restoreFocus) {
    window.requestAnimationFrame(() => button.value?.focus());
  }
};

const toggle = () => {
  if (isOpen.value) {
    close();
  } else {
    open();
  }
  emit("onClick");
};

const onDocumentClick = (event: MouseEvent) => {
  if (!root.value?.contains(event.target as Node)) {
    close();
  }
};

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    event.preventDefault();
    close({ restoreFocus: true });
  }
};

const onRootFocusout = () => {
  window.setTimeout(() => {
    const activeElement = document.activeElement;

    if (activeElement && root.value?.contains(activeElement)) {
      return;
    }

    close();
  }, 0);
};

const onAnotherInfoButtonOpen = (event: Event) => {
  const detail = (event as CustomEvent<string>).detail;

  if (detail !== panelId) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener(INFO_BUTTON_OPEN_EVENT, onAnotherInfoButtonOpen);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener(INFO_BUTTON_OPEN_EVENT, onAnotherInfoButtonOpen);
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
