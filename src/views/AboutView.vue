<template>
  <div class="flex min-h-screen">
    <div class="m-auto max-w-3xl p-10 text-neutral-700 space-y-5">
      <h1 class="text-2xl font-semibold text-neutral-900">
        {{ t("about.title") }}
      </h1>
      <p>
        {{ t("about.intro") }}
      </p>
      <p>
        {{ t("about.maintained") }}
        <a
          class="underline underline-offset-4 hover:text-neutral-900"
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
      <div class="flex flex-wrap gap-4">
        <router-link
          to="/"
          class="hover:text-neutral-600 hover:decoration-neutral-600 underline underline-offset-4"
        >
          {{ t("actions.goToSimulator") }}
        </router-link>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/brunoramosdematos/freelancer-calculator-pt"
          class="hover:text-neutral-600 hover:decoration-neutral-600 underline underline-offset-4"
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

const { t } = useI18n({ useScope: "global" });
</script>
