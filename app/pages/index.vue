<script setup lang="ts">
import type { GitHubSearchResponse, RepoSummary } from '~~/types/github'

const route = useRoute()
const router = useRouter()

// 以網址上的 ?q= 作為「唯一真實來源」:可分享、可用瀏覽器上一頁/下一頁、SSR 首屏就帶結果
const q = computed(() => (route.query.q as string) || '')

// input 綁在本地 ref,打字時 debounce 後才更新網址,避免每個按鍵都打 API
const keyword = ref(q.value)

// q 被外部改變時(例如點回首頁的 NuxtLink、瀏覽器上一頁/下一頁)同步回 input;
// 元件實例在同一頁面內導覽時會被重用,不會重新執行 setup,keyword 不會自動跟著清空
watch(q, (newQ) => {
  keyword.value = newQ
})

// q 變動時 useFetch 會自動重抓; server 端(SSR)先抓好放進 payload, hydration 不重抓
const { data, pending, error } = await useFetch<GitHubSearchResponse>('/api/search', {
  query: { q },
})

const repos = computed<RepoSummary[]>(() => data.value?.items ?? [])
const totalCount = computed(() => data.value?.total_count ?? 0)

let timer: ReturnType<typeof setTimeout>
function onInput() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.push({ query: keyword.value.trim() ? { q: keyword.value.trim() } : {} })
  }, 400)
}

function quickSearch(term: string) {
  keyword.value = term
  router.push({ query: { q: term } })
}
</script>

<template>
  <div>
    <h1 class="mb-5 text-2xl">搜尋 GitHub Repository</h1>

    <div>
      <input
        v-model="keyword"
        type="search"
        placeholder="輸入關鍵字,例如 nuxt、vue、tailwind…"
        class="w-full rounded-app border border-border bg-surface px-4 py-3 text-base text-text outline-none focus:border-accent"
        @input="onInput"
        @keyup.enter="onInput"
      />
    </div>

    <div class="my-3.5 mb-6 flex flex-wrap items-center gap-2">
      <span class="text-[13px] text-muted">熱門:</span>
      <button
        v-for="t in ['nuxt', 'vue', 'react', 'typescript']"
        :key="t"
        class="cursor-pointer rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-muted hover:border-accent hover:text-text"
        @click="quickSearch(t)"
      >
        {{ t }}
      </button>
    </div>

    <!-- 載入中 -->
    <p v-if="pending" class="py-6 text-muted">搜尋中…</p>

    <!-- 錯誤(常見:GitHub rate limit 403) -->
    <p v-else-if="error" class="py-6 text-danger">
      {{ error.statusMessage || '搜尋發生錯誤' }}
    </p>

    <!-- 尚未輸入 -->
    <p v-else-if="!q" class="py-6 text-muted">輸入上方關鍵字開始搜尋。</p>

    <!-- 有關鍵字但沒結果 -->
    <p v-else-if="repos.length === 0" class="py-6 text-muted">找不到符合「{{ q }}」的 repo。</p>

    <!-- 結果列表 -->
    <template v-else>
      <p class="mb-3 text-sm text-muted">
        「{{ q }}」約 {{ formatNumber(totalCount) }} 筆結果(依 star 排序)
      </p>

      <ul class="m-0 flex list-none flex-col gap-3 p-0">
        <li v-for="repo in repos" :key="repo.id">
          <RepoCard :repo="repo" />
        </li>
      </ul>
    </template>
  </div>
</template>
