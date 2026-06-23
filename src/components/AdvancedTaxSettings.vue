<template>
  <DisclosurePanel
    id="advanced-tax-settings"
    title="Advanced tax settings"
    :summary="advancedSummary"
    toggle-data-cy="advanced-tax-settings-toggle"
    panel-data-cy="advanced-tax-settings-panel"
  >
    <div class="space-y-6">
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label
              for="ss-discount-input"
              class="text-sm font-medium text-neutral-700"
            >
              Social Security base adjustment
            </label>
            <InfoButton
              label="Social Security base adjustment information"
              link="https://www.seg-social.pt/documents/10152/15974914/1009%20Trabalhador%20independente%20-%20novo%20regime/87b6e00c-523d-4718-8a88-942ea804c18a"
            >
              <p>
                The selected percentage applies to the 70% relevant-income base
                before the 21.4% rate. Caps, minimums and exemptions can stop a
                visible change in the final contribution.
              </p>
            </InfoButton>
          </div>
          <AdjustCounter
            v-model:value="ssDiscountPosition"
            :min="0"
            :max="ssDiscountChoices.length - 1"
            input-id="ss-discount-input"
            input-label="Social Security base adjustment"
            decrease-label="Decrease Social Security base adjustment"
            increase-label="Increase Social Security base adjustment"
            data-cy="ss-discount"
          >
            {{ ssDiscountDisplay }}
          </AdjustCounter>
        </div>
        <p
          v-if="ssAdjustmentStatusMessage"
          class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          role="status"
          aria-live="polite"
          data-cy="ss-adjustment-summary"
        >
          {{ ssAdjustmentStatusMessage }}
        </p>
        <button
          type="button"
          class="text-sm font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          data-cy="view-social-security-calculation"
          @click="$emit('viewSocialSecurityCalculation')"
        >
          View Social Security calculation
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <SwitchButton
              id="youthIrsSwitchButton"
              label="Youth IRS"
              :model-value="store.benefitsOfYouthIrs"
              data-cy="youth-irs"
              @update:model-value="store.setBenefitsOfYouthIrs"
            />
            <InfoButton
              label="Youth IRS information"
              link="https://www.deco.proteste.pt/dinheiro/impostos/dicas/irs-jovem-como-funciona"
            >
              <p>
                Youth IRS can reduce IRS for eligible taxpayers under the
                applicable yearly rules.
              </p>
            </InfoButton>
          </div>
          <div
            v-if="store.benefitsOfYouthIrs"
            class="grid grid-cols-[2.5rem_4rem] items-center gap-2"
          >
            <label
              for="youth-irs-years-dropdown"
              class="text-sm text-neutral-700"
            >
              Year
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
            label="First 12 months SS exemption"
            :model-value="store.ssFirstYear"
            data-cy="ss-first-year"
            @update:model-value="store.setSsFirstYear"
          />
          <InfoButton
            label="First 12 months Social Security exemption information"
            link="https://www.montepio.org/ei/pessoal/emprego-e-formacao/seguranca-social-guia-com-as-regras-para-os-trabalhadores-independentes#"
          >
            <p>
              The first 12 months as an independent worker may be exempt from
              Social Security contributions.
            </p>
          </InfoButton>
        </div>

        <fieldset>
          <legend class="text-sm font-medium text-neutral-700">
            Activity-year reduction
          </legend>
          <div
            class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
          >
            <label
              v-for="option in activityYearOptions"
              :key="option.value"
              class="cursor-pointer rounded-lg border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-primary"
              :class="
                activityYearSelection === option.value
                  ? 'border-primary bg-sky-50 font-semibold text-neutral-900'
                  : 'border-neutral-300 text-neutral-700 hover:border-neutral-500'
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
            label="NHR / RNH"
            :model-value="store.rnh"
            data-cy="rnh"
            @update:model-value="store.setRnh"
          />
          <InfoButton
            label="NHR / RNH information"
            link="https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/Non_habitual_residents_Tax_regime.pdf"
          >
            <p>
              Non-habitual residents use a fixed IRS tax rate of
              {{ rnhTax }} in this simulator.
            </p>
          </InfoButton>
        </div>
      </div>

      <div v-if="expensesNeeded > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-medium text-neutral-700">
            Professional expenses
          </h3>
          <InfoButton
            label="Professional expenses information"
            link="https://www.cgd.pt/Site/Saldo-Positivo/leis-e-impostos/Pages/deducoes-especificas.aspx#:~:text=Empresariais%20e%20Profissionais%20(Categoria%20B)&text=Se%20estiver%20enquadrado%20no%20regime,bruto%20(antes%20dos%20descontos)."
          >
            <p>
              Category B specific deductions can require justified professional
              expenses above the automatic Social Security deduction.
            </p>
          </InfoButton>
        </div>
        <p class="text-xs text-neutral-500">
          Maximum required:
          <span class="font-semibold tabular-nums">
            {{ asCurrency(expensesNeeded) }}/year
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
            input-label="Professional expenses"
            decrease-label="Decrease professional expenses"
            increase-label="Increase professional expenses"
            data-cy="expenses"
            @update:value="store.setExpensesManual"
          />
          <button
            id="setExpensesAutoButton"
            type="button"
            class="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            :class="store.expensesAuto ? 'invisible' : 'visible'"
            @click="store.setExpensesAuto()"
          >
            auto
            <ArrowPathIcon class="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </DisclosurePanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { useTaxesStore } from "@/store";
import { asCurrency } from "@/utils.js";
import AdjustCounter from "@/components/AdjustCounter.vue";
import DisclosurePanel from "@/components/DisclosurePanel.vue";
import DropDown from "@/components/DropDown.vue";
import InfoButton from "@/components/InfoButton.vue";
import SwitchButton from "@/components/SwitchButton.vue";

defineEmits<{
  (event: "viewSocialSecurityCalculation"): void;
}>();

type ActivityYearSelection = "none" | "first" | "second";

const store = useTaxesStore();
const { expensesNeeded, grossIncome, rnhTax } = storeToRefs(store);

const formatSignedPercentage = (value: number) => {
  return `${value > 0 ? "+" : ""}${value * 100}%`;
};

const ssDiscountChoices = computed(() => store.ssDiscountChoices);
const ssDiscountPosition = ref(
  Math.max(store.ssDiscountChoices.indexOf(store.ssDiscount), 0),
);

watch(
  () => ssDiscountPosition.value,
  (newPosition) => {
    const selectedDiscount = store.ssDiscountChoices[newPosition];

    if (selectedDiscount !== undefined) {
      store.setSsDiscount(selectedDiscount);
    }
  },
);

watch(
  () => store.ssDiscount,
  (newDiscount) => {
    const newPosition = store.ssDiscountChoices.indexOf(newDiscount);

    if (newPosition !== -1 && newPosition !== ssDiscountPosition.value) {
      ssDiscountPosition.value = newPosition;
    }
  },
);

watch(
  () => store.currentTaxRankYear,
  () => {
    if (store.benefitsOfYouthIrs) {
      store.setYearOfYouthIrs(1);
    }
  },
);

const ssDiscountDisplay = computed(() =>
  formatSignedPercentage(store.ssDiscount),
);

const ssAdjustmentStatusMessage = computed(() => {
  if (store.ssFirstYear) {
    return "Social Security exemption is active; this adjustment currently has no monetary effect.";
  }

  if (store.ssIsAtMinimumContribution) {
    return "Minimum monthly Social Security contribution applied.";
  }

  if (store.ssIsContributionBaseCapped) {
    const firstDiscountBelowCap =
      store.ssFirstAvailableDiscountBelowContributionBaseCap;

    if (firstDiscountBelowCap === null) {
      return `Maximum Social Security base applied · ${asCurrency(
        store.ssContributionBase,
        2,
      )}/month.`;
    }

    return `Maximum Social Security base applied · ${asCurrency(
      store.ssContributionBase,
      2,
    )}/month. ${formatSignedPercentage(
      firstDiscountBelowCap,
    )} is the first available adjustment that changes the result.`;
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

const activityYearOptions: {
  value: ActivityYearSelection;
  label: string;
  dataCy: string;
}[] = [
  { value: "none", label: "None", dataCy: "activity-year-none" },
  { value: "first", label: "First fiscal year", dataCy: "first-year" },
  { value: "second", label: "Second fiscal year", dataCy: "second-year" },
];

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

const advancedSummary = computed(() => {
  const activeSettings: string[] = [];

  if (store.ssDiscount !== 0) {
    activeSettings.push(`SS base ${formatSignedPercentage(store.ssDiscount)}`);
  }

  if (store.benefitsOfYouthIrs) {
    activeSettings.push(`Youth IRS year ${store.yearOfYouthIrs}`);
  }

  if (store.ssFirstYear) {
    activeSettings.push("First 12 months SS exemption");
  }

  if (store.firstYear) {
    activeSettings.push("First fiscal year");
  } else if (store.secondYear) {
    activeSettings.push("Second fiscal year");
  }

  if (store.rnh) {
    activeSettings.push("NHR / RNH");
  }

  if (!store.expensesAuto) {
    activeSettings.push("Manual expenses");
  }

  return activeSettings.length > 0
    ? activeSettings.join(" · ")
    : "No custom tax settings";
});
</script>
