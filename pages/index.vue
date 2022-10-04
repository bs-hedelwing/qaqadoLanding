<template>
  <div>
    <Header />
    <div class="frame first-frame">
      <ui-container
        style="
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 100vh;
          position: relative;
          padding-top: 92px;
          padding-bottom: 32px;
        "
      >
        <ui-grid-row
          spacing="lg"
          class="hero"
          style="display: flex; align-items: center; height: 100%; flex-grow: 1"
        >
          <ui-grid-col :cols="6" class="hero__content">
            <div style="display: grid; grid-gap: 32px">
              <h1 class="main-title">
                <span class="text-primary">Единая платформа</span> для
                взаимодействия с социальными сетями
              </h1>
              <p class="text-secondary">
                Qaqado - самая удобная площадка для купли и продажи
                криптовалюты.
              </p>
              <div>
                <ui-button size="lg"> Подробнее </ui-button>
              </div>
            </div>
          </ui-grid-col>
          <ui-grid-col :cols="6" class="hero__image-container">
            <icons-hero class="hero__image" />
          </ui-grid-col>
        </ui-grid-row>

        <div style="padding-top: 36px">
          <ui-grid-row spacing="lg">
            <ui-grid-col
              :cols="12"
              :md="6"
              :lg="3"
              v-for="(statistic, i) in statistics"
              :key="i"
            >
              <ui-card
                primary
                style="text-align: center; height: 100%; padding: 16px 30px"
              >
                <h5 class="statictics-title text-primary">
                  {{ statistic.title }}
                </h5>
                <ui-typography size="lg">{{
                  statistic.subtitle
                }}</ui-typography>
              </ui-card>
            </ui-grid-col></ui-grid-row
          >
        </div>
      </ui-container>
    </div>

    <AboutUs />

    <section class="section frame">
      <ui-container>
        <h2 class="section-title">
          <span> Структура токена </span>
        </h2>

        <ui-grid-row spacing="md">
          <ui-grid-col :cols="12" :lg="3">
            <ui-grid-row spacing="md">
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Старт продаж</ui-typography
                  >
                  <p>Октябрь 21, 2022</p>
                </ui-card>
              </ui-grid-col>
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Старт торгов</ui-typography
                  >
                  <p>Май 21, 2023</p></ui-card
                >
              </ui-grid-col>
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Задачи токена</ui-typography
                  >
                  <p>Май 21, 2023</p>
                </ui-card>
              </ui-grid-col>
            </ui-grid-row>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="6">
            <ui-card style="display: grid; grid-gap: 40px">
              <div style="display: flex; justify-content: space-between">
                <div>Всего продано токенов:</div>
                <div>Текущий период: 1/10</div>
              </div>

              <ui-slider></ui-slider>

              <div style="text-align: center">
                <ui-typography size="lg" gutterBottom="md" weight="bold">
                  Текущая стоимость 1 536 $
                </ui-typography>
                <ui-typography size="md" gutterBottom="lg">
                  Станьте партнером и получите до 20% дохода от продаж
                </ui-typography>
                <div>
                  <ui-button size="lg">Купить токен</ui-button>
                  <ui-button size="lg" outlined>Вход</ui-button>
                </div>
              </div>
            </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="3">
            <ui-grid-row spacing="md">
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Текущий дисконт</ui-typography
                  >
                  <p>Май 21, 2023</p>
                </ui-card>
              </ui-grid-col>
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Минимальная прибыль после сейла</ui-typography
                  >
                  <p>Май 21, 2023</p>
                </ui-card>
              </ui-grid-col>
              <ui-grid-col :cols="12">
                <ui-card>
                  <ui-typography size="lg" gutter-bottom="sm" tag="h5"
                    >Принимаем</ui-typography
                  >
                  <p>ETH, BTC, BNB, BUSD, SBER</p>
                </ui-card>
              </ui-grid-col>
            </ui-grid-row>
          </ui-grid-col>
        </ui-grid-row>
      </ui-container>
    </section>

    <Roadmap />

    <section class="section frame">
      <ui-container>
        <h2 class="section-title">
          <span> Наши партнеры </span>
        </h2>
      </ui-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { useDashboardStore } from "~/stores/dashboard";
const dashboardStore = useDashboardStore();
dashboardStore.getAddressAmount();

const numberFormat = d3.format("~s");

const statistics = [
  {
    title: numberFormat(dashboardStore.addressList?.data.totalCount),
    subtitle: "Держателей токенов",
  },
  {
    title: numberFormat(1200),
    subtitle: "Блогеров и лидеров мнений",
  },
  {
    title: "50%",
    subtitle: "Токенов уже продано",
  },
  {
    title: "3kkk",
    subtitle: "Потенциальная аудитория",
  },
];
</script>

<style lang="scss">
@import "~/assets/variables.scss";

.hero {
  flex-wrap: wrap;
  &__image-container {
    flex-basis: 50%;
  }

  &__content {
    flex-basis: 50%;
  }

  @media (orientation: portrait) {
    flex-wrap: wrap-reverse;
    &__image-container {
      flex-basis: 100%;
    }

    &__content {
      flex-basis: 100%;
      text-align: center;
    }
  }
}

.hero__image {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  @media (min-width: #{map-get($breakpoints, "lg")}px) {
    max-width: 360px;
  }
  @media (min-width: #{map-get($breakpoints, "md")}px) and (orientation: portrait) {
    max-width: calc(100% - 160px);
  }
  @media (min-width: #{map-get($breakpoints, "xl")}px) {
    max-width: initial;
  }
}

.frame {
  background-image: linear-gradient(
    80.15deg,
    #dce1f8 0%,
    #fbefed 52.47%,
    #cadbff 100%
  );
}

.first-frame {
  min-height: 100vh;
  width: 100%;
  background-image: url("wave.svg"),
    linear-gradient(
      78.12deg,
      #dce1f8 -0.05%,
      #fef1eb 49.36%,
      #e2e5f6 87.56%,
      #cadbff 99.5%
    );
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-position: center;

  @media (orientation: portrait) {
    background-image: url("wave-mobile.svg"),
      linear-gradient(to top, #fef1eb88, #cadbff00),
      linear-gradient(
        78.12deg,
        #dce1f8 -0.05%,
        #fef1eb 49.36%,
        #e2e5f6 87.56%,
        #cadbff 99.5%
      );
    background-size: contain;
    background-position: center 5%;
  }
}

.main-title {
  font-size: 28px;
  line-height: 1.2em;
  font-weight: 600;
  @media (min-width: #{map-get($breakpoints, "md")}px) {
    font-size: 36px;
  }
  @media (min-width: #{map-get($breakpoints, "lg")}px) and (orientation: portrait) {
    font-size: 42px;
  }
  @media (min-width: #{map-get($breakpoints, "xl")}px) {
    line-height: 1.4em;
    font-size: 48px;
  }
}

.section {
  padding-top: 80px;
  padding-bottom: 110px;
}

.section-title {
  font-size: 35px;
  margin-bottom: 1.8em;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-align: center;

  span {
    display: inline-block;
    padding-bottom: 0.25em;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      background-color: #1f87ff;
      border-radius: 10px;
    }
  }
}

.statictics-title {
  font-size: 30px;
  line-height: 1em;
  font-weight: 600;
  margin-bottom: 8px;
  @media (min-width: #{map-get($breakpoints, "xl")}px) {
    font-size: 40px;
  }
}

.text-primary {
  color: #1f87ff;
}

.text-default {
  color: #000;
}

.text-secondary {
  color: #878787;
}

.social {
  transform: translate(12px, 4px);
  animation: soar 4s ease-in-out infinite;
}
.social:nth-child(1) {
  animation-delay: 1s;
}
.social:nth-child(2) {
  animation-delay: 0.75s;
}
.social:nth-child(3) {
  animation-delay: 0.5s;
}
.social:nth-child(4) {
  animation-delay: 0.25s;
}
.social:nth-child(5) {
  animation-delay: 0s;
}
.social:nth-child(6) {
  animation-delay: -0.25s;
}
.social:nth-child(7) {
  animation-delay: -0.5s;
}
.social:nth-child(8) {
  animation-delay: -0.75s;
}
.social:nth-child(9) {
  animation-delay: -1s;
}
@keyframes soar {
  0%,
  100% {
    transform: translate(12px, 4px) scale(0.99);
  }
  50% {
    transform: translate(0) scale(1);
  }
}

circle {
  opacity: 0.3;
  animation: circle infinite alternate 1.8s;

  &:nth-child(3n + 1) {
    animation-delay: 0.6s;
  }
  &:nth-child(3n + 2) {
    animation-delay: 1.2s;
  }
}

@keyframes circle {
  to {
    opacity: 0.75;
  }
}
</style>
