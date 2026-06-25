<template>
  <div class="flex items-center">
    <label :for="selectId" class="sr-only">{{
      t("localeSwitcher.label")
    }}</label>
    <select
      :id="selectId"
      class="max-w-[9.5rem] rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-none sm:text-sm"
      :value="locale"
      data-cy="locale-switcher"
      @change="onLocaleChange"
    >
      <option value="en" data-cy="locale-option-en">
        {{ t("localeSwitcher.english") }}
      </option>
      <option value="pt-PT" data-cy="locale-option-pt-PT">
        {{ t("localeSwitcher.portuguesePortugal") }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { changeLocale } from "@/i18n";

const selectId = "locale-switcher";
const { t, locale } = useI18n({ useScope: "global" });

const onLocaleChange = (event: Event) => {
  changeLocale((event.target as HTMLSelectElement).value);
};
</script>
