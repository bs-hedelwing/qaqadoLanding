import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', {
    state: () => ({
        filtersList: ['youtube', 'twitch'],
    }),
    actions: {},
})
