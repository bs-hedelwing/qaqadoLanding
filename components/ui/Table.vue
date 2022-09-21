<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="(header, i) in headers" :key="i">
          <slot name="header"> {{ header }} </slot>
        </th>
      </tr>
    </thead>

    <slot></slot>
  </table>
</template>

<script setup lang="ts">
const { headers } =
  defineProps<{ headers: { [key: string]: any }[] | string[] }>();
</script>
    

<style lang="scss">
@import "~/assets/variables.scss";

.table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  font-size: 18px;
  & th {
    font-weight: 500;;
    color: $primary;
  }
  & th {
    padding: 8px 8px;
  }
  & td {
    padding: 16px 8px;
  }
  & tr:not(:last-child) td, & th {
    border-bottom: thin solid #c4c4c4;
  }
}
</style>