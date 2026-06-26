<template>
  <div
    v-click-outside="close"
    class="absolute left-1/2 transform -translate-x-1/2 top-3 z-50"
  >
    <div
      class="flex items-center w-full max-w-xs p-4 bg-surface-elevated rounded-lg shadow-lg"
    >
      <div class="ms-3 text-sm font-normal">{{ text }}</div>
      <button
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 text-subtle hover:text-muted rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="#toast-default"
        :aria-label="t('actions.close')"
        @click="close()"
      >
        <span class="sr-only">{{ t("actions.close") }}</span>
        <XMarkIcon />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
// store
const emits = defineEmits(["close"]);
const { t } = useI18n({ useScope: "global" });
defineProps({
  text: {
    type: String,
    required: true,
  },
});

setTimeout(() => close(), 3000);
const close = () => emits("close");
</script>
