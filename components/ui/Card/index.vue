<template>
  <div
    class="card"
    :class="{
      primary: primary,
      outlined: outlined,
      'rounded-lg': moreRounded,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  primary: Boolean,
  outlined: Boolean,
  moreRounded: Boolean,
});
</script>

<style lang="scss">
@import "~/assets/variables.scss";

.card {
  padding: 20px 16px;
  background: #ffffff;
  border-radius: 15px;

  @media (min-width: #{map-get($breakpoints, "xl")}px) {
    padding: 30px 25px;
  }
}

.rounded-lg {
  border-radius: 25px;
}

.primary {
  background: #d7e1f7;
}

.outlined {
  border: 1px solid #b9c1cd;
  background: initial;
}
</style>
