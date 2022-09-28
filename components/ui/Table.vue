<template>
  <div class="table">
    <table>
      <thead>
        <tr>
          <th v-for="(header, i) in headers" :key="i">
            <slot name="header"> {{ header.text }} </slot>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, i) in itemsPortion" :key="i">
          <td v-for="(value, key) in item" :key="key">{{ value }}</td>
        </tr>
      </tbody>
    </table>
    <div class="table__navigation">
      <div class="table__navigation-item">
        <ui-button
          dense
          color="secondary"
          :disabled="currentPage === 1"
          @click="onClick(currentPage - 1)"
          >Назад</ui-button
        >
      </div>
      <div
        class="table__navigation-item"
        v-for="(item, i) in pagination"
        :key="i"
      >
        <div v-if="item === '...'">...</div>
        <ui-button
          v-else
          dense
          @click="onClick(item)"
          :color="item === currentPage ? 'primary' : 'secondary'"
          >{{ item }}</ui-button
        >
      </div>
      <div class="table__navigation-item">
        <ui-button
          dense
          @click="onClick(currentPage + 1)"
          color="secondary"
          :disabled="currentPage === totalPages"
          >Вперёд</ui-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const range = (from: number, to: number): number[] => {
  const range = [];

  from = from > 1 ? from : 2;

  for (let i = from; i <= to; i++) {
    range.push(i);
  }

  return range;
};
const { headers, items } = defineProps<{
  headers: { text: string; value: string }[];
  items: {
    [key: string]: string | number;
  }[];
}>();

const nearLength = 1;

const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(items.length / 3));

const nearPages = computed(() =>
  range(
    Math.min(
      totalPages.value - nearLength * 2,
      Math.max(currentPage.value - nearLength, 2)
    ),
    Math.min(
      totalPages.value,
      Math.max(
        1 + nearLength * 2,
        Math.min(currentPage.value + nearLength, totalPages.value - 1)
      )
    )
  )
);

const pagination = computed(() =>
  [
    1,
    nearPages.value[0] > 2 && "...",
    ...nearPages.value,
    nearPages.value[nearPages.value.length - 1] < totalPages.value - 1 && "...",
    totalPages.value > 2 + nearLength && totalPages.value,
  ].filter((item) => item)
);

const onClick = (item) => {
  currentPage.value = item;
};

const itemsPortion = computed(() =>
  items.slice((currentPage.value - 1) * 3, currentPage.value * 3)
);
</script>
    

<style lang="scss">
@import "~/assets/variables.scss";

.table {
  table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    font-size: 18px;
    & th {
      font-weight: 500;
      color: $primary;
    }
    & th {
      padding: 8px 8px;
    }
    & td {
      padding: 16px 8px;
    }
    & tr:not(:last-child) td,
    & th {
      border-bottom: thin solid #c4c4c4;
    }
  }
  &__navigation {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    &-item:not(:first-of-type) {
      margin-left: 8px;
    }
  }
}
</style>