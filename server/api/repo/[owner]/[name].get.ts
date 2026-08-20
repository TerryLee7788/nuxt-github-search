import type { RepoDetail } from '~/types/github'

// GET /api/repo/:owner/:name  ->  對應 GitHub GET /repos/{owner}/{repo}
export default defineEventHandler(async (event): Promise<RepoDetail> => {
  const owner = getRouterParam(event, 'owner')
  const name = getRouterParam(event, 'name')

  if (!owner || !name) {
    throw createError({ statusCode: 400, statusMessage: '缺少 owner 或 repo 名稱' })
  }

  const config = useRuntimeConfig()
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`

  try {
    return await $fetch<RepoDetail>(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
      { headers },
    )
  } catch (e: any) {
    const statusCode = e?.statusCode || e?.response?.status || 502
    throw createError({
      statusCode,
      statusMessage: statusCode === 404 ? '找不到這個 repo' : (e?.data?.message || '讀取 repo 失敗'),
    })
  }
})
