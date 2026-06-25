<template>
  <DropDown
    :choices="Object.keys(FrequencyChoices)"
    @change="changeFrequency"
    data-cy="frequency-dropdown"
    :value="incomeFrequency"
    :display-value="t(`frequency.${incomeFrequency}`)"
    :label="t('frequency.showIncomePer')"
    :choice-labels="frequencyChoiceLabels"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { FrequencyChoices } from "@/typings";
import { storeToRefs } from "pinia";
import { useTaxesStore } from "@/store";

import DropDown from "@/components/DropDown.vue";

const { incomeFrequency } = storeToRefs(useTaxesStore());
const store = useTaxesStore();
const { t } = useI18n({ useScope: "global" });

const frequencyChoiceLabels = computed(() => ({
  Year: t("frequency.Year"),
  Month: t("frequency.Month"),
  Day: t("frequency.Day"),
}));

const changeFrequency = (frequencyChoice: string) => {
  store.setIncomeFrequency(FrequencyChoices[frequencyChoice]);
};
</script>
