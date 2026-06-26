<template>
  <DisclosurePanel
    id="advanced-tax-settings"
    :title="t('advancedSettings.title')"
    :summary="advancedSummary"
    toggle-data-cy="advanced-tax-settings-toggle"
    panel-data-cy="advanced-tax-settings-panel"
  >
    <template #summary>
      <span
        v-if="advancedSummaryItems.length === 0"
        class="mt-1 block text-xs text-subtle"
        data-cy="advanced-tax-settings-summary-default"
      >
        {{ t("advancedSettings.noCustomSettings") }}
      </span>
      <span
        v-else
        class="mt-2 flex flex-wrap gap-1.5"
        data-cy="advanced-tax-settings-summary"
      >
        <span
          v-for="item in advancedSummaryItems"
          :key="item.dataCy"
          class="rounded border border-default bg-surface-muted px-2 py-0.5 text-xs font-medium text-foreground"
          :data-cy="item.dataCy"
        >
          {{ item.label }}
        </span>
      </span>
    </template>

    <div class="space-y-6">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label
              for="ss-discount-input"
              class="text-sm font-medium text-foreground"
            >
              {{ t("advancedSettings.socialSecurityBaseAdjustment.label") }}
            </label>
            <InfoButton
              :label="
                t('advancedSettings.socialSecurityBaseAdjustment.infoLabel')
              "
              link="https://www.seg-social.pt/documents/10152/15974914/1009%20Trabalhador%20independente%20-%20novo%20regime/87b6e00c-523d-4718-8a88-942ea804c18a"
            >
              <p>
                {{
                  t("advancedSettings.socialSecurityBaseAdjustment.infoText")
                }}
              </p>
            </InfoButton>
          </div>
          <AdjustCounter
            v-model:value="ssDiscountPosition"
            :min="0"
            :max="ssDiscountChoices.length - 1"
            input-id="ss-discount-input"
            :input-label="
              t('advancedSettings.socialSecurityBaseAdjustment.label')
            "
            :decrease-label="
              t('advancedSettings.socialSecurityBaseAdjustment.decrease')
            "
            :increase-label="
              t('advancedSettings.socialSecurityBaseAdjustment.increase')
            "
            data-cy="ss-discount"
          >
            {{ ssDiscountDisplay }}
          </AdjustCounter>
        </div>
        <p
          v-if="ssAdjustmentStatusMessage"
          class="rounded-md border border-warning-soft bg-warning-soft px-3 py-2 text-xs text-warning"
          role="status"
          aria-live="polite"
          data-cy="ss-adjustment-summary"
        >
          {{ ssAdjustmentStatusMessage }}
        </p>
        <button
          type="button"
          class="text-sm font-medium text-primary underline underline-offset-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          data-cy="view-social-security-calculation"
          @click="$emit('viewSocialSecurityCalculation')"
        >
          {{ t("actions.viewSocialSecurityCalculation") }}
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <SwitchButton
              id="youthIrsSwitchButton"
              :label="t('advancedSettings.youthIrs.label')"
              :model-value="store.benefitsOfYouthIrs"
              data-cy="youth-irs"
              @update:model-value="store.setBenefitsOfYouthIrs"
            />
            <InfoButton
              :label="t('advancedSettings.youthIrs.infoLabel')"
              link="https://www.deco.proteste.pt/dinheiro/impostos/dicas/irs-jovem-como-funciona"
            >
              <p>
                {{ t("advancedSettings.youthIrs.infoText") }}
              </p>
            </InfoButton>
          </div>
          <div
            v-if="store.benefitsOfYouthIrs"
            class="grid grid-cols-[2.5rem_4rem] items-center gap-2"
          >
            <label
              for="youth-irs-years-dropdown"
              class="text-sm text-foreground"
            >
              {{ t("advancedSettings.youthIrs.year") }}
            </label>
            <DropDown
              id="youth-irs-years-dropdown"
              :choices="youthIrsYears"
              :value="store.yearOfYouthIrs.toString()"
              data-cy="youth-irs-years-dropdown"
              @change="changeYouthIrsYear"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <SwitchButton
            id="ssExemptSwitchButton"
            :label="t('advancedSettings.socialSecurityExemption.label')"
            :model-value="store.ssFirstYear"
            data-cy="ss-first-year"
            @update:model-value="store.setSsFirstYear"
          />
          <InfoButton
            :label="t('advancedSettings.socialSecurityExemption.infoLabel')"
            link="https://www.montepio.org/ei/pessoal/emprego-e-formacao/seguranca-social-guia-com-as-regras-para-os-trabalhadores-independentes#"
          >
            <p>
              {{ t("advancedSettings.socialSecurityExemption.infoText") }}
            </p>
          </InfoButton>
        </div>

        <fieldset>
          <legend class="text-sm font-medium text-foreground">
            {{ t("advancedSettings.activityYear.label") }}
          </legend>
          <div
            class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
          >
            <label
              v-for="option in activityYearOptions"
              :key="option.value"
              class="cursor-pointer rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-focus"
              :class="
                activityYearSelection === option.value
                  ? 'border-primary bg-primary-soft font-semibold text-foreground'
                  : 'border-default text-foreground hover:border-strong'
              "
              :data-cy="option.dataCy"
            >
              <input
                type="radio"
                name="activity-year-reduction"
                class="sr-only"
                :value="option.value"
                :checked="activityYearSelection === option.value"
                @change="setActivityYear(option.value)"
              />
              {{ option.label }}
            </label>
          </div>
        </fieldset>

        <div class="flex items-center gap-2">
          <SwitchButton
            id="nrmElegibleSwitchButton"
            :label="t('advancedSettings.rnh.label')"
            :model-value="store.rnh"
            data-cy="rnh"
            @update:model-value="store.setRnh"
          />
          <InfoButton
            :label="t('advancedSettings.rnh.infoLabel')"
            link="https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/Non_habitual_residents_Tax_regime.pdf"
          >
            <p>
              {{
                t("advancedSettings.rnh.infoText", {
                  rate: renderPercentage(rnhTax),
                })
              }}
            </p>
          </InfoButton>
        </div>
      </div>

      <div v-if="expensesNeeded > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-medium text-foreground">
            {{ t("advancedSettings.professionalExpenses.title") }}
          </h3>
          <InfoButton
            :label="t('advancedSettings.professionalExpenses.infoLabel')"
            link="https://www.cgd.pt/Site/Saldo-Positivo/leis-e-impostos/Pages/deducoes-especificas.aspx#:~:text=Empresariais%20e%20Profissionais%20(Categoria%20B)&text=Se%20estiver%20enquadrado%20no%20regime,bruto%20(antes%20dos%20descontos)."
          >
            <p>
              {{ t("advancedSettings.professionalExpenses.infoText") }}
            </p>
          </InfoButton>
        </div>
        <p class="text-xs text-subtle">
          {{ t("advancedSettings.professionalExpenses.maximumRequired") }}
          <span class="font-semibold tabular-nums">
            {{ formatCurrency(expensesNeeded) }}{{ t("units.perYear") }}
          </span>
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <AdjustCounter
            :value="store.expenses"
            :min="0"
            :max="grossIncome.year"
            :step="100"
            :width="14"
            unit="EUR"
            input-id="professional-expenses-input"
            :input-label="t('advancedSettings.professionalExpenses.title')"
            :decrease-label="
              t('advancedSettings.professionalExpenses.decrease')
            "
            :increase-label="
              t('advancedSettings.professionalExpenses.increase')
            "
            data-cy="expenses"
            @update:value="store.setExpensesManual"
          />
          <button
            id="setExpensesAutoButton"
            type="button"
            class="inline-flex items-center gap-1 text-xs font-medium text-subtle transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            :class="store.expensesAuto ? 'invisible' : 'visible'"
            @click="store.setExpensesAuto()"
          >
            {{ t("actions.auto") }}
            <ArrowPathIcon class="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </DisclosurePanel>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { useTaxesStore } from "@/store";
import { useLocalizedFormatters } from "@/composables/useLocalizedFormatters";
import AdjustCounter from "@/components/AdjustCounter.vue";
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import DropDown from "@/components/DropDown.vue";
import InfoButton from "@/components/InfoButton.vue";
import SwitchButton from "@/components/SwitchButton.vue";

defineEmits<{
  (event: "viewSocialSecurityCalculation"): void;
}>();

type ActivityYearSelection = "none" | "first" | "second";
type AdvancedSummaryItem = {
  label: string;
  dataCy: string;
};

const store = useTaxesStore();
const { expensesNeeded, grossIncome, rnhTax } = storeToRefs(store);
const { t } = useI18n({ useScope: "global" });
const { formatCurrency, formatPercentage } = useLocalizedFormatters();

const formatSignedPercentage = (value: number) => {
  return formatPercentage(value, 0, { signDisplay: "exceptZero" });
};

const renderPercentage = (value: number) => {
  return formatPercentage(value);
};

const ssDiscountChoices = computed(() => store.ssDiscountChoices);
const ssDiscountPosition = computed({
  get() {
    return Math.max(store.ssDiscountChoices.indexOf(store.ssDiscount), 0);
  },
  set(newPosition: number) {
    const selectedDiscount = store.ssDiscountChoices[newPosition];

    if (selectedDiscount !== undefined) {
      store.setSsDiscount(selectedDiscount);
    }
  },
});

const ssDiscountDisplay = computed(() =>
  formatSignedPercentage(store.ssDiscount),
);

const ssAdjustmentStatusMessage = computed(() => {
  if (store.ssFirstYear) {
    return t("socialSecurityStatus.exemptionActive");
  }

  if (store.ssIsAtMinimumContribution) {
    return t("socialSecurityStatus.minimumApplied");
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return t("socialSecurityStatus.cappedWithBase", {
        base: formatCurrency(store.ssContributionBase, 2),
      });
    }

    return t("socialSecurityStatus.cappedWithFirstChangingAdjustment", {
      base: formatCurrency(store.ssContributionBase, 2),
      percentage: formatSignedPercentage(firstDiscountBelowCap),
    });
  }

  return "";
});

const youthIrsYears = computed(() => {
  const validRange = store.youthIrsRange;
  return Array.from({ length: validRange }, (_, index) => index + 1);
});

const changeYouthIrsYear = (year: number) => {
  store.setYearOfYouthIrs(year);
};

const activityYearOptions = computed<
  {
    value: ActivityYearSelection;
    label: string;
    dataCy: string;
  }[]
>(() => [
  {
    value: "none",
    label: t("advancedSettings.activityYear.none"),
    dataCy: "activity-year-none",
  },
  {
    value: "first",
    label: t("advancedSettings.activityYear.first"),
    dataCy: "first-year",
  },
  {
    value: "second",
    label: t("advancedSettings.activityYear.second"),
    dataCy: "second-year",
  },
]);

const activityYearSelection = computed<ActivityYearSelection>(() => {
  if (store.firstYear) {
    return "first";
  }

  if (store.secondYear) {
    return "second";
  }

  return "none";
});

const setActivityYear = (value: ActivityYearSelection) => {
  if (value === "first") {
    store.setFirstYear(true);
    return;
  }

  if (value === "second") {
    store.setSecondYear(true);
    return;
  }

  if (store.firstYear) {
    store.setFirstYear(false);
  }

  if (store.secondYear) {
    store.setSecondYear(false);
  }
};

const advancedSummaryItems = computed<AdvancedSummaryItem[]>(() => {
  const activeSettings: AdvancedSummaryItem[] = [];

  if (store.ssDiscount !== 0) {
    activeSettings.push({
      label: t("advancedSettings.summary.ssBase", {
        percentage: formatSignedPercentage(store.ssDiscount),
      }),
      dataCy: "advanced-tax-summary-ss-discount",
    });
  }

  if (store.benefitsOfYouthIrs) {
    activeSettings.push({
      label: t("advancedSettings.youthIrs.summary", {
        year: store.yearOfYouthIrs,
      }),
      dataCy: "advanced-tax-summary-youth-irs",
    });
  }

  if (store.ssFirstYear) {
    activeSettings.push({
      label: t("advancedSettings.socialSecurityExemption.label"),
      dataCy: "advanced-tax-summary-ss-first-year",
    });
  }

  if (store.firstYear) {
    activeSettings.push({
      label: t("advancedSettings.activityYear.first"),
      dataCy: "advanced-tax-summary-first-year",
    });
  } else if (store.secondYear) {
    activeSettings.push({
      label: t("advancedSettings.activityYear.second"),
      dataCy: "advanced-tax-summary-second-year",
    });
  }

  if (store.rnh) {
    activeSettings.push({
      label: t("advancedSettings.rnh.label"),
      dataCy: "advanced-tax-summary-rnh",
    });
  }

  if (!store.expensesAuto) {
    activeSettings.push({
      label: t("advancedSettings.professionalExpenses.manualSummary"),
      dataCy: "advanced-tax-summary-manual-expenses",
    });
  }

  return activeSettings;
});

const advancedSummary = computed(() => {
  return advancedSummaryItems.value.length > 0
    ? advancedSummaryItems.value.map((item) => item.label).join(" · ")
    : t("advancedSettings.noCustomSettings");
});
</script>
