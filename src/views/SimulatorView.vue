<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Form></Form>
    <Dashboard v-if="showDashboard"></Dashboard>
    <FooterBar />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { useTaxesStore } from "@/store";
import { consumeInternalQueryUpdate } from "@/router";
import { useRoute } from "vue-router";

import Form from "@/components/Form.vue";
import Dashboard from "@/components/Dashboard.vue";
import FooterBar from "@/components/FooterBar.vue";

const store = useTaxesStore();

const { showDashboard } = storeToRefs(store);

const route = useRoute();

watch(
  () => route.fullPath,
  () => {
    if (consumeInternalQueryUpdate()) {
      return;
    }

    store.setParametersFromURL(route.query);
  },
  { immediate: true },
);
</script>
