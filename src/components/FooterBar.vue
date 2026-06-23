<template>
  <footer
    v-if="showDashboard"
    class="mt-8 border-t border-neutral-200 py-6 text-sm text-neutral-600"
    data-cy="footer"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <p class="font-medium text-neutral-700">
          Indicative estimate · {{ YEAR_BUSINESS_DAYS }} business days · VAT
          excluded
        </p>
        <details class="mt-2">
          <summary
            class="cursor-pointer text-sm font-medium text-sky-700 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Assumptions and limitations
          </summary>
          <div class="mt-3 max-w-3xl space-y-2 text-xs text-neutral-500">
            <p>
              This estimate is for independent workers with green receipts
              (trabalhadores independentes com recibos verdes).
            </p>
            <p>
              VAT (IVA) is ignored for the scenario where clients are outside
              Portugal.
            </p>
            <p>
              Daily values use {{ YEAR_BUSINESS_DAYS }} business days minus
              unpaid days off.
            </p>
          </div>
        </details>
      </div>
      <RouterLink
        to="/about"
        class="text-sm font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        About and disclaimer
      </RouterLink>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useTaxesStore, YEAR_BUSINESS_DAYS } from "@/store";

const { showDashboard } = storeToRefs(useTaxesStore());
</script>
