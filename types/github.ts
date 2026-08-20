export interface RepoOwner {
  login: string
  avatar_url: string
  html_url: string
}

/** search API 回傳的每個 item(欄位比詳細頁少) */
export interface RepoSummary {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  owner: RepoOwner
  updated_at: string
  topics?: string[]
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: RepoSummary[]
}

/** 單一 repo 詳細頁多帶的欄位 */
export interface RepoDetail extends RepoSummary {
  watchers_count: number
  open_issues_count: number
  subscribers_count?: number
  default_branch: string
  created_at: string
  pushed_at: string
  homepage: string | null
  license: { name: string; spdx_id: string } | null
  topics: string[]
}
