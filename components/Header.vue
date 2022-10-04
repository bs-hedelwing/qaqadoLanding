<template>
  <header ref="header" :class="state.classes">
    <ui-container class="header__container">
      <nuxt-link href="/"
        ><img src="/logo.png" class="header__logo"
      /></nuxt-link>

      <nav>
        <ul class="list">
          <li class="list__item" v-for="(link, i) in links" :key="i">
            <nuxt-link :href="link.src">{{ link.title }}</nuxt-link>
          </li>
        </ul>
      </nav>

      <ui-button size="md" outlined>Вход</ui-button>
    </ui-container>
  </header>
</template>

<script lang="ts" setup>
const links = [
  {
    title: "Roadmap",
    src: "#roadmap",
  },
  {
    title: "О проекте",
    src: "#roadmap",
  },
  {
    title: "Контакты",
    src: "#roadmap",
  },
];

const header = ref();

const state = reactive({ classes: ["header"] });

const onScroll = (e) => {
  if (pageYOffset > 100) state.classes.push("header_sticked");
  else state.classes = state.classes.filter((cls) => cls !== "header_sticked");
};

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style lang="scss">
.header {
  transition: 0.2s ease;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  font-size: 20px;
  &__container {
    height: 92px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__logo {
    height: 3em;
    width: auto;
  }
  &_sticked {
    .header__container {
      height: 72px;
    }
    background: white;
    font-size: 16px;
  }
}

.list {
  padding: 0;
  display: flex;
  list-style: none;
  &__item {
    &:not(:first-child) {
      margin-left: 12px;
    }
    a {
      color: black;
      font-size: 18px;
      font-weight: 500;
      text-decoration: none;
    }
  }
}
</style>