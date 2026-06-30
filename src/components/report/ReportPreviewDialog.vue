<template>
  <div
    ref="dialogRef"
    class="report-preview-dialog fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay/60 p-3 text-foreground sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="report-preview-dialog-title"
    tabindex="-1"
    data-cy="report-preview-dialog"
    @keydown="handleKeydown"
  >
    <div
      class="report-preview-dialog__shell flex max-h-full w-full max-w-5xl flex-col rounded-lg bg-surface-elevated shadow-theme"
    >
      <header
        class="flex items-start justify-between gap-4 border-b border-default p-4"
        data-print-hidden="true"
      >
        <div>
          <h2
            id="report-preview-dialog-title"
            class="text-xl font-semibold text-foreground"
          >
            {{ t("report.previewTitle") }}
          </h2>
          <p class="mt-1 text-sm text-muted">
            {{ t("report.previewDescription") }}
          </p>
        </div>
        <button
          ref="closeButtonRef"
          type="button"
          class="rounded-lg p-1.5 text-subtle hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          data-cy="report-header-close-button"
          data-print-hidden="true"
          :aria-label="t('report.actions.close')"
          @click="$emit('close')"
        >
          <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          <span class="sr-only">{{ t("report.actions.close") }}</span>
        </button>
      </header>

      <div
        class="report-preview-dialog__content min-h-0 flex-1 overflow-y-auto bg-surface-muted p-3 sm:p-5"
        data-cy="report-dialog-scroll"
        tabindex="0"
        :aria-label="t('report.previewTitle')"
      >
        <PrintableReport v-if="report" :report="report" />
        <p
          v-else
          class="rounded-md border border-default bg-surface p-4 text-sm text-muted"
          role="status"
        >
          {{ t("report.noIncome") }}
        </p>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 border-t border-default p-4 sm:flex-row sm:justify-end"
        data-print-hidden="true"
      >
        <p
          v-if="printStatusMessage"
          class="self-center text-sm text-warning"
          role="status"
          aria-live="polite"
          data-cy="report-print-status"
        >
          {{ printStatusMessage }}
        </p>
        <button
          type="button"
          class="rounded-lg border border-default px-4 py-2 text-sm font-medium text-foreground hover:border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          data-cy="report-close-button"
          data-print-hidden="true"
          @click="$emit('close')"
        >
          {{ t("report.actions.close") }}
        </button>
        <button
          ref="printButtonRef"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-surface hover:bg-foreground/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          data-cy="report-print-button"
          data-print-hidden="true"
          :disabled="!report"
          :aria-label="t('report.actions.print')"
          @click="printReport"
        >
          <PrinterIcon class="h-4 w-4" aria-hidden="true" />
          {{ t("report.actions.print") }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PrinterIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import PrintableReport from "@/components/report/PrintableReport.vue";
import { createReportData } from "@/report/reportData";
import { useTaxesStore } from "@/store";

const props = defineProps<{
  currentUrl?: string | null;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const { t } = useI18n({ useScope: "global" });
const store = useTaxesStore();
const generatedAt = ref(new Date());
const printStatusMessage = ref("");
const dialogRef = ref<HTMLElement | null>(null);
const printButtonRef = ref<HTMLButtonElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);

const report = computed(() =>
  createReportData(store, {
    currentUrl: props.currentUrl,
    generatedAt: generatedAt.value,
  }),
);

const getFocusableElements = () => {
  if (!dialogRef.value) {
    return [];
  }

  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    ),
  ).filter((element) => element.offsetParent !== null);
};

const trapFocus = (event: KeyboardEvent) => {
  const focusableElements = getFocusableElements();

  if (focusableElements.length === 0) {
    event.preventDefault();
    dialogRef.value?.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    emit("close");
    return;
  }

  if (event.key === "Tab") {
    trapFocus(event);
  }
};

const printReport = () => {
  if (!report.value) {
    return;
  }

  if (typeof window.print !== "function") {
    printStatusMessage.value = t("report.printUnavailable");
    return;
  }

  printStatusMessage.value = "";
  window.print();
};

onMounted(async () => {
  await nextTick();
  (printButtonRef.value ?? closeButtonRef.value ?? dialogRef.value)?.focus();
});
</script>
