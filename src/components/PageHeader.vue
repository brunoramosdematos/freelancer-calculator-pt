<template>
  <header
    class="sticky top-0 z-50 border-b border-default bg-page/95 backdrop-blur"
    data-cy="page-header"
  >
    <nav class="flex items-center justify-between gap-3 px-4 py-2 sm:px-5">
      <div
        class="flex min-w-0 flex-wrap items-center justify-start gap-3 text-sm text-muted sm:gap-5 sm:text-base"
      >
        <router-link
          class="flex items-center justify-center space-x-3 rounded-sm hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          to="/"
        >
          <img
            src="@/assets/world.svg"
            class="h-7 dark:brightness-0 dark:invert"
            :alt="t('app.productAlt')"
          />
          <span>{{ t("navigation.simulator") }}</span>
        </router-link>
        <router-link
          v-if="store.hasStoredSimulations"
          data-cy="simulations-menu"
          class="flex items-center justify-center space-x-3 rounded-sm hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          to="/simulations"
        >
          <span>
            {{
              t(
                "navigation.simulations",
                {
                  count: store.storedSimulationsCount,
                },
                store.storedSimulationsCount,
              )
            }}
          </span>
        </router-link>
        <router-link
          class="flex items-center justify-center rounded-sm hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          to="/about"
        >
          {{ t("navigation.about") }}
        </router-link>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <PreferencesMenu />
        <a
          v-if="breakpoint.mdAndUp"
          class="cursor-pointer rounded-full p-2 text-muted transition hover:bg-surface-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/brunoramosdematos/freelancer-calculator-pt"
          :aria-label="t('navigation.githubSourceLabel')"
        >
          <img
            src="@/assets/github-mark.svg"
            class="h-7 dark:brightness-0 dark:invert"
            alt=""
          />
        </a>
      </div>
    </nav>
  </header>
</template>
<script lang="ts" setup>
import { useTaxesStore } from "@/store";
import { useBreakpoint } from "@/composables/breakpoints";
import PreferencesMenu from "@/components/PreferencesMenu.vue";
import { useI18n } from "vue-i18n";

const { breakpoint } = useBreakpoint();
const { t } = useI18n({ useScope: "global" });

const store = useTaxesStore();
store.loadSimulations();
</script>
