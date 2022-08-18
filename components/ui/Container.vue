<template>
  <div class="container">
    <slot />
  </div>
</template>

<style lang="scss">
@import "~/assets/variables.scss";

$padding: 12;

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 #{$padding}px;
}

$max-width: (
  "md": 736,
  "lg": 992,
  "xl": 1324,
);

@each $key, $value in $breakpoints {
  @media (min-width: #{$value}px) {
    .container {
      @if map-get($max-width, $key) {
        max-width: #{map-get($max-width, $key) + $padding}px;
      }
    }
  }
}
</style>