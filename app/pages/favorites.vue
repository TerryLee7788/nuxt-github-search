<script setup lang="ts">
const favorites = useFavoritesStore()

useHead({ title: '我的收藏 · Nuxt GitHub Search' })
</script>

<template>
  <div>
    <h1 class="mb-5 text-2xl">我的收藏</h1>

    <p v-if="favorites.repos.length === 0" class="py-6 text-muted">
      還沒有收藏的 repo,去搜尋頁點 ☆ 加入收藏吧。
    </p>

    <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
      <li v-for="repo in favorites.repos" :key="repo.id">
        <RepoCard :repo="repo" />
      </li>
    </ul>
  </div>
</template>
