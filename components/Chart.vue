<template>
  <div>
    <div ref="chartNode"></div>
    <div v-if="loading">Загрузка</div>
  </div>
</template>

<script setup lang="ts">
import Chart from "~~/utils/Chart";
import * as d3 from "d3";

const { chartData, loading } = defineProps<{
  chartData: [] | null;
  loading: boolean;
}>();

const data = ref<null | any[]>(chartData);

const chartNode = ref(null);

const state = reactive({ chart: null });

onMounted(() => {
  state.chart = new Chart(chartNode.value);

  if (data.value?.length) {
    const data = chartData.map((t: any) => ({
      xpoint: d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")(t.time),
      ypoint: t.transactionCount,
    }));

    state.chart.update(data.splice(-7));
  }
});

watch(data, (data) => {
  if (data?.length) {
    const data = chartData.map((t: any) => ({
      xpoint: d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z")(t.time),
      ypoint: t.transactionCount,
    }));

    state.chart.update(data.splice(-7));
  }
});
</script>


<style lang="scss">
.chart-legend text {
    font-size: 10px;
}
</style>