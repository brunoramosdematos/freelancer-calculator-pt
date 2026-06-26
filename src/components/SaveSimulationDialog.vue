<template>
  <div
    id="defaultModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="save-simulation-dialog-title"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full bg-overlay/60"
  >
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl md:h-auto"
    >
      <!-- Modal content -->
      <div
        class="relative rounded-lg bg-surface-elevated text-foreground shadow-theme"
      >
        <!-- Modal header -->
        <div
          class="flex items-start justify-between rounded-t border-b bg-surface-elevated p-4"
        >
          <h3
            id="save-simulation-dialog-title"
            class="text-xl font-semibold text-foreground"
          >
            {{ t("actions.saveSimulation") }}
          </h3>
          <button
            type="button"
            class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-subtle hover:text-foreground"
            data-modal-hide="defaultModal"
            :aria-label="t('actions.closeModal')"
            @click="$emit('close')"
          >
            <XMarkIcon class="w-5 h-5" />
            <span class="sr-only">{{ t("actions.closeModal") }}</span>
          </button>
        </div>

        <!-- Modal body -->
        <div class="space-y-6 bg-surface-elevated p-6">
          <form autocomplete="off" @submit.prevent="storeSimulation">
            <div class="mb-6">
              <label for="simulation-name" class="sr-only">
                {{ t("simulations.namePlaceholder") }}
              </label>
              <input
                id="simulation-name"
                v-model="simulationName"
                type="text"
                autocomplete="off"
                data-cy="simulation-name"
                class="block w-full rounded-lg border border-default bg-surface p-2.5 text-sm text-foreground"
                :placeholder="t('simulations.namePlaceholder')"
                required
              />
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                data-cy="save-new-simulation-button"
                class="w-full rounded-lg bg-foreground px-5 py-2.5 text-center text-sm font-medium text-surface hover:bg-foreground focus:outline-none focus:ring-4 focus:ring-focus sm:w-auto"
              >
                {{ t("actions.saveNewSimulation") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTaxesStore } from "@/store";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// store
const store = useTaxesStore();
const simulationName = ref("");
const { t } = useI18n({ useScope: "global" });

const emit = defineEmits(["close", "saved"]);

const storeSimulation = () => {
  store.storeSimulation(simulationName.value);
  emit("saved");
};
</script>
