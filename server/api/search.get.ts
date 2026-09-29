import type { GitHubSearchResponse } from '~~/types/github'

// GET /api/search?q=vue&page=1
// 對 GitHub 的呼叫全部在 server 端完成:token 不外洩、client 也不會直接吃到 GitHub 的 CORS / rate limit。
export default defineEventHandler(async (event): Promise<GitHubSearchResponse> => {
  const { q = '', page = '1', per_page = '20' } = getQuery(event) as Record<string, string>
  const keyword = q.trim()

  // 沒有關鍵字就別打 API,直接回空結果
  if (!keyword) {
    return { total_count: 0, incomplete_results: false, items: [] }
  }

  try {
    return await githubFetch<GitHubSearchResponse>('/search/repositories', {
      query: { q: keyword, sort: 'stars', order: 'desc', per_page, page },
    })
  } catch (e: any) {
    // 把 GitHub 的錯誤(常見是 403 rate limit)轉成 Nuxt 的 error,前端 useFetch 的 error 會接到
    throw createError({
      statusCode: e?.statusCode || e?.response?.status || 502,
      statusMessage: e?.data?.message || 'GitHub 搜尋失敗',
    })
  }
})
