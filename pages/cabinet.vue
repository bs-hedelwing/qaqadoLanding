<template>
  <div>
    <Header />

    <section>
      <ui-container>
        <ui-grid-row spacing="md">
          <ui-grid-col :cols="12" :lg="4">
            <ui-card>
              <div style="display: flex">
                <div class="icon-container">
                  <div class="icon">
                    <icons-logo />
                  </div>
                </div>

                <div>
                  <h5 style="font-size: 20px; margin-bottom: 1.5em">
                    Token balance
                  </h5>

                  <p>120 000 000 QQD</p>
                </div>
              </div>
            </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="8"> <ui-card> 2 </ui-card></ui-grid-col>

          <ui-grid-col :cols="12" :lg="8">
            <ui-card>
              <h5 style="font-size: 20px; margin-bottom: 1.5em">
                График ончейн активности владельцев QQD
              </h5>

              <chart
                :chartData="
                  (dashboardStore.dailyTransactions &&
                    dashboardStore.dailyTransactions.data) ||
                  null
                "
                :loading="false"
              ></chart>
            </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="4">
            <ui-card>
              <h5 style="font-size: 20px; margin-bottom: 1.5em">
                Прогресс токена
              </h5>
              <ui-slider :min="0"></ui-slider>

              <ui-button>Купить токен</ui-button>
            </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="8">
            <ui-card>
              <h5 style="font-size: 20px; margin-bottom: 1.5em">
                История транзакций
              </h5>
              <ui-table
                :headers="['Кол-во токенов', 'Сумма', 'Дата', 'Назначение']"
              >
                <tbody>
                  <tr>
                    <td>Кол-во токенов</td>
                    <td>Сумма</td>
                    <td>Дата</td>
                    <td>Назначение</td>
                  </tr>
                  <tr>
                    <td>Кол-во токенов</td>
                    <td>Сумма</td>
                    <td>Дата</td>
                    <td>Назначение</td>
                  </tr>
                  <tr>
                    <td>Кол-во токенов</td>
                    <td>Сумма</td>
                    <td>Дата</td>
                    <td>Назначение</td>
                  </tr>
                </tbody>
              </ui-table>
            </ui-card>
          </ui-grid-col>
          <ui-grid-col :cols="12" :lg="4">
            <ui-card>
              <h5 style="font-size: 20px; margin-bottom: 1.5em">
                Калькулятор токенов
              </h5>
            </ui-card></ui-grid-col
          >
        </ui-grid-row>
      </ui-container>
    </section>
  </div>
</template>

<script>
import { useDashboardStore } from "~/stores/dashboard";
import Chart from "~~/components/Chart.vue";

export default {
  async setup() {
    const dashboardStore = useDashboardStore();

    dashboardStore.getDailyTranaactions();

    return { dashboardStore };
  },

  components: {
    Chart,
  },

  data: () => ({
    chart: null,
  }),
};
</script>

<style lang="scss">
body {
  background-image: linear-gradient(
    80.15deg,
    #dce1f8 0%,
    #fbefed 52.47%,
    #cadbff 100%
  );
}

.token-logo {
  border: 4px solid #deebff;
  border-radius: 50%;
  &__content {
    background: #deebff;
    border-radius: inherit;
  }
}
</style>
