<template>
  <div>
    <Header />

    <section>
      <ui-container>
        <ui-grid-row spacing="md">
          <ui-grid-col :cols="12" :lg="4"> <ui-card> 1 </ui-card></ui-grid-col>
          <ui-grid-col :cols="12" :lg="8"> <ui-card> 2 </ui-card></ui-grid-col>

          <ui-grid-col :cols="12" :lg="8"> <ui-card> 2 </ui-card></ui-grid-col>
          <ui-grid-col :cols="12" :lg="4"> <ui-card> 1 </ui-card></ui-grid-col>

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
          <ui-grid-col :cols="12" :lg="4"> </ui-grid-col>
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
</style>
