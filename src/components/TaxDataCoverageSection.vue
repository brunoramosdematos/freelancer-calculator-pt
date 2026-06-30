<template>
  <section class="space-y-4" data-cy="tax-data-coverage">
    <div>
      <h2 class="text-xl font-semibold text-foreground">
        {{ t("taxData.about.title") }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-muted">
        {{ t("taxData.about.description") }}
      </p>
    </div>

    <dl class="grid gap-3 text-sm sm:grid-cols-3">
      <div class="rounded-md border border-default bg-surface-muted/70 p-3">
        <dt class="font-semibold text-muted">
          {{ t("taxData.about.supportedYears") }}
        </dt>
        <dd class="mt-1 text-foreground">{{ supportedYears }}</dd>
      </div>
      <div class="rounded-md border border-default bg-surface-muted/70 p-3">
        <dt class="font-semibold text-muted">
          {{ t("taxData.about.latestSupportedYear") }}
        </dt>
        <dd class="mt-1 text-foreground">
          {{ coverage.latestSupportedTaxYear }}
        </dd>
      </div>
      <div class="rounded-md border border-default bg-surface-muted/70 p-3">
        <dt class="font-semibold text-muted">
          {{ t("taxData.about.lastReviewed") }}
        </dt>
        <dd class="mt-1 text-foreground">{{ reviewedAt }}</dd>
      </div>
    </dl>

    <p class="text-sm leading-6 text-muted">
      {{ t("taxData.about.limitations") }}
    </p>

    <div>
      <h3 class="text-sm font-semibold text-foreground">
        {{ t("taxData.about.sources") }}
      </h3>
      <ul class="mt-2 space-y-2 text-sm" data-cy="tax-data-coverage-sources">
        <li v-for="source in coverage.sources" :key="source.id">
          <a
            class="underline underline-offset-4 hover:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
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
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  formatLastReviewedDateInput,
  taxDataCoverage,
} from "@/taxData/provenance";

const { t } = useI18n({ useScope: "global" });
const coverage = taxDataCoverage;
const supportedYears = computed(() => coverage.supportedTaxYears.join(", "));
const reviewedAt = computed(() =>
  formatLastReviewedDateInput(coverage.lastReviewedAt),
);
</script>
