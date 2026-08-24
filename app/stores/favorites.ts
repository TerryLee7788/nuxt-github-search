import type { RepoSummary } from '~~/types/github'

const STORAGE_KEY = 'gh-search:favorites'

export const useFavoritesStore = defineStore('favorites', () => {
  const repos = ref<RepoSummary[]>([])

  const ids = computed(() => new Set(repos.value.map((r) => r.id)))

  function isFavorite(id: number) {
    return ids.value.has(id)
  }

  function toggle(repo: RepoSummary) {
    const index = repos.value.findIndex((r) => r.id === repo.id)
    if (index === -1) repos.value.push(repo)
    else repos.value.splice(index, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repos.value))
  }

  // 只在 client mount 後(app:mounted plugin)呼叫,避免 SSR 首屏跟 client 端 localStorage 內容不一致造成 hydration mismatch
  function hydrate() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      repos.value = JSON.parse(raw)
    } catch {
      repos.value = []
    }
  }

  return { repos, isFavorite, toggle, hydrate }
})
