<template>
  <component
    :is="tag"
    :class="[
      size && `text-${size}`,
      gutterBottom && `text-gutter-${gutterBottom}`,
      weight && `text-weight-${weight}`,
      `text-${color}`,
    ]"
  >
    <slot></slot>
  </component>
</template>


<script lang="ts">
export default {
  props: {
    tag: {
      type: String,
      default: "div",
    },
    size: String,
    gutterBottom: String,
    weight: String,
    color: {
      type: String,
      default: "primary",
      validator: (value: string) => ["primary", "secondary"].includes(value),
    },
  },
};
</script>


<style lang="scss">
$sizes: (
  "xs": 14,
  "sm": 16,
  "md": 18,
  "lg": 20,
);

$gutters: (
  "sm": 0.5em,
  "md": 1em,
  "lg": 1.5em,
);

$weights: (
  "medium": 500,
  "bold": 600,
);

$colors: (
  "default": "#000",
  "primary": "#1f87ff",
  "secondary": "#878787",
);

@each $key, $size in $sizes {
  .text-#{$key} {
    font-size: #{$size}px;
  }
}

@each $key, $gutter in $gutters {
  .text-gutter-#{$key} {
    margin-bottom: $gutter;
  }
}

@each $key, $weight in $weights {
  .text-weight-#{$key} {
    font-weight: $weight;
  }
}

@each $key, $color in $colors {
  .text-#{$key} {
    color: $color;
  }
}
</style>