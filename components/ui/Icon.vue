<template>
  <svg
    :height="size"
    :width="size"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    role="img"
  >
    <path :d="d" />
  </svg>
</template>

<script setup lang="ts">
const { d, size = "100%" } = defineProps<{ d: string; size?: string }>();
</script>
