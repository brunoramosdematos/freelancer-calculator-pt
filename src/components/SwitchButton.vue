<template>
  <div class="flex justify-center flex-wrap">
    <div>
      <input
        class="relative mt-[0.3rem] mr-2 h-5 w-10 appearance-none rounded-full border border-default bg-surface-hover transition after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform after:content-[''] checked:border-primary checked:bg-primary checked:after:translate-x-5 checked:after:bg-surface hover:cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        type="checkbox"
        role="switch"
        :id="id"
        :value="modelValue"
        :checked="modelValue"
        @input="updateValue($event)"
      />
      <label
        class="text-xs text-foreground md:text-sm hover:cursor-pointer"
        :for="id"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>
<script lang="ts" setup>
const emits = defineEmits(["update:modelValue", "input"]);
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emits("update:modelValue", target.checked);
};
</script>
