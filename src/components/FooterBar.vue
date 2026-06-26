<template>
  <footer
    v-if="showDashboard"
    class="mt-8 border-t border-default py-6 text-sm text-muted"
    data-cy="footer"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <p class="font-medium text-foreground">
          {{
            t("footer.headline", {
              businessDays: YEAR_BUSINESS_DAYS,
            })
          }}
        </p>
        <details class="mt-2">
          <summary
            class="cursor-pointer text-sm font-medium text-primary underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            {{ t("footer.assumptionsTitle") }}
          </summary>
          <div class="mt-3 max-w-3xl space-y-2 text-xs text-subtle">
            <p>
              {{ t("footer.independentWorkers") }}
            </p>
            <p>
              {{ t("footer.vatIgnored") }}
            </p>
            <p>
              {{
                t("footer.dailyValues", { businessDays: YEAR_BUSINESS_DAYS })
              }}
            </p>
          </div>
        </details>
      </div>
      <RouterLink
        to="/about"
        class="text-sm font-medium text-foreground underline underline-offset-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
      >
        {{ t("footer.aboutDisclaimer") }}
      </RouterLink>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTaxesStore, YEAR_BUSINESS_DAYS } from "@/store";

const { showDashboard } = storeToRefs(useTaxesStore());
const { t } = useI18n({ useScope: "global" });
</script>
