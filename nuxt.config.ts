import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig(nuxtApp => ({
    buildModules: ['@pinia/nuxt'],
    head: {
        scripts: [
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossorigin: true,
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
            }]
    },
}))
