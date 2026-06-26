<template>
  <PageHeader></PageHeader>
  <main>
    <RouterView />
  </main>
</template>
<script lang="ts" setup>
import { onBeforeUnmount } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import { startThemeController } from "@/composables/useTheme";

const { stop } = startThemeController();
onBeforeUnmount(stop);
</script>
