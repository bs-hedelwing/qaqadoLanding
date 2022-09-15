import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    dailyTransactions: null,
  }),
  actions: {
    async getDailyTranaactions() {
      this.dailyTransactions = await useFetch(
        "https://explorer.sbercoin.com/api/stats/daily-transactions"
      );
    },
  },
});
