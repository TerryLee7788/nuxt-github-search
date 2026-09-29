import type { NitroFetchOptions } from 'nitropack'

// server/utils 底下的東西 Nitro 會自動 import,兩支 /api handler 直接呼叫 githubFetch 即可。

const BASE_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

// 同一個 server 程序內只警告一次,避免每個請求都洗一次 log。
let warnedBadToken = false

/**
 * 呼叫 api.github.com,有設定 GITHUB_TOKEN 就帶上。
 *
 * token 被 GitHub 拒絕(401 Bad credentials:過期、被撤銷、被刪除)時,自動改用
 * 未授權請求重試一次。GITHUB_TOKEN 本來就是選填,只是用來拉高 rate limit——
 * 一把失效的 token 不該讓整個網站掛掉,頂多退回未授權的 rate limit。
 */
export async function githubFetch<T>(
  path: string,
  options: Pick<NitroFetchOptions<string>, 'query'> = {},
): Promise<T> {
  const { githubToken } = useRuntimeConfig()
  const url = `https://api.github.com${path}`

  if (!githubToken) {
    return await $fetch<T>(url, { ...options, headers: BASE_HEADERS })
  }

  try {
    return await $fetch<T>(url, {
      ...options,
      headers: { ...BASE_HEADERS, Authorization: `Bearer ${githubToken}` },
    })
  } catch (e: any) {
    const status = e?.statusCode || e?.response?.status
    if (status !== 401) throw e

    if (!warnedBadToken) {
      warnedBadToken = true
      console.warn(
        '[githubFetch] GITHUB_TOKEN 被 GitHub 拒絕(401 Bad credentials),改用未授權請求。'
        + '請到 GitHub 重新產生 token 並更新環境變數。',
      )
    }
    return await $fetch<T>(url, { ...options, headers: BASE_HEADERS })
  }
}
