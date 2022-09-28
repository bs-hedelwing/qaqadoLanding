<template>
  <button
    class="btn btn_md"
    :class="[
      outlined && 'btn_outlined',
      `btn_${size}`,
      `btn_${color}`,
      dense && 'btn_dense',
    ]"
    v-bind="$attrs"
  >
    <div class="btn__content">
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
const {
  outlined,
  color = "primary",
  size = "md",
  dense = false,
} = defineProps<{
  outlined?: boolean;
  size?: "md" | "lg";
  color?: "primary" | "secondary";
  dense?: boolean;
}>();
</script>

<style lang="scss">
@import "~/assets/variables.scss";

$sizes: (
  "md": (
    "font-size": 14px,
    "border-radius": 10px,
    "min-width": 150px,
    "padding": 0 16px,
    "height": 36px,
  ),
  "lg": (
    "font-size": 16px,
    "border-radius": 20px,
    "min-width": 190px,
    "padding": 0 20px,
    "height": 44px,
  ),
);
.btn {
  display: inline-flex;
  outline: none;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  &_primary {
    background: $primary;
    color: white;
  }
  &_secondary {
    background: $secondary;
    color: $text-secondary-darken;
  }
  @each $size, $attrs in $sizes {
    &_#{$size} {
      @each $attr, $value in $attrs {
        #{$attr}: $value;
      }
    }
  }
  &_outlined {
    background: transparent;
    border: 2px solid $primary;
    color: black;
  }
  &_dense {
    min-width: initial;
  }
}
</style>
