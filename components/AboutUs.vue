<template>
  <section class="section" style="background: #fafcff">
    <ui-container>
      <h2 class="section-title">
        <span> О нас </span>
      </h2>
      <ui-grid-row spacing="lg">
        <ui-grid-col :cols="12" :lg="6" v-for="(card, i) in cards" :key="i">
          <ui-card
            outlined
            style="display: flex; align-items: center; gap: 16px"
          >
            <div>
              <component class="icon" :is="card.icon" />
            </div>
            <div>
              <h5 class="about-subtitle">{{ card.title }}</h5>
              <p class="about-description">
                {{ card.subtitle }}
              </p>
            </div>
          </ui-card>
        </ui-grid-col>
      </ui-grid-row>
    </ui-container>
  </section>
</template>

<script>
import { mdiCheck } from "@mdi/js";
import { IconsPeople, IconsRocket } from "~~/.nuxt/components";
export default {
  data: () => ({
    mdiCheck,
    cards: [
      {
        title: "Соцсетей много - платформа одна",
        subtitle:
          "Сделайте себя и свой контент доступным для аудитории, где бы вы ни находились",
        icon: IconsRocket,
      },
      {
        title: "Кроссеть",
        subtitle:
          "Расширяйте свою сеть профессиональных и личных контактов без ограничений",
        icon: IconsPeople,
      },
      {
        title: "Персональное представительство",
        subtitle:
          "Единая платформа для поиска, коммуникаций и взаимодейтсвия между пользователями",
      },
      {
        title: "Платежи и услуги",
        subtitle:
          "Принимайте пожертвования и оказывайте услуги с минимальными комиссиями",
      },
    ],
  }),
};
</script>

<style lang="scss">
.icon {
  width: 112px;
  height: 112px;
}

.about-subtitle {
  font-weight: 600;
  font-size: 20px;
  line-height: 1.2em;
  letter-spacing: 0.09em;
  margin-bottom: 1.5em;
}

.about-description {
  font-weight: 500;
  font-size: 16px;
  line-height: 1.2em;
  letter-spacing: 0.09em;
  color: #696969;
}
</style>
