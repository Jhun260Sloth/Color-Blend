// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@nuxt/ui'],
  colorMode: {
    preference: 'dark'
  },
  ui: {
    // notifications: {
    //   // Show toasts at the top right of the screen
    //   position: 'top-0 bottom-[unset]'
    // }
  }
})