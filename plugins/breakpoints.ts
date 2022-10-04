export default defineNuxtPlugin((nuxtApp) => {
    const isMobile = ref(false)
    nuxtApp.hook('app:mounted', () => {
        window.addEventListener("resize", () => {
            isMobile.value = innerWidth < 767

        })
    })
    nuxtApp.provide('isMobile', isMobile)
})