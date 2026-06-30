<template>
  <details
    class="rounded-md border border-default bg-surface-muted/70 px-3 py-2 text-xs text-foreground"
    data-cy="tax-data-status"
  >
    <summary
      class="flex cursor-pointer list-none flex-wrap items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      data-cy="tax-data-status-details-toggle"
      :aria-label="t('taxData.status.detailsLabel', { year: selectedTaxYear })"
    >
      <span class="font-semibold">{{ t("taxData.status.title") }}:</span>
      <span
        class="inline-flex items-center rounded-full border px-2 py-0.5 font-semibold"
        :class="statusBadgeClass"
        data-cy="tax-data-status-summary"
      >
        {{
          t("taxData.status.summary", {
            status: t(selectedStatus.messageKey),
            date: reviewedAt,
          })
        }}
      </span>
      <span class="text-subtle underline underline-offset-2">
        {{ t("taxData.status.viewSources") }}
      </span>
    </summary>

    <div
      class="mt-3 space-y-3 border-t border-default pt-3"
      data-cy="tax-data-status-details"
    >
      <p
        v-if="coverageStatus.kind === 'review-required'"
        class="rounded-md border border-warning-soft bg-warning-soft px-3 py-2 text-warning"
        data-cy="tax-data-review-required"
      >
        {{
          t(coverageStatus.messageKey, {
            year: coverage.latestSupportedTaxYear,
          })
        }}
      </p>

      <dl class="grid gap-2 sm:grid-cols-2">
        <div>
          <dt class="font-semibold text-muted">
            {{ t("taxData.status.selectedYear") }}
          </dt>
          <dd>{{ selectedTaxYear }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-muted">
            {{ t("taxData.status.latestYear") }}
          </dt>
          <dd>{{ coverage.latestSupportedTaxYear }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-muted">
            {{ t("taxData.status.supportedYears") }}
          </dt>
          <dd>{{ supportedYears }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-muted">
            {{ t("taxData.status.lastReviewed") }}
          </dt>
          <dd>{{ reviewedAt }}</dd>
        </div>
      </dl>

      <p class="leading-5 text-subtle">
        {{ t("taxData.status.supportMeaning") }}
      </p>

      <div>
        <p class="font-semibold text-muted">
          {{ t("taxData.status.sourceReferences") }}
        </p>
        <ul class="mt-2 space-y-1" data-cy="tax-data-source-links">
          <li v-for="source in coverage.sources" :key="source.id">
            <a
              class="underline underline-offset-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t(source.labelKey) }}
            </a>
            <span class="text-subtle"> - {{ t(source.publisherKey) }} </span>
          </li>
        </ul>
      </div>

      <p class="leading-5 text-subtle">
        {{ t("taxData.status.estimateDisclaimer") }}
      </p>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  formatLastReviewedDateInput,
  getFiscalCoverageStatus,
  getSelectedTaxYearStatus,
  taxDataCoverage,
} from "@/taxData/provenance";

const props = defineProps<{
  selectedTaxYear: number;
}>();

const { t } = useI18n({ useScope: "global" });
const coverage = taxDataCoverage;
const coverageStatus = computed(() =>
  getFiscalCoverageStatus(new Date(), coverage),
);
const selectedStatus = computed(() =>
  getSelectedTaxYearStatus(props.selectedTaxYear, coverage),
);
const reviewedAt = computed(() =>
  formatLastReviewedDateInput(coverage.lastReviewedAt),
);
const supportedYears = computed(() => coverage.supportedTaxYears.join(", "));
const statusBadgeClass = computed(() => {
  if (coverageStatus.value.kind === "review-required") {
    return "border-warning-soft bg-warning-soft text-warning";
  }

  switch (selectedStatus.value.severity) {
    case "danger":
      return "border-danger/30 bg-danger/10 text-danger";
    case "info":
      return "border-primary/30 bg-primary-soft text-foreground";
    case "neutral":
    default:
      return "border-income/30 bg-income-soft text-foreground";
  }
});
</script>
