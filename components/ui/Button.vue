<template>
  <button class="btn">
    <div class="btn__content">
      <slot />
    </div>
  </button>
</template>

<style lang="scss">
.btn {
  display: inline-flex;
  outline: none;
  border: none;
  height: 48px;
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
}
</style>
