import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig((nuxtApp) => ({
  buildModules: ["@pinia/nuxt", "@nuxtjs/svg"],
  head: {
    scripts: [
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: true,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=swap",
      },
    ],
  },

  webpack: {
    optimization: {
      usedExports: true,
    },
  },

  css: ["~~/assets/main.scss"],
}));
