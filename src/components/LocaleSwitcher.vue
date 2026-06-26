<template>
  <div class="flex items-center">
    <label :for="selectId" class="sr-only">{{
      t("localeSwitcher.label")
    }}</label>
    <select
      :id="selectId"
      class="w-full max-w-[12rem] rounded-md border border-default bg-surface px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:max-w-none sm:text-sm"
      :value="locale"
      data-cy="locale-switcher"
      @change="onLocaleChange"
    >
      <option
        v-for="option in localeOptions"
        :key="option.locale"
        :value="option.locale"
        :data-cy="`locale-option-${option.locale}`"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { changeLocale } from "@/i18n";
import { SUPPORTED_LOCALES } from "@/i18n/locale";
import { languageNamesByLocale } from "@/i18n/locales";

const selectId = "locale-switcher";
const { t, locale } = useI18n({ useScope: "global" });
const localeOptions = SUPPORTED_LOCALES.map((supportedLocale) => ({
  locale: supportedLocale,
  label: languageNamesByLocale[supportedLocale],
}));

const onLocaleChange = (event: Event) => {
  changeLocale((event.target as HTMLSelectElement).value);
};
</script>
