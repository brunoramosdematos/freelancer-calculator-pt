<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label
        for="number-of-dependents-input"
        class="text-sm font-medium text-neutral-700"
      >
        {{ t("dependents.total.label") }}
      </label>
      <AdjustCounter
        :value="store.numberOfDependents"
        :min="0"
        :unit="t('units.dependentUnit')"
        input-id="number-of-dependents-input"
        :input-label="t('dependents.total.input')"
        :decrease-label="t('dependents.total.decrease')"
        :increase-label="t('dependents.total.increase')"
        data-cy="number-of-dependents"
        @update:value="handleNumberOfDependentsUpdate"
      />
    </div>

    <section
      v-if="store.numberOfDependents > 0"
      class="rounded-lg border border-neutral-200 bg-neutral-50/80"
      data-cy="dependent-age-groups"
    >
      <h3 class="text-sm font-semibold text-neutral-800">
        <button
          :id="toggleId"
          type="button"
          class="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4"
          :aria-expanded="isAgeGroupsOpen"
          :aria-controls="panelId"
          data-cy="dependent-age-groups-toggle"
          @click="toggleAgeGroups"
        >
          <span class="min-w-0">
            <span class="block">{{ t("dependents.ageGroups.title") }}</span>
            <span
              class="mt-1 block text-xs font-normal leading-5 text-neutral-600"
              data-cy="dependent-age-groups-summary"
            >
              {{ summaryText }}
            </span>
          </span>
          <ChevronDownIcon
            class="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 motion-safe:transition-transform"
            :class="isAgeGroupsOpen ? 'rotate-180' : ''"
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        :id="panelId"
        class="space-y-4 border-t border-neutral-200 px-3 pb-3 pt-3 sm:px-4"
        :hidden="!isAgeGroupsOpen"
        :aria-labelledby="toggleId"
        data-cy="dependent-age-groups-panel"
      >
        <p class="text-xs leading-5 text-neutral-500">
          {{ t("dependents.ageGroups.help") }}
        </p>

        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <label
              for="dependents-aged-3-or-under-input"
              class="text-sm font-medium text-neutral-700"
            >
              {{ t("dependents.ageGroups.aged3OrUnder.label") }}
            </label>
            <AdjustCounter
              :value="store.dependentsAged3OrUnder"
              :min="0"
              :max="store.numberOfDependents"
              :unit="t('units.dependentUnit')"
              input-id="dependents-aged-3-or-under-input"
              :input-label="t('dependents.ageGroups.aged3OrUnder.input')"
              :decrease-label="t('dependents.ageGroups.aged3OrUnder.decrease')"
              :increase-label="t('dependents.ageGroups.aged3OrUnder.increase')"
              data-cy="dependents-aged-3-or-under"
              @update:value="store.setDependentsAged3OrUnder"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <label
              for="dependents-aged-4-to-6-input"
              class="text-sm font-medium text-neutral-700"
            >
              {{ t("dependents.ageGroups.aged4To6.label") }}
            </label>
            <AdjustCounter
              :value="store.dependentsAged4To6"
              :min="0"
              :max="store.numberOfDependents - store.dependentsAged3OrUnder"
              :unit="t('units.dependentUnit')"
              input-id="dependents-aged-4-to-6-input"
              :input-label="t('dependents.ageGroups.aged4To6.input')"
              :decrease-label="t('dependents.ageGroups.aged4To6.decrease')"
              :increase-label="t('dependents.ageGroups.aged4To6.increase')"
              data-cy="dependents-aged-4-to-6"
              @update:value="store.setDependentsAged4To6"
            />
          </div>

          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span
                :id="aged7OrOverLabelId"
                class="text-sm font-medium text-neutral-700"
              >
                {{ t("dependents.ageGroups.aged7OrOver.label") }}
              </span>
              <p
                :id="derivedLabelId"
                class="mt-1 text-xs text-neutral-500"
                data-cy="dependent-age-groups-derived-label"
              >
                {{ t("dependents.ageGroups.aged7OrOver.calculated") }}
              </p>
            </div>
            <output
              class="inline-flex min-w-[5rem] justify-center border-b border-neutral-600 py-2 text-sm tabular-nums text-neutral-900"
              data-cy="dependents-aged-7-or-over"
              :aria-labelledby="aged7OrOverLabelId"
              :aria-describedby="derivedLabelId"
            >
              {{ store.dependentsAged7OrOver }}
            </output>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AdjustCounter from "@/components/AdjustCounter.vue";
import { getDependentAgeGroupsSummaryDescriptor } from "@/components/dependentAgeGroupsSummary";
import { useTaxesStore } from "@/store";

const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });

const toggleId = "dependent-age-groups-toggle";
const panelId = "dependent-age-groups-panel";
const derivedLabelId = "dependents-aged-7-or-over-derived-label";
const aged7OrOverLabelId = "dependents-aged-7-or-over-label";

const isAgeGroupsOpen = ref(false);

const summaryText = computed(() => {
  const descriptor = getDependentAgeGroupsSummaryDescriptor(
    store.numberOfDependents,
    store.dependentsAged3OrUnder,
    store.dependentsAged4To6,
  );

  return t(descriptor.key, descriptor.values ?? {}, descriptor.plural);
});

const toggleAgeGroups = () => {
  isAgeGroupsOpen.value = !isAgeGroupsOpen.value;
};

const handleNumberOfDependentsUpdate = (nextValue: number) => {
  const previousValue = store.numberOfDependents;

  store.setNumberOfDependents(nextValue);

  if (previousValue === 0 && store.numberOfDependents > 0) {
    isAgeGroupsOpen.value = true;
  }

  if (store.numberOfDependents === 0) {
    isAgeGroupsOpen.value = false;
  }
};

watch(
  () => store.numberOfDependents,
  (total) => {
    if (total === 0) {
      isAgeGroupsOpen.value = false;
    }
  },
);
</script>
