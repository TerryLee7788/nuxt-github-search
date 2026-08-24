---
name: nuxt-frontend
description: Conventions for app/pages/*.vue in this Nuxt GitHub Search app — SSR data fetching with useFetch, URL-as-state search, error/pending display, and shared UI helpers. Use when adding or editing pages, or any client-facing view logic.
---

# Frontend conventions (app/pages/*.vue)

This is a **Nuxt 4** app: client-side code lives under `app/` (the srcDir). Pages are in `app/pages/`, the root layout is `app/app.vue`. The `~`/`@` aliases resolve inside `app/`; use `~~`/`@@` for anything at the project root (e.g. `types/`).

This app has three pages: `index.vue` (search), `favorites.vue` (bookmarked repos), `repos/[owner]/[name].vue` (repo detail). Follow their existing shape when adding another rather than inventing a new pattern.

## Data fetching

- Always `await useFetch<T>(...)` directly in `<script setup>`, never `$fetch` + manual `ref`/`onMounted`. This resolves the request server-side and serializes it into the SSR payload — no refetch on hydration (see CLAUDE.md "Data flow / SSR").
- Destructure `{ data, pending, error }` and drive the template off those three states in this order: `pending` → `error` → empty/no-input state → results. See `app/pages/index.vue:66-77` and `app/pages/repos/[owner]/[name].vue:31-36` for the exact branching order.
- `error.statusMessage` is shown directly in the template — the server API already translates GitHub errors into `createError({ statusCode, statusMessage })`, so don't re-catch or reformat it client-side.
- Import request/response types from `~~/types/github` (`RepoSummary`, `RepoDetail`, `GitHubSearchResponse`) — root-relative because `types/` sits outside `app/`; never redeclare shapes inline.

## URL as source of truth (search page only)

- The search keyword lives in `route.query.q`, not in a standalone reactive variable that then gets pushed to the API. `useFetch`'s `query: { q }` reactively refetches when the route changes.
- The `<input>` binds to a local `keyword` ref for immediate typing feedback, but only pushes to the route (`router.push({ query: { q } })`) after a 400ms debounce (`app/pages/index.vue`). Do not lower this or fire on every keystroke — it exists to avoid hammering the GitHub search API.
- Quick-filter chips bypass debounce and push immediately (`quickSearch`), since that's a discrete click, not typing.
- `keyword` must also be synced the other way: `watch(q, (newQ) => { keyword.value = newQ })`. Without this, navigating back to `/` via the header's brand `NuxtLink` while already on the search page leaves stale text in the input — Vue Router reuses the existing `index.vue` component instance for same-route navigations, so `setup()` doesn't rerun and `keyword`'s initial value (`ref(q.value)`) never resets on its own.

## Routing

- Dynamic page routes must physically live where Nuxt's file-based router expects them: `app/pages/repos/[owner]/[name].vue` → `/repos/:owner/:name`. If a new nested dynamic route is needed, mirror this bracket-folder nesting exactly — a misplaced file (e.g. at the `app/pages/` root) silently 404s instead of erroring at build time.
- Read dynamic segments via `route.params.<name> as string`, not props, matching `app/pages/repos/[owner]/[name].vue:5-6`.
- `app/pages/favorites.vue` → `/favorites` is a plain static route, not a state toggle bolted onto another page. Favorites started as a conditional section inside the empty-query state of `index.vue`, but was pulled out into its own page — a distinct concern (view a saved list) deserves its own URL/route rather than overloading what the search page's "no query" state means.

## Shared UI helpers

- `formatNumber(n)` / `formatDate(iso)` live in `app/utils/format.ts` and are auto-imported (Nuxt auto-imports from `app/utils/**`) — don't redeclare them locally in a page or component. `formatNumber` converts to `"1.2k"` style for star/fork/watcher counts; `formatDate` uses `toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })`. They were extracted here once a third call site (`RepoCard.vue`) appeared — this is the project's actual threshold for de-duplicating a helper, not a rule to extract eagerly.
- `app/components/RepoCard.vue` is the one repo-card renderer, used by the search results list and `favorites.vue` — and anywhere else a repo needs to render as a card. It takes a single `repo: RepoSummary` prop and owns its own favorite-toggle button — don't re-inline the card markup in a page.
- UI copy is Traditional Chinese; keep new user-facing strings consistent with that (see README for rationale — it's the primary source of intent for this project).

## State management (Pinia)

- `@pinia/nuxt` is registered in `nuxt.config.ts` (`modules: ['@pinia/nuxt']`). `defineStore`/`ref`/`computed` are auto-imported — don't import them manually in store files.
- Stores live in `app/stores/*.ts`, one file per store, named `useXStore`. `app/stores/favorites.ts` (`useFavoritesStore`) is the only store today — it holds the user's bookmarked repos (`repos: RepoSummary[]`) plus `isFavorite(id)` / `toggle(repo)`. `app.vue`'s header reads `favorites.repos.length` for the ★ count badge, linking to `/favorites`.
- Pinia is for genuine cross-page/client-only state that `useFetch` + the URL don't already cover (see "URL as source of truth" above) — the search keyword and fetched data must **not** move into a store; only add a store when something needs to persist or be shared independently of the current route/request, like favorites.
- **localStorage + SSR**: a store that persists to `localStorage` must never read it during the store's own `setup()` — that runs during SSR too (no `localStorage`) and would also run again on the client before hydration, causing a hydration mismatch against the server-rendered HTML. Instead expose a `hydrate()` action and call it from a `.client.ts` plugin inside `onNuxtReady(...)` (see `app/plugins/favorites.client.ts`), which defers the read until after the app has hydrated. Writes (`toggle`) can call `localStorage.setItem` directly since they only ever fire from a user click, which is client-only by construction.

## Styling

- **Tailwind CSS v4**, wired via `@tailwindcss/vite` in `nuxt.config.ts` (`vite.plugins: [tailwindcss()]`) plus `css: ['~/assets/css/main.css']`. Not the `@nuxtjs/tailwindcss` module — that module pins Tailwind to v3, so it was skipped in favor of the official Vite plugin.
- No `<style scoped>` blocks anymore — style pages with Tailwind utility classes directly in the template. Only reach for a `<style>` block for something utilities genuinely can't express.
- The GitHub-dark palette lives as Tailwind v4 `@theme` tokens in `app/assets/css/main.css`, replacing the old CSS custom properties: `--color-bg` → `bg-bg`, `--color-surface` → `bg-surface`, `--color-surface-hover` → `bg-surface-hover`, `--color-border` → `border-border`, `--color-text` → `text-text`, `--color-muted` → `text-muted`, `--color-accent` → `text-accent`/`border-accent`, `--color-star`, `--color-green`, `--color-danger` (replaces the old literal `#f85149` error red), and `--radius-app` → `rounded-app`. Use these semantic tokens instead of Tailwind's default palette or arbitrary hex values, so pages stay visually consistent.
- Global element defaults (`html`/`body` background, text color, font stack, `a` reset) live once in `app/assets/css/main.css`, not repeated per page.
