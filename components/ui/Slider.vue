<template>
  <div class="slider">
    <div class="slider__container">
      <div class="slider__track" @click="onTrackClick" ref="track">
        <div class="slider__track-bg"></div>

        <div class="slider__track-fill" :style="{ width: left }"></div>
      </div>
      <div
        class="slider__thumb"
        @mousedown="onThumbDown"
        :style="{ left }"
      ></div>
      <div class="slider__label" :style="{ left }">{{ value }}</div>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 20px 0">
      <div>{{ min }}</div>
      <div>{{ max }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    min: {
      type: Number,
      default: 10,
    },
    max: {
      type: Number,
      default: 20,
    },
    value: {
      type: Number,
      default: 10,
    },
  },

  computed: {
    left() {
      const len = this.max - this.min;

      return (100 / len) * (this.value - this.min) + "%";
    },
  },
  methods: {
    onTrackClick(e) {
      const { width, left } = this.$refs.track.getBoundingClientRect();

      const len = this.max - this.min;
      const rounded = Math.round((e.pageX - left) / (width / len)) + this.min;

      this.value = Math.min(Math.max(this.min, rounded), this.max);
    },

    onThumbDown() {
      const onMouseUp = () => {
        window.removeEventListener("mousemove", this.onTrackClick);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", this.onTrackClick);
      window.addEventListener("mouseup", onMouseUp);
    },
  },
};
</script>

<style lang="scss">
$primary: #1f87ff;
$size: 40px;
$border-size: 6px;
$background: rgba(123, 180, 253, 0.38);

:root {
  -—size: $size;
}

.slider {
  padding-top: 52px;
  &__container {
    position: relative;
  }
  &__track {
    height: #{$size - $border-size * 2};
    width: 100%;
    border-radius: 20px;
    &-bg,
    &-fill {
      position: absolute;
      border-radius: inherit;
      height: inherit;
    }
    &-bg {
      width: 100%;
      background-color: $background;
    }
    &-fill {
      width: calc(0% + #{$size} / 2);
      background-color: $primary;
      transition: 0.2s ease;
    }
  }

  &__thumb {
    bottom: 0;
    position: absolute;
    width: $size;
    height: $size;
    background-color: white;
    cursor: pointer;
    border-radius: 50%;
    border: $border-size solid $primary;
    transform: translate(-50%, $border-size);
    transition: 0.2s ease;
  }

  &__label {
    top: -16px;
    position: absolute;
    background-color: $background;
    transform: translate(-50%, -100%);
    padding: 8px;
    border-radius: 6px;
    transition: 0.2s ease;
    &:before {
      position: absolute;
      bottom: 0;
      left: 50%;
      content: "";
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top: 6px solid $background;
      transform: translate(-50%, 100%);
    }
  }
}
</style>