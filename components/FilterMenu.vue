<template>
  <div>
    {{ filtersList }}
  </div>
</template>

<script setup>
import { useTestStore } from "~/stores/test";

const filtersStore = useTestStore();
const filtersList = filtersStore.filtersList;
</script>