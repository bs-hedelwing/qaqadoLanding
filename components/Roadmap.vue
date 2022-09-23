<template>
  <section class="section" style="background: #fafcff">
    <ui-container>
      <h2 class="section-title">
        <span> Roadmap </span>
      </h2>
      <div class="roadmap">
        <div class="roadmap-grid" style="padding: 0 36px">
          <div
            class="roadmap-grid__item"
            :cols="4"
            v-for="(goal, i) in goals"
            :key="i"
            style="min-height: 395px; text-align: center"
          >
            <h5 class="roadmap__goal-title" style="margin: 0">
              <span>{{ goal.date }}</span>
            </h5>
            <div class="checkbox"></div>
            <ui-card primary style="max-width: 300px; display: inline-block">
              <p>{{ goal.mission }}</p>
            </ui-card>
          </div>
        </div>
      </div>
    </ui-container>
  </section>
</template>

<script setup lang="ts">
const goals = [
  {
    date: "May 2013",
    mission:
      "Формирование концепции, проведение опросов, формирование команды, подготовка документации",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Старт разработки первой версии QAQADO",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Старт продаж токенов",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Старт разработки второй версии QAQADO",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Релиз первой версии QAQADO",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Старт разработки второй версии QAQADO",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Релиз первой версии QAQADO",
    completed: true,
  },
  {
    date: "May 2013",
    mission: "Релиз первой версии QAQADO",
    completed: true,
  },
];
</script>

<style scoped lang="scss">
.roadmap {
  background-image: url("/roadmap.svg");
  background-repeat: no-repeat;
  background-size: contain;
}

.checkbox {
  width: 52px;
  height: 52px;
  background: #fafcff;
  border-radius: 50%;
  border: 2px solid #96bdea;
  margin-top: 32px;
  margin-bottom: 24px;
  margin-left: auto;
  margin-right: auto;
}

.roadmap__goal-title {
  font-size: 24px;
  text-align: center;
  span {
    display: inline-block;
    position: relative;

    &:after {
      content: "";
      position: absolute;
      bottom: -16px;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #1f87ff;
      border-radius: 10px;
    }
  }
}

.roadmap-grid {
  display: grid;
  grid-template-rows: repeat(3, 280px);
}

@media (min-width: 767px) {
  .roadmap-grid {
    grid-template-columns: repeat(12, 1fr);
  }
  .roadmap-grid__item:nth-child(1) {
    grid-column: 1 / 7;
    grid-row: 1 / 2;
  }

  .roadmap-grid__item:nth-child(2) {
    grid-column: 7 / 13;
    grid-row: 1 / 2;
  }

  .roadmap-grid__item:nth-child(3) {
    grid-column: 1 / 7;
    grid-row: 2 / 3;
  }

  .roadmap-grid__item:nth-child(4) {
    grid-column: 7 / 13;
    grid-row: 2 / 3;
  }

  .roadmap-grid__item:nth-child(5) {
    grid-column: 1 / 7;
    grid-row: 3 / 4;
  }

  .roadmap-grid__item:nth-child(6) {
    grid-column: 7 / 13;
    grid-row: 3 / 4;
  }

  .roadmap-grid__item:nth-child(7) {
    grid-column: 1 / 7;
    grid-row: 4 / 5;
  }

  .roadmap-grid__item:nth-child(8) {
    grid-column: 7 / 13;
    grid-row: 4 / 5;
  }
}

@media (min-width: 1377px) {
  .roadmap-grid {
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(3, 395px);
  }
  .roadmap-grid__item:nth-child(1) {
    grid-column: 1 / 5;
    grid-row: 1 / 2;
  }

  .roadmap-grid__item:nth-child(2) {
    grid-column: 5 / 9;
    grid-row: 1 / 2;
  }

  .roadmap-grid__item:nth-child(3) {
    grid-column: 9 / 13;
    grid-row: 1 / 2;
  }

  .roadmap-grid__item:nth-child(4) {
    grid-column: 1 / 7;
    grid-row: 2 / 3;
  }

  .roadmap-grid__item:nth-child(5) {
    grid-column: 7 / 13;
    grid-row: 2 / 3;
  }

  .roadmap-grid__item:nth-child(6) {
    grid-column: 1 / 5;
    grid-row: 3 / 4;
  }

  .roadmap-grid__item:nth-child(7) {
    grid-column: 5 / 9;
    grid-row: 3 / 4;
  }

  .roadmap-grid__item:nth-child(8) {
    grid-column: 9 / 13;
    grid-row: 3 / 4;
  }
}

.roadmap-grid__item {
  align-items: center;
}
</style>
