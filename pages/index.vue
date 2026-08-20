<script setup lang="ts">
import type { GitHubSearchResponse, RepoSummary } from '~/types/github'

const route = useRoute()
const router = useRouter()

// 以網址上的 ?q= 作為「唯一真實來源」:可分享、可用瀏覽器上一頁/下一頁、SSR 首屏就帶結果
const q = computed(() => (route.query.q as string) || '')

// input 綁在本地 ref,打字時 debounce 後才更新網址,避免每個按鍵都打 API
const keyword = ref(q.value)

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

function repoLink(repo: RepoSummary) {
  return `/repos/${repo.owner.login}/${repo.name}`
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<template>
  <div>
    <h1 class="title">搜尋 GitHub Repository</h1>

    <div class="search-box">
      <input
        v-model="keyword"
        type="search"
        placeholder="輸入關鍵字,例如 nuxt、vue、tailwind…"
        @input="onInput"
        @keyup.enter="onInput"
      />
    </div>

    <div class="chips">
      <span class="chips-label">熱門:</span>
      <button v-for="t in ['nuxt', 'vue', 'react', 'typescript']" :key="t" class="chip" @click="quickSearch(t)">
        {{ t }}
      </button>
    </div>

    <!-- 載入中 -->
    <p v-if="pending" class="state">搜尋中…</p>

    <!-- 錯誤(常見:GitHub rate limit 403) -->
    <p v-else-if="error" class="state state--error">
      {{ error.statusMessage || '搜尋發生錯誤' }}
    </p>

    <!-- 尚未輸入 -->
    <p v-else-if="!q" class="state">輸入上方關鍵字開始搜尋。</p>

    <!-- 有關鍵字但沒結果 -->
    <p v-else-if="repos.length === 0" class="state">找不到符合「{{ q }}」的 repo。</p>

    <!-- 結果列表 -->
    <template v-else>
      <p class="result-count">
        「{{ q }}」約 {{ formatNumber(totalCount) }} 筆結果(依 star 排序)
      </p>

      <ul class="repo-list">
        <li v-for="repo in repos" :key="repo.id">
          <NuxtLink :to="repoLink(repo)" class="repo-card">
            <div class="repo-head">
              <img :src="repo.owner.avatar_url" :alt="repo.owner.login" class="avatar" width="24" height="24" />
              <span class="repo-name">{{ repo.full_name }}</span>
            </div>

            <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>

            <div class="repo-meta">
              <span v-if="repo.language" class="meta-item">{{ repo.language }}</span>
              <span class="meta-item">★ {{ formatNumber(repo.stargazers_count) }}</span>
              <span class="meta-item">⑂ {{ formatNumber(repo.forks_count) }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.title { font-size: 24px; margin: 0 0 20px; }

.search-box input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  outline: none;
}
.search-box input:focus { border-color: var(--accent); }

.chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0 24px;
}
.chips-label { color: var(--muted); font-size: 13px; }
.chip {
  background: var(--surface);
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
}
.chip:hover { color: var(--text); border-color: var(--accent); }

.state { color: var(--muted); padding: 24px 0; }
.state--error { color: #f85149; }

.result-count { color: var(--muted); font-size: 14px; margin: 0 0 12px; }

.repo-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }

.repo-card {
  display: block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  transition: background 0.15s, border-color 0.15s;
}
.repo-card:hover { background: var(--surface-hover); border-color: var(--accent); }

.repo-head { display: flex; align-items: center; gap: 8px; }
.avatar { border-radius: 50%; }
.repo-name { color: var(--accent); font-weight: 600; }

.repo-desc { margin: 8px 0 0; color: var(--text); font-size: 14px; }

.repo-meta { display: flex; gap: 16px; margin-top: 12px; }
.meta-item { color: var(--muted); font-size: 13px; }
</style>
