<template>
  <div
    class="mx-auto grid w-full max-w-2xl grid-cols-2 gap-2 px-2 sm:inline-flex sm:w-auto sm:max-w-none sm:grid-cols-none sm:flex-nowrap sm:items-center sm:justify-center sm:px-0"
    role="group"
    :aria-label="t('actions.simulationActionsLabel')"
    data-cy="simulation-action-toolbar"
  >
    <button
      type="button"
      data-cy="reset-simulation-button"
      data-cy-toolbar-item="reset"
      class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-default bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-income hover:text-income focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      @click="$emit('reset')"
    >
      <ArrowPathIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="whitespace-nowrap">{{ t("actions.reset") }}</span>
    </button>
    <button
      type="button"
      data-cy="share-simulation-button"
      data-cy-toolbar-item="share"
      class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-default bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-social-security hover:text-social-security focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      @click="$emit('share')"
    >
      <ShareIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="whitespace-nowrap">{{ t("actions.share") }}</span>
    </button>
    <button
      ref="exportButtonRef"
      type="button"
      data-cy="export-report-button"
      data-cy-toolbar-item="export-report"
      class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-primary bg-primary-soft px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      @click="$emit('export-report')"
    >
      <DocumentArrowDownIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="whitespace-nowrap">
        {{ t("report.actions.export") }}
      </span>
    </button>
    <button
      type="button"
      data-cy="save-simulation-button"
      data-cy-toolbar-item="save"
      class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-default bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:border-warning hover:text-warning focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      @click="$emit('save')"
    >
      <BookmarkIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
      <span class="whitespace-nowrap">{{ t("actions.save") }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowPathIcon,
  BookmarkIcon,
  DocumentArrowDownIcon,
  ShareIcon,
} from "@heroicons/vue/24/outline";

defineEmits<{
  (event: "reset"): void;
  (event: "share"): void;
  (event: "export-report"): void;
  (event: "save"): void;
}>();

const { t } = useI18n({ useScope: "global" });
const exportButtonRef = ref<HTMLButtonElement | null>(null);

defineExpose({
  focusExportButton: () => {
    exportButtonRef.value?.focus();
  },
});
</script>
