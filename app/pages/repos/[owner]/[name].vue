<script setup lang="ts">
import type { RepoDetail } from '~~/types/github'

const route = useRoute()
const owner = route.params.owner as string
const name = route.params.name as string

// 動態路由 /repos/[owner]/[name] -> 打自家 /api/repo/:owner/:name(server 再轉 GitHub)
const { data: repo, pending, error } = await useFetch<RepoDetail>(
  `/api/repo/${owner}/${name}`,
)

// 讓分頁標題跟著 repo 走
useHead({
  title: computed(() => (repo.value ? `${repo.value.full_name} · Nuxt GitHub Search` : 'Loading…')),
})

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <NuxtLink to="/" class="back">← 回搜尋</NuxtLink>

    <p v-if="pending" class="state">載入中…</p>

    <div v-else-if="error" class="state state--error">
      <p>{{ error.statusMessage || '讀取失敗' }}</p>
      <NuxtLink to="/" class="link">回首頁</NuxtLink>
    </div>

    <article v-else-if="repo" class="detail">
      <header class="detail-head">
        <img :src="repo.owner.avatar_url" :alt="repo.owner.login" class="avatar-lg" width="56" height="56" />
        <div>
          <h1 class="detail-name">{{ repo.full_name }}</h1>
          <a :href="repo.html_url" target="_blank" rel="noopener" class="link">在 GitHub 上開啟 ↗</a>
        </div>
      </header>

      <p v-if="repo.description" class="detail-desc">{{ repo.description }}</p>

      <ul v-if="repo.topics?.length" class="topics">
        <li v-for="topic in repo.topics" :key="topic" class="topic">{{ topic }}</li>
      </ul>

      <div class="stats">
        <div class="stat"><span class="stat-num">{{ formatNumber(repo.stargazers_count) }}</span><span class="stat-label">Stars</span></div>
        <div class="stat"><span class="stat-num">{{ formatNumber(repo.forks_count) }}</span><span class="stat-label">Forks</span></div>
        <div class="stat"><span class="stat-num">{{ formatNumber(repo.watchers_count) }}</span><span class="stat-label">Watchers</span></div>
        <div class="stat"><span class="stat-num">{{ formatNumber(repo.open_issues_count) }}</span><span class="stat-label">Open Issues</span></div>
      </div>

      <dl class="facts">
        <div v-if="repo.language" class="fact"><dt>主要語言</dt><dd>{{ repo.language }}</dd></div>
        <div class="fact"><dt>預設分支</dt><dd>{{ repo.default_branch }}</dd></div>
        <div v-if="repo.license" class="fact"><dt>授權</dt><dd>{{ repo.license.name }}</dd></div>
        <div class="fact"><dt>建立於</dt><dd>{{ formatDate(repo.created_at) }}</dd></div>
        <div class="fact"><dt>最後更新</dt><dd>{{ formatDate(repo.pushed_at) }}</dd></div>
        <div v-if="repo.homepage" class="fact">
          <dt>官網</dt>
          <dd><a :href="repo.homepage" target="_blank" rel="noopener" class="link">{{ repo.homepage }}</a></dd>
        </div>
      </dl>
    </article>
  </div>
</template>

<style scoped>
.back { color: var(--muted); font-size: 14px; display: inline-block; margin-bottom: 20px; }
.back:hover { color: var(--accent); }

.state { color: var(--muted); padding: 24px 0; }
.state--error { color: #f85149; }
.link { color: var(--accent); }

.detail-head { display: flex; align-items: center; gap: 16px; }
.avatar-lg { border-radius: 12px; }
.detail-name { font-size: 24px; margin: 0 0 4px; word-break: break-all; }

.detail-desc { color: var(--text); margin: 20px 0 0; }

.topics { list-style: none; padding: 0; margin: 16px 0 0; display: flex; flex-wrap: wrap; gap: 8px; }
.topic {
  background: rgba(56, 139, 253, 0.12);
  color: var(--accent);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 13px;
}

.stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 24px 0; }
.stat {
  flex: 1;
  min-width: 120px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
}
.stat-num { display: block; font-size: 22px; font-weight: 600; }
.stat-label { color: var(--muted); font-size: 13px; }

.facts {
  margin: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.fact {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border);
}
.fact:last-child { border-bottom: none; }
.fact dt { color: var(--muted); font-size: 14px; }
.fact dd { margin: 0; font-size: 14px; text-align: right; word-break: break-all; }
</style>
