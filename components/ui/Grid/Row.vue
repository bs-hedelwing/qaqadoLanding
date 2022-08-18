<template>
  <div class="row" :class="[spacing && `row_spacing-${spacing}`]">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    spacing: "xs" | "sm" | "md" | "lg" | "xl",
  },
};
</script>

<style lang="scss">
@import "~/assets/variables.scss";

$cols: 12;

$sizes: (
  xs: 4,
  sm: 12,
  md: 24,
  lg: 32,
  xl: 40,
);

.row {
  display: flex;
  flex-wrap: wrap;
  @each $size, $value in $sizes {
    &_spacing-#{$size} {
      margin: calc(-#{$value}px / 2) !important;
      width: calc(100% + #{$value}px) !important;

      & > .col {
        padding: calc(#{$value}px / 2);
      }
    }
  }
}

.col {
  flex-shrink: 0;
  flex-grow: 0;
  width: auto;
  flex-basis: auto;
  @for $i from 1 through $cols {
    &-#{$i} {
      width: calc(100% / #{$cols} * #{$i});
      flex-basis: calc(100% / #{$cols} * #{$i});
    }
    @each $size, $breakpoint in $breakpoints {
      @media (min-width: #{$breakpoint}px) {
        &-#{$size}-#{$i} {
          width: calc(100% / #{$cols} * #{$i}) !important;
          flex-basis: calc(100% / #{$cols} * #{$i}) !important;
        }
      }
    }
  }
}
</style>