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
    <slot />
  </button>
</template>

<script setup lang="ts">
const { outlined, color, dense, size } = withDefaults(
  defineProps<{
    outlined?: boolean;
    size?: "md" | "lg" | "xl";
    color?: "primary" | "secondary";
    dense?: boolean;
  }>(),
  {
    color: "primary",
    dense: false,
    size: "md",
  }
);
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
    "min-width": 170px,
    "padding": 0 20px,
    "height": 44px,
  ),
  "xl": (
    "font-size": 18px,
    "border-radius": 20px,
    "min-width": 180px,
    "padding": 0 20px,
    "height": 56px,
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
  transition: all 0.2s ease-in, transform 0.1s ease-out;
  &:active {
    transform: scale(0.98);
  }
  &_primary {
    background: $primary;
    color: white;
    &:hover {
      background: darken($primary, 5%);
    }
    &:active {
      background: darken($primary, 10%);
    }
  }
  &_secondary {
    background: $secondary;
    color: $text-secondary-darken;
    &:hover {
      background: darken($secondary, 5%);
    }
    &:active {
      background: darken($secondary, 10%);
    }
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
    &:hover {
      background: transparentize($primary, 0.93);
    }
    &:active {
      background: transparentize($primary, 0.87);
    }
  }
  &_dense {
    min-width: initial;
  }
}
</style>
