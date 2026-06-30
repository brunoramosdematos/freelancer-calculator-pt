<template>
  <div class="flex min-h-screen">
    <div
      class="m-auto w-full max-w-3xl px-4 py-10 text-foreground space-y-5 sm:p-10"
    >
      <h1 class="text-2xl font-semibold text-foreground">
        {{ t("about.title") }}
      </h1>
      <p>
        {{ t("about.intro") }}
      </p>
      <p>
        {{ t("about.maintained") }}
        <a
          class="break-all underline underline-offset-4 hover:text-foreground"
          href="https://github.com/franciscobmacedo/remotefreelancept"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/franciscobmacedo/remotefreelancept </a
        >.
      </p>
      <p>
        {{ t("about.disclaimer") }}
      </p>
      <TaxDataCoverageSection />
      <div class="flex flex-wrap gap-4">
        <router-link
          to="/"
          class="hover:text-muted hover:decoration-current underline underline-offset-4"
        >
          {{ t("actions.goToSimulator") }}
        </router-link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/brunoramosdematos/freelancer-calculator-pt"
          class="hover:text-muted hover:decoration-current underline underline-offset-4"
        >
          {{ t("actions.contributeOnGitHub") }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import TaxDataCoverageSection from "@/components/TaxDataCoverageSection.vue";

const { t } = useI18n({ useScope: "global" });
</script>
