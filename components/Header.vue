<template>
  <header>
    <ui-container class="header">
      <img src="/logo.png" width="auto" height="60px" />

      <nav>
        <ul class="list">
          <li class="list__item" v-for="(link, i) in links" :key="i">
            <nuxt-link :href="link.src">{{ link.title }}</nuxt-link>
          </li>
        </ul>
      </nav>

      <ui-button outlined>Вход</ui-button>
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
</script>

<style lang="scss">
.header {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
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
      text-decoration: none;
    }
  }
}
</style>