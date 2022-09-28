<template>
  <ui-container>
    <ui-table
      :headers="[
        { text: 'Кол-во токенов', value: 'amount' },
        { text: 'Сумма', value: 'summ' },
        { text: 'Дата', value: 'date' },
        { text: 'Назначение', value: 'title' },
      ]"
    ></ui-table>
  </ui-container>
</template>