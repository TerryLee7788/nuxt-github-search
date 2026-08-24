<script setup lang="ts">
import type { RepoSummary } from '~~/types/github'

const props = defineProps<{ repo: RepoSummary }>()

const favorites = useFavoritesStore()

const repoLink = computed(() => `/repos/${props.repo.owner.login}/${props.repo.name}`)
</script>

<template>
  <div class="relative rounded-app border border-border bg-surface px-4.5 py-4 transition-colors duration-150 hover:border-accent hover:bg-surface-hover">
    <button
      type="button"
      class="absolute right-3 top-3 text-lg leading-none"
      :class="favorites.isFavorite(repo.id) ? 'text-star' : 'text-muted hover:text-star'"
      :aria-label="favorites.isFavorite(repo.id) ? '取消收藏' : '加入收藏'"
      @click="favorites.toggle(repo)"
    >
      {{ favorites.isFavorite(repo.id) ? '★' : '☆' }}
    </button>

    <NuxtLink :to="repoLink" class="block pr-8">
      <div class="flex items-center gap-2">
        <img :src="repo.owner.avatar_url" :alt="repo.owner.login" class="rounded-full" width="24" height="24" />
        <span class="font-semibold text-accent">{{ repo.full_name }}</span>
      </div>

      <p v-if="repo.description" class="mt-2 text-sm text-text">{{ repo.description }}</p>

      <div class="mt-3 flex gap-4">
        <span v-if="repo.language" class="text-[13px] text-muted">{{ repo.language }}</span>
        <span class="text-[13px] text-muted">★ {{ formatNumber(repo.stargazers_count) }}</span>
        <span class="text-[13px] text-muted">⑂ {{ formatNumber(repo.forks_count) }}</span>
      </div>
    </NuxtLink>
  </div>
</template>
