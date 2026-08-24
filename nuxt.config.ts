import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // 只在 server 端可讀,不會被打包進 client bundle。
    // 用 .env 的 GITHUB_TOKEN 覆寫;有 token 時 rate limit 從 60/hr 拉到 5000/hr。
    githubToken: process.env.GITHUB_TOKEN || '',
  },

  app: {
    head: {
      title: 'Nuxt GitHub Search',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '用 Nuxt 4 + GitHub API 搜尋 repo 的範例' },
      ],
    },
  },
})
