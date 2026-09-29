import type { RepoDetail } from '~~/types/github'

// GET /api/repo/:owner/:name  ->  對應 GitHub GET /repos/{owner}/{repo}
export default defineEventHandler(async (event): Promise<RepoDetail> => {
  const owner = getRouterParam(event, 'owner')
  const name = getRouterParam(event, 'name')

  if (!owner || !name) {
    throw createError({ statusCode: 400, statusMessage: '缺少 owner 或 repo 名稱' })
  }

  try {
    return await githubFetch<RepoDetail>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    )
  } catch (e: any) {
    const statusCode = e?.statusCode || e?.response?.status || 502
    throw createError({
      statusCode,
      statusMessage: statusCode === 404 ? '找不到這個 repo' : (e?.data?.message || '讀取 repo 失敗'),
    })
  }
})
