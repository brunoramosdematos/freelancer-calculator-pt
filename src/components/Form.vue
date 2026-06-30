<template>
  <transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="transform opacity-0"
  >
    <SaveSimulationDialog
      v-if="showNewSimulationDialog"
      @close="showNewSimulationDialog = false"
      @saved="simulationSaved"
    />
  </transition>
  <transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="transform opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="transform opacity-0"
  >
    <AsyncReportPreviewDialog
      v-if="showReportPreview"
      :current-url="reportCurrentUrl"
      @close="closeReportPreview"
    />
  </transition>
  <div
    class="flex text-center transition delay-5 duration-100 ease-in-out"
    data-cy="income-form-shell"
    :data-state="hasIncome ? 'active' : 'landing'"
    :class="formShellClass"
  >
    <div
      class="container mx-auto w-full max-w-2xl"
      data-cy="income-form-container"
    >
      <div class="relative md:h-44">
        <h1
          class="font-semibold mt-4 md:mt-0"
          data-cy="product-heading"
          :data-state="hasIncome ? 'active' : 'landing'"
          :class="headingClass"
        >
          {{ t("app.productHeading") }}
        </h1>
        <p class="md:mt-3 md:mb-5 text-sm md:text-xl text-muted font-light">
          {{ t("simulator.tagline") }}
        </p>
        <div class="flex flex-col items-center gap-3 md:gap-4">
          <div class="flex w-full items-center justify-center">
            <div class="relative group w-7/12">
              <div class="relative">
                <FormattedNumberInput
                  v-model:value="internalIncome"
                  :placeholder="t('simulator.incomePlaceholder')"
                  class="pl-7"
                  data-cy="income"
                  @click="showDropdown = true"
                  @update:value="showDropdown = false"
                />

                <ChevronDownIcon
                  class="absolute h-4 left-2 bottom-3 text-muted"
                />
                <div
                  class="hidden absolute right-6 bottom-3 transition delay-5 duration-100 ease-in-out"
                  :class="{ 'group-hover:block': breakpoint.mdAndUp }"
                >
                  <button
                    class="uppercase text-primary text-xs border-[0.5px] border-primary rounded-full px-5 py-[2px] hover:border-primary hover:text-primary focus:bg-primary-soft"
                    :aria-label="
                      t('simulator.decreaseIncome', {
                        amount: changeAmount.text,
                      })
                    "
                    @click="
                      store.setIncome((store.income ?? 0) - changeAmount.value)
                    "
                  >
                    - {{ changeAmount.text }}
                  </button>
                  <button
                    class="uppercase text-primary text-xs border-[0.5px] border-primary rounded-full px-5 py-[2px] ml-1 hover:border-primary hover:text-primary focus:bg-primary-soft"
                    :aria-label="
                      t('simulator.increaseIncome', {
                        amount: changeAmount.text,
                      })
                    "
                    @click="
                      store.setIncome((store.income ?? 0) + changeAmount.value)
                    "
                  >
                    + {{ changeAmount.text }}
                  </button>
                </div>
                <CurrencyEuroIcon
                  class="absolute h-5 text-muted right-0 bottom-3"
                />
              </div>
              <transition
                enter-active-class="duration-300 ease-out"
                enter-from-class="transform opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="transform opacity-0"
              >
                <div
                  v-if="showDropdown"
                  v-click-outside="() => (showDropdown = false)"
                  class="transition delay-5 duration-100 pt-5 pb-5 ease-in-out absolute w-full h-fit bg-surface-muted rounded-md drop-shadow-md z-10"
                  @click="showDropdown = false"
                >
                  <div
                    class="flex flex-wrap gap-2 content-center justify-items-center place-items-center place-content-center text-center"
                  >
                    <CurrencyButton
                      v-for="defaultIncome in defaultIncomes"
                      :key="defaultIncome"
                      :value="defaultIncome"
                    />
                  </div>
                </div>
              </transition>
            </div>
            <div class="w-1/12">/</div>
            <div :class="hasIncome ? 'w-3/12' : 'w-4/12'">
              <FrequencyButton />
            </div>
          </div>
          <SimulationActionToolbar
            v-if="hasIncome"
            ref="simulationActionToolbarRef"
            @reset="store.reset()"
            @share="share"
            @export-report="openReportPreview"
            @save="showNewSimulationDialog = true"
          />
        </div>
      </div>
    </div>
    <ToastDialog v-if="showToast" :text="toastMessage" @close="closeToast" />
  </div>
</template>
<script setup lang="ts">
import { defineAsyncComponent, nextTick, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { CurrencyEuroIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { useTaxesStore } from "@/store";
import { useBreakpoint } from "@/composables/breakpoints";
import CurrencyButton from "@/components/CurrencyButton.vue";
import ToastDialog from "@/components/ToastDialog.vue";
import FormattedNumberInput from "@/components/FormattedNumberInput.vue";
import FrequencyButton from "@/components/FrequencyButton.vue";
import SaveSimulationDialog from "@/components/SaveSimulationDialog.vue";
import SimulationActionToolbar from "@/components/SimulationActionToolbar.vue";
import { FrequencyChoices } from "@/typings";

const AsyncReportPreviewDialog = defineAsyncComponent(
  () => import("@/components/report/ReportPreviewDialog.vue"),
);
const { breakpoint } = useBreakpoint();
const { t } = useI18n({ useScope: "global" });

// store
const { incomeFrequency, income } = storeToRefs(useTaxesStore());
const store = useTaxesStore();

// dropdwon
const showDropdown = ref(false);

// income
const internalIncome = computed({
  get() {
    return store.income;
  },
  set(value) {
    store.setIncome(value ? value : 0);
  },
});

const hasIncome = computed(
  () =>
    income.value !== null && Number.isFinite(income.value) && income.value > 0,
);

const headingClass = computed(() =>
  hasIncome.value
    ? "text-lg md:text-xl lg:text-2xl"
    : "text-lg sm:text-xl md:text-2-xl lg:text-3xl xl:text-4xl",
);

const formShellClass = computed(() =>
  hasIncome.value
    ? "items-start justify-center pt-10 pb-6 sm:pt-12 lg:pt-14"
    : "min-h-[calc(100vh-var(--app-header-height,3.5rem))] items-center justify-center py-6 sm:py-8",
);

const defaultIncomes = computed(() => {
  switch (incomeFrequency.value) {
    case FrequencyChoices.Year:
      return [30000, 50000, 60000, 70000, 100000];
    case FrequencyChoices.Month:
      return [3000, 5000, 6000, 7000, 10000];
    case FrequencyChoices.Day:
      return [200, 300, 500, 700, 1000];
    default:
      return [30000, 50000, 60000, 70000, 100000];
  }
});

const changeAmount = computed(() => {
  switch (incomeFrequency.value) {
    case FrequencyChoices.Month:
      return { value: 1000, text: "1k" };
    case FrequencyChoices.Day:
      return { value: 100, text: "100" };
    default:
      return { value: 5000, text: "5k" };
  }
});

// share
const showToast = ref(false);
const toastMessage = ref("");
const showNewSimulationDialog = ref(false);
const showReportPreview = ref(false);
const reportCurrentUrl = ref("");
const simulationActionToolbarRef = ref<InstanceType<
  typeof SimulationActionToolbar
> | null>(null);

const closeToast = () => {
  showToast.value = false;
};

const share = () => {
  toastMessage.value = t("simulator.shareCopied");
  navigator.clipboard.writeText(window.location.href);
  showToast.value = true;
};

const simulationSaved = () => {
  showNewSimulationDialog.value = false;
  toastMessage.value = t("simulator.simulationSaved");
  showToast.value = true;
};

const openReportPreview = () => {
  if (!hasIncome.value) {
    return;
  }

  reportCurrentUrl.value = window.location.href;
  showReportPreview.value = true;
};

const closeReportPreview = async () => {
  showReportPreview.value = false;
  await nextTick();
  simulationActionToolbarRef.value?.focusExportButton();
};
</script>
