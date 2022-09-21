<template>
  <div class="col" :class="[cols && `col-${cols}`, breakpoints]">
    <slot />
  </div>
</template>


<script>
const breakpoints = ["xs", "sm", "md", "lg", "xl"];

export default {
  props: {
    cols: Number,
    ...breakpoints.reduce((acc, cur) => ({ ...acc, [cur]: Number }), {}),
  },

  computed: {
    breakpoints() {
      return breakpoints
        .map(
          (breakpoint) =>
            this[breakpoint] && `col-${breakpoint}-${this[breakpoint]}`
        )
        .filter((value) => value)
        .join(" ");
    },
  },
};
</script>