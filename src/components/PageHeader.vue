<template>
  <header class="sticky top-0 z-50 bg-defaultbg">
    <nav class="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
      <div
        class="flex min-w-0 flex-wrap items-center justify-start gap-3 sm:gap-5"
      >
        <router-link class="flex items-center justify-center space-x-3" to="/">
          <img
            src="@/assets/world.svg"
            class="h-7"
            :alt="t('app.productAlt')"
          />
          <span>{{ t("navigation.simulator") }}</span>
        </router-link>
        <router-link
          v-if="store.hasStoredSimulations"
          data-cy="simulations-menu"
          class="flex items-center justify-center space-x-3"
          to="/simulations"
        >
          <span>
            {{
              t("navigation.simulations", {
                count: store.storedSimulationsCount,
              })
            }}
          </span>
        </router-link>
        <router-link class="flex items-center justify-center" to="/about">
          {{ t("navigation.about") }}
        </router-link>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <LocaleSwitcher />
        <a
          v-if="breakpoint.mdAndUp"
          class="cursor-pointer p-3"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/brunoramosdematos/freelancer-calculator-pt"
          :aria-label="t('navigation.githubSourceLabel')"
        >
          <img src="@/assets/github-mark.svg" class="h-7" alt="" />
        </a>
      </div>
    </nav>
  </header>
</template>
<script lang="ts" setup>
import { useTaxesStore } from "@/store";
import { useBreakpoint } from "@/composables/breakpoints";
import LocaleSwitcher from "@/components/LocaleSwitcher.vue";
import { useI18n } from "vue-i18n";

const { breakpoint } = useBreakpoint();
const { t } = useI18n({ useScope: "global" });

const store = useTaxesStore();
store.loadSimulations();
</script>
