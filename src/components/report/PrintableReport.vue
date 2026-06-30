<template>
  <article
    class="printable-report mx-auto max-w-4xl rounded-lg bg-surface p-5 text-left text-foreground shadow-sm sm:p-6"
    data-cy="printable-report"
    aria-labelledby="printable-report-title"
  >
    <header class="border-b border-default pb-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted">
        {{ report.productName }}
      </p>
      <h2
        id="printable-report-title"
        class="mt-2 text-2xl font-semibold text-foreground"
        data-cy="report-title"
      >
        {{ t(report.titleKey) }}
      </h2>
      <dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt class="font-medium text-muted">{{ t("report.generatedAt") }}</dt>
          <dd class="tabular-nums" data-cy="report-generated-at">
            {{ formatDateTime(report.generatedAt) }}
          </dd>
        </div>
        <div>
          <dt class="font-medium text-muted">
            {{ t("report.productionUrl") }}
          </dt>
          <dd class="break-all">{{ report.productionUrl }}</dd>
        </div>
      </dl>
    </header>

    <section class="print-avoid-break mt-5" aria-labelledby="report-summary">
      <h3 id="report-summary" class="text-lg font-semibold text-foreground">
        {{ t("report.summary") }}
      </h3>
      <ReportTable :caption="t('report.summary')" :rows="summaryRows" />
    </section>

    <section
      class="print-avoid-break mt-5"
      aria-labelledby="report-assumptions"
    >
      <h3 id="report-assumptions" class="text-lg font-semibold text-foreground">
        {{ t("report.assumptions") }}
      </h3>
      <ReportTable :caption="t('report.assumptions')" :rows="assumptionRows" />
    </section>

    <section
      class="print-avoid-break mt-5"
      aria-labelledby="report-tax-breakdown"
    >
      <h3
        id="report-tax-breakdown"
        class="text-lg font-semibold text-foreground"
      >
        {{ t("report.taxBreakdown") }}
      </h3>
      <ReportTable
        :caption="t('report.taxBreakdown')"
        :rows="taxBreakdownRows"
      />
    </section>

    <section
      class="print-avoid-break mt-5"
      aria-labelledby="report-fiscal-data"
    >
      <h3 id="report-fiscal-data" class="text-lg font-semibold text-foreground">
        {{ t("report.fiscalData") }}
      </h3>
      <ReportTable :caption="t('report.fiscalData')" :rows="fiscalDataRows" />
      <div class="mt-3">
        <p class="text-sm font-medium text-muted">
          {{ t("taxData.status.sourceReferences") }}
        </p>
        <ul class="mt-1 list-disc space-y-1 pl-5 text-sm">
          <li
            v-for="sourceLabelKey in report.fiscalData.sourceLabelKeys"
            :key="sourceLabelKey"
          >
            {{ t(sourceLabelKey) }}
          </li>
        </ul>
      </div>
      <p class="mt-3 text-sm leading-6 text-muted">
        {{ t(report.fiscalData.estimateDisclaimerKey) }}
      </p>
    </section>

    <section
      v-if="report.currentUrl"
      class="print-avoid-break mt-5"
      aria-labelledby="report-current-url"
    >
      <h3 id="report-current-url" class="text-lg font-semibold text-foreground">
        {{ t("report.currentUrl") }}
      </h3>
      <p
        class="mt-2 break-all rounded-md border border-default bg-surface-muted p-3 text-sm"
        data-cy="report-current-url"
      >
        {{ report.currentUrl }}
      </p>
    </section>

    <section
      class="mt-5 border-t border-default pt-4"
      aria-labelledby="report-disclaimer"
    >
      <h3 id="report-disclaimer" class="text-lg font-semibold text-foreground">
        {{ t("report.disclaimer") }}
      </h3>
      <p class="mt-2 text-sm leading-6 text-muted" data-cy="report-disclaimer">
        {{ t("report.disclaimerText") }}
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import type { ReportData } from "@/report/reportData";
import { AssessmentScenario } from "@/typings";

type ReportRow = {
  label: string;
  value: string;
  dataCy?: string;
  valueClass?: string;
};

const props = defineProps<{
  report: ReportData;
}>();

const { t } = useI18n({ useScope: "global" });
const { formatCurrency, formatDateTime, formatPercentage } =
  useLocalizedFormatters();

const ReportTable = defineComponent({
  name: "ReportTable",
  props: {
    caption: {
      type: String,
      required: true,
    },
    rows: {
      type: Array as PropType<ReportRow[]>,
      required: true,
    },
  },
  setup(tableProps) {
    return () =>
      h("table", { class: "mt-3 w-full table-fixed text-sm" }, [
        h("caption", { class: "sr-only" }, tableProps.caption),
        h(
          "thead",
          {
            class:
              "border-b border-default text-left text-xs uppercase text-muted",
          },
          [
            h("tr", [
              h(
                "th",
                { scope: "col", class: "w-1/2 py-2 pr-3 font-semibold" },
                t("report.table.item"),
              ),
              h(
                "th",
                { scope: "col", class: "py-2 text-right font-semibold" },
                t("report.table.value"),
              ),
            ]),
          ],
        ),
        h(
          "tbody",
          { class: "divide-y divide-default" },
          tableProps.rows.map((row) =>
            h("tr", { "data-cy": row.dataCy }, [
              h(
                "th",
                { scope: "row", class: "py-2 pr-3 font-medium text-muted" },
                row.label,
              ),
              h(
                "td",
                {
                  class: [
                    "break-words py-2 text-right tabular-nums text-foreground",
                    row.valueClass,
                  ],
                },
                row.value,
              ),
            ]),
          ),
        ),
      ]);
  },
});

const money = (value: number) => formatCurrency(value, 2);
const integer = (value: number) => String(value);
const yesNo = (value: boolean) =>
  value ? t("report.values.yes") : t("report.values.no");
const frequencyLabel = (frequency: string) => t(`frequency.${frequency}`);

const assessmentLabel = computed(() =>
  props.report.assumptions.assessmentScenario ===
  AssessmentScenario.JointSingleIncome
    ? t("assessment.jointSingleIncome.label")
    : t("assessment.individual.label"),
);

const activityYearLabel = computed(() => {
  if (props.report.assumptions.firstFiscalYear) {
    return t("advancedSettings.activityYear.first");
  }

  if (props.report.assumptions.secondFiscalYear) {
    return t("advancedSettings.activityYear.second");
  }

  return t("advancedSettings.activityYear.none");
});

const youthIrsLabel = computed(() => {
  if (!props.report.assumptions.youthIrs.active) {
    return t("report.values.notActive");
  }

  return t("advancedSettings.youthIrs.summary", {
    year: props.report.assumptions.youthIrs.year,
  });
});

const expenseModeLabel = computed(() =>
  props.report.assumptions.expenses.mode === "manual"
    ? t("deductions.manual")
    : t("deductions.automatic"),
);

const dependentAgeGroupsLabel = computed(() =>
  t("report.values.dependentAgeGroups", {
    aged3OrUnder: props.report.assumptions.dependents.aged3OrUnder,
    aged4To6: props.report.assumptions.dependents.aged4To6,
    aged7OrOver: props.report.assumptions.dependents.aged7OrOver,
  }),
);

const summaryRows = computed<ReportRow[]>(() => [
  {
    label: t("report.rows.displayFrequency"),
    value: frequencyLabel(props.report.summary.displayFrequency),
  },
  {
    label: t("report.rows.grossIncome"),
    value: money(props.report.summary.grossIncome.year),
    dataCy: "report-gross-income",
  },
  {
    label: t("report.rows.netIncome"),
    value: money(props.report.summary.netIncome.year),
    dataCy: "report-net-income",
    valueClass: "font-semibold",
  },
  {
    label: t("report.rows.totalTaxes"),
    value: money(props.report.summary.totalTaxes.year),
  },
  {
    label: t("report.rows.irs"),
    value: money(props.report.summary.irs.year),
    dataCy: "report-irs",
    valueClass: "font-semibold",
  },
  {
    label: t("report.rows.socialSecurity"),
    value: money(props.report.summary.socialSecurity.year),
    dataCy: "report-social-security",
    valueClass: "font-semibold",
  },
]);

const assumptionRows = computed<ReportRow[]>(() => [
  {
    label: t("report.rows.taxYear"),
    value: integer(props.report.assumptions.taxYear),
    dataCy: "report-tax-year",
  },
  {
    label: t("report.rows.taxAssessment"),
    value: assessmentLabel.value,
    dataCy: "report-tax-assessment",
  },
  {
    label: t("report.rows.incomeFrequency"),
    value: frequencyLabel(props.report.assumptions.incomeFrequency),
  },
  {
    label: t("report.rows.paidMonths"),
    value: integer(props.report.assumptions.paidMonths),
  },
  {
    label: t("report.rows.unpaidDays"),
    value: integer(props.report.assumptions.unpaidDays),
  },
  {
    label: t("report.rows.dependents"),
    value: integer(props.report.assumptions.dependents.total),
  },
  {
    label: t("report.rows.dependentAgeGroups"),
    value: dependentAgeGroupsLabel.value,
    dataCy: "report-dependent-age-groups",
  },
  {
    label: t("report.rows.socialSecurityAdjustment"),
    value: formatPercentage(
      props.report.assumptions.socialSecurityAdjustment,
      0,
      {
        signDisplay: "exceptZero",
      },
    ),
  },
  {
    label: t("report.rows.ssFirstYear"),
    value: yesNo(props.report.assumptions.socialSecurityFirstYearExemption),
  },
  {
    label: t("report.rows.activityYear"),
    value: activityYearLabel.value,
  },
  {
    label: t("report.rows.youthIrs"),
    value: youthIrsLabel.value,
  },
  {
    label: t("report.rows.rnh"),
    value: yesNo(props.report.assumptions.rnh),
  },
  {
    label: t("report.rows.expenses"),
    value: t("report.values.expensesSummary", {
      mode: expenseModeLabel.value,
      amount: money(props.report.assumptions.expenses.amount),
      stillNeeded: money(props.report.assumptions.expenses.stillNeeded),
    }),
  },
]);

const taxBreakdownRows = computed<ReportRow[]>(() => [
  {
    label: t("report.rows.irsBeforeDependentDeduction"),
    value: money(props.report.taxBreakdown.irsBeforeDependentDeduction),
  },
  {
    label: t("report.rows.dependentDeduction"),
    value: money(props.report.taxBreakdown.dependentDeductionApplied),
  },
  {
    label: t("report.rows.finalIrs"),
    value: money(props.report.taxBreakdown.finalIrs),
    dataCy: "report-final-irs",
    valueClass: "font-semibold",
  },
  {
    label: t("report.rows.socialSecurityContribution"),
    value: money(props.report.taxBreakdown.socialSecurityContribution),
    valueClass: "font-semibold",
  },
  {
    label: t("report.rows.netIncome"),
    value: money(props.report.taxBreakdown.netIncome),
    valueClass: "font-semibold",
  },
]);

const fiscalDataRows = computed<ReportRow[]>(() => [
  {
    label: t("report.rows.taxYear"),
    value: integer(props.report.fiscalData.selectedTaxYear),
  },
  {
    label: t("report.rows.latestSupportedYear"),
    value: integer(props.report.fiscalData.latestSupportedTaxYear),
  },
  {
    label: t("report.rows.lastReviewed"),
    value: props.report.fiscalData.lastReviewedAt,
    dataCy: "report-last-reviewed",
  },
  {
    label: t("report.rows.fiscalDataStatus"),
    value: t(props.report.fiscalData.status.messageKey),
    dataCy: "report-fiscal-data-status",
  },
]);
</script>
