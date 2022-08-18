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


<style>
.card {
  padding: 30px 25px;
  background: #ffffff;
  border-radius: 15px;
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