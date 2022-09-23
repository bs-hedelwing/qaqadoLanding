import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    dailyTransactions: null,
    addressList: null,
  }),
  actions: {
    async getDailyTranaactions() {
      this.dailyTransactions = await useFetch(
        "https://explorer.sbercoin.com/api/stats/daily-transactions"
      );
    },

    async getAddressAmount() {
      this.addressList = await useFetch(
        "https://explorer.sbercoin.com/api/misc/rich-list?page=0&pageSize=10"
      );
    },
  },
});
