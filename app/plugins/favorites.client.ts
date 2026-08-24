export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    useFavoritesStore().hydrate()
  })
})
