<template>
  <component :is="tag">
    <slot />
  </component>
</template>
<script setup lang="ts">
const { tag = "h5" } = defineProps<{
  tag: string;
}>();
</script>
