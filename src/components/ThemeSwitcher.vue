<template>
  <fieldset
    class="space-y-2"
    data-cy="theme-preference"
    :aria-describedby="descriptionId"
  >
    <legend class="text-sm font-semibold text-foreground">
      {{ t("preferences.appearance") }}
    </legend>
    <div class="grid gap-2">
      <label
        v-for="option in themeOptions"
        :key="option.value"
        class="flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm leading-snug transition focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-surface"
        :data-cy="option.optionDataCy"
        :class="
          preference === option.value
            ? 'border-primary bg-primary-soft text-foreground'
            : 'border-default bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
        "
      >
        <input
          class="h-4 w-4 shrink-0 accent-primary"
          type="radio"
          name="theme-preference"
          :value="option.value"
          :checked="preference === option.value"
          :data-cy="option.dataCy"
          @change="setThemePreference(option.value)"
        />
        <component :is="option.icon" class="h-5 w-5 shrink-0" aria-hidden />
        <span
          class="min-w-0 flex-1 whitespace-normal leading-snug"
          data-cy="theme-option-label"
        >
          {{ option.label }}
        </span>
      </label>
    </div>
    <p :id="descriptionId" class="text-xs leading-5 text-subtle">
      {{ t("theme.systemDescription") }}
    </p>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";

import { useTheme } from "@/composables/useTheme";
import type { ThemePreference } from "@/theme";

const descriptionId = "theme-system-description";
const { t } = useI18n({ useScope: "global" });
const { preference, setThemePreference } = useTheme();

const themeOptions = computed<
  {
    value: ThemePreference;
    label: string;
    dataCy: string;
    optionDataCy: string;
    icon: typeof ComputerDesktopIcon;
  }[]
>(() => [
  {
    value: "system",
    label: t("theme.system"),
    dataCy: "theme-system",
    optionDataCy: "theme-option-system",
    icon: ComputerDesktopIcon,
  },
  {
    value: "light",
    label: t("theme.light"),
    dataCy: "theme-light",
    optionDataCy: "theme-option-light",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: t("theme.dark"),
    dataCy: "theme-dark",
    optionDataCy: "theme-option-dark",
    icon: MoonIcon,
  },
]);
</script>
