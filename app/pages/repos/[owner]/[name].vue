<script setup lang="ts">
import type { RepoDetail } from '~~/types/github'

const route = useRoute()
const owner = route.params.owner as string
const name = route.params.name as string
const favorites = useFavoritesStore()

// 動態路由 /repos/[owner]/[name] -> 打自家 /api/repo/:owner/:name(server 再轉 GitHub)
const { data: repo, pending, error } = await useFetch<RepoDetail>(
  `/api/repo/${owner}/${name}`,
)

// 讓分頁標題跟著 repo 走
useHead({
  title: computed(() => (repo.value ? `${repo.value.full_name} · Nuxt GitHub Search` : 'Loading…')),
})
</script>

<template>
  <div>
    <NuxtLink to="/" class="mb-5 inline-block text-sm text-muted hover:text-accent">← 回搜尋</NuxtLink>

    <p v-if="pending" class="py-6 text-muted">載入中…</p>

    <div v-else-if="error" class="py-6 text-danger">
      <p>{{ error.statusMessage || '讀取失敗' }}</p>
      <NuxtLink to="/" class="text-accent">回首頁</NuxtLink>
    </div>

    <article v-else-if="repo">
      <header class="flex items-center gap-4">
        <img :src="repo.owner.avatar_url" :alt="repo.owner.login" class="rounded-app" width="56" height="56" />
        <div class="flex-1">
          <h1 class="mb-1 text-2xl break-all">{{ repo.full_name }}</h1>
          <a :href="repo.html_url" target="_blank" rel="noopener" class="text-accent">在 GitHub 上開啟 ↗</a>
        </div>
        <button
          type="button"
          class="shrink-0 text-2xl leading-none"
          :class="favorites.isFavorite(repo.id) ? 'text-star' : 'text-muted hover:text-star'"
          :aria-label="favorites.isFavorite(repo.id) ? '取消收藏' : '加入收藏'"
          @click="favorites.toggle(repo)"
        >
          {{ favorites.isFavorite(repo.id) ? '★' : '☆' }}
        </button>
      </header>

      <p v-if="repo.description" class="mt-5 text-text">{{ repo.description }}</p>

      <ul v-if="repo.topics?.length" class="mt-4 flex list-none flex-wrap gap-2 p-0">
        <li
          v-for="topic in repo.topics"
          :key="topic"
          class="rounded-full bg-accent/12 px-3 py-0.5 text-[13px] text-accent"
        >
          {{ topic }}
        </li>
      </ul>

      <div class="my-6 flex flex-wrap gap-3">
        <div class="min-w-[120px] flex-1 rounded-app border border-border bg-surface p-4 text-center">
          <span class="block text-[22px] font-semibold">{{ formatNumber(repo.stargazers_count) }}</span>
          <span class="text-[13px] text-muted">Stars</span>
        </div>
        <div class="min-w-[120px] flex-1 rounded-app border border-border bg-surface p-4 text-center">
          <span class="block text-[22px] font-semibold">{{ formatNumber(repo.forks_count) }}</span>
          <span class="text-[13px] text-muted">Forks</span>
        </div>
        <div class="min-w-[120px] flex-1 rounded-app border border-border bg-surface p-4 text-center">
          <span class="block text-[22px] font-semibold">{{ formatNumber(repo.watchers_count) }}</span>
          <span class="text-[13px] text-muted">Watchers</span>
        </div>
        <div class="min-w-[120px] flex-1 rounded-app border border-border bg-surface p-4 text-center">
          <span class="block text-[22px] font-semibold">{{ formatNumber(repo.open_issues_count) }}</span>
          <span class="text-[13px] text-muted">Open Issues</span>
        </div>
      </div>

      <dl class="overflow-hidden rounded-app border border-border bg-surface">
        <div v-if="repo.language" class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">主要語言</dt>
          <dd class="m-0 text-right text-sm break-all">{{ repo.language }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">預設分支</dt>
          <dd class="m-0 text-right text-sm break-all">{{ repo.default_branch }}</dd>
        </div>
        <div v-if="repo.license" class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">授權</dt>
          <dd class="m-0 text-right text-sm break-all">{{ repo.license.name }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">建立於</dt>
          <dd class="m-0 text-right text-sm break-all">{{ formatDate(repo.created_at) }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">最後更新</dt>
          <dd class="m-0 text-right text-sm break-all">{{ formatDate(repo.pushed_at) }}</dd>
        </div>
        <div v-if="repo.homepage" class="flex justify-between gap-4 border-b border-border px-4.5 py-3 last:border-b-0">
          <dt class="text-sm text-muted">官網</dt>
          <dd class="m-0 text-right text-sm break-all">
            <a :href="repo.homepage" target="_blank" rel="noopener" class="text-accent">{{ repo.homepage }}</a>
          </dd>
        </div>
      </dl>
    </article>
  </div>
</template>
