# Nuxt GitHub Search

用 Nuxt 4 + GitHub REST API 做的最小範例:首頁搜尋 repo、點進去看單一 repo 詳細頁。

## 執行

```bash
# 1. 安裝依賴
npm install        # 或 pnpm install / yarn

# 2.(可選)設定 GitHub token,拉高 rate limit
cp .env.example .env   # 再把 GITHUB_TOKEN 填進去

# 3. 開發模式
npm run dev
# 開 http://localhost:3000
```

## 目錄結構與對應職責

```
nuxt-github-search/
├── nuxt.config.ts                     # runtimeConfig 收 GITHUB_TOKEN(只在 server 端)
├── types/github.ts                    # GitHub API 回傳型別(app / server 共用,以 ~~/types 引用)
├── app/                               # Nuxt 4 srcDir(~ / @ 指向這裡)
│   ├── app.vue                        # 外框 + <NuxtPage/>(Tailwind utility class 撰寫樣式)
│   ├── assets/css/main.css            # Tailwind 進入點 + GitHub 暗色主題 @theme tokens
│   ├── components/RepoCard.vue        # 共用的 repo 卡片(搜尋結果 / 收藏清單共用)
│   ├── stores/favorites.ts            # Pinia store:收藏的 repo(持久化到 localStorage)
│   ├── plugins/favorites.client.ts    # client-only,app mounted 後才讀 localStorage 水合 store
│   ├── utils/format.ts                # formatNumber / formatDate,auto-import
│   └── pages/
│       ├── index.vue                  # 搜尋列表頁(/)
│       ├── favorites.vue              # 我的收藏(/favorites)
│       └── repos/[owner]/[name].vue   # 詳細頁(/repos/:owner/:name)
└── server/api/                        # 留在專案根目錄(~~ / @@ 指向根目錄)
    ├── search.get.ts                  # 代理 GitHub 搜尋
    └── repo/[owner]/[name].get.ts     # 代理單一 repo
```

## 為什麼中間隔一層 `server/api`?

前端不直接打 `api.github.com`,而是打自家的 `server/api/*`,原因有三:

1. **Token 不外洩** —— `GITHUB_TOKEN` 透過 `runtimeConfig` 只存在於 server,永遠不會被打包進 client bundle。
2. **避開 rate limit / CORS** —— 未授權的呼叫限制很低,集中在 server 端加 token 後可拉到 5000/hr。
3. **回應可整形** —— 需要時可在 server 端裁欄位、加快取(`cachedEventHandler`),前端拿到的是乾淨資料。

## 資料流(對應 Nuxt SSR 生命週期)

- 首頁 `useFetch('/api/search', { query: { q } })`:`q` 綁在網址 `?q=`,所以**首屏在 server 端就抓好資料**、序列化進 payload,hydration 時不重抓。改關鍵字時 `q` 變動,`useFetch` 自動重打。
- 詳細頁 `useFetch('/api/repo/:owner/:name')`:同樣走 SSR,`useRoute().params` 取動態路由參數。
- 列表 → 詳細用 `<NuxtLink>` 做 client-side 導航,不整頁重載。

## 可以再延伸的地方

- 詳細頁加抓 README:`GET /repos/{owner}/{repo}/readme`(回傳 base64,decode 後用 markdown 套件渲染)。
- 搜尋分頁 / 無限捲動:`server/api/search.get.ts` 已經吃 `page` 參數。
- 用 `cachedEventHandler` 或 Nitro `routeRules` 對熱門查詢加快取。
- 錯誤頁:加 `error.vue` 統一處理 404 / rate limit。
```
