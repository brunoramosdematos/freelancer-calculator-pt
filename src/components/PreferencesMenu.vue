<template>
  <div ref="rootRef" class="relative" data-print-hidden="true">
    <button
      ref="triggerRef"
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-default bg-surface text-muted shadow-sm transition hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
      data-cy="preferences-toggle"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-label="t(isOpen ? 'preferences.close' : 'preferences.open')"
      @click="toggle"
    >
      <AdjustmentsHorizontalIcon class="h-5 w-5" aria-hidden />
    </button>

    <div
      v-if="isOpen"
      :id="panelId"
      ref="panelRef"
      role="dialog"
      :aria-labelledby="titleId"
      class="absolute right-0 top-12 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-lg border border-default bg-surface-elevated p-4 text-foreground shadow-theme"
      data-cy="preferences-panel"
      @click.stop
      @keydown.esc.prevent.stop="closeAndFocus"
    >
      <h2 :id="titleId" class="text-base font-semibold">
        {{ t("preferences.title") }}
      </h2>

      <div class="mt-4 space-y-5">
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-foreground">
            {{ t("preferences.language") }}
          </label>
          <LocaleSwitcher />
        </div>

        <ThemeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { AdjustmentsHorizontalIcon } from "@heroicons/vue/24/outline";

import LocaleSwitcher from "@/components/LocaleSwitcher.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

const panelId = "preferences-panel";
const titleId = "preferences-title";
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const route = useRoute();
const { t } = useI18n({ useScope: "global" });

const close = () => {
  isOpen.value = false;
};

const closeAndFocus = () => {
  close();
  nextTick(() => triggerRef.value?.focus());
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const handlePointerDown = (event: PointerEvent) => {
  if (!isOpen.value) {
    return;
  }

  const target = event.target as Node | null;
  if (target && rootRef.value?.contains(target)) {
    return;
  }

  close();
};

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
});

watch(
  () => route.fullPath,
  () => close(),
);
</script>
