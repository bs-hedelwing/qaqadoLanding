<template>
  <button class="btn" :class="[outlined && 'btn_outlined']">
    <div class="btn__content">
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
const { outlined } = defineProps<{ outlined?: boolean }>();
</script>

<style lang="scss">
.btn {
  display: inline-flex;
  outline: none;
  border: none;
  height: 46px;
  border-radius: 20px;
  background: #1f87ff;
  cursor: pointer;
  color: white;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
  min-width: 190px;
  &__content {
    font-weight: 600;
    font-size: 16px;
  }
  &_outlined {
    background: transparent;
    border: 3px solid #1f87ff;
    .btn__content {
      color: black;
    }
  }
}
</style>
