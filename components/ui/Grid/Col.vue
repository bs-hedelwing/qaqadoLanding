<template>
  <div class="col" :class="[cols && `col-${cols}`, breakpoints]">
    <slot />
  </div>
</template>


<script>
export default {
  props: {
    cols: Number,
    sm: Number,
    md: Number,
    lg: Number,
    xl: Number,
  },

  computed: {
    breakpoints() {
      return ["sm", "md", "lg", "xl"]
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