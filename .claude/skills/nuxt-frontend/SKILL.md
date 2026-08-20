---
name: nuxt-frontend
description: Conventions for pages/*.vue in this Nuxt GitHub Search app — SSR data fetching with useFetch, URL-as-state search, error/pending display, and shared UI helpers. Use when adding or editing pages, or any client-facing view logic.
---

# Frontend conventions (pages/*.vue)

This app has exactly two pages. Follow their existing shape when adding a third rather than inventing a new pattern.

## Data fetching

- Always `await useFetch<T>(...)` directly in `<script setup>`, never `$fetch` + manual `ref`/`onMounted`. This resolves the request server-side and serializes it into the SSR payload — no refetch on hydration (see CLAUDE.md "Data flow / SSR").
- Destructure `{ data, pending, error }` and drive the template off those three states in this order: `pending` → `error` → empty/no-input state → results. See `pages/index.vue:66-77` and `pages/repos/[owner]/[name].vue:31-36` for the exact branching order.
- `error.statusMessage` is shown directly in the template — the server API already translates GitHub errors into `createError({ statusCode, statusMessage })`, so don't re-catch or reformat it client-side.
- Import request/response types from `~/types/github` (`RepoSummary`, `RepoDetail`, `GitHubSearchResponse`) — never redeclare shapes inline.

## URL as source of truth (search page only)

- The search keyword lives in `route.query.q`, not in a standalone reactive variable that then gets pushed to the API. `useFetch`'s `query: { q }` reactively refetches when the route changes.
- The `<input>` binds to a local `keyword` ref for immediate typing feedback, but only pushes to the route (`router.push({ query: { q } })`) after a 400ms debounce (`pages/index.vue:21-27`). Do not lower this or fire on every keystroke — it exists to avoid hammering the GitHub search API.
- Quick-filter chips bypass debounce and push immediately (`quickSearch`), since that's a discrete click, not typing.

## Routing

- Dynamic page routes must physically live where Nuxt's file-based router expects them: `pages/repos/[owner]/[name].vue` → `/repos/:owner/:name`. If a new nested dynamic route is needed, mirror this bracket-folder nesting exactly — a misplaced file (e.g. at the pages root) silently 404s instead of erroring at build time.
- Read dynamic segments via `route.params.<name> as string`, not props, matching `pages/repos/[owner]/[name].vue:5-6`.

## Shared UI helpers (currently duplicated per-page, kept inline by design)

- `formatNumber(n)`: converts to `"1.2k"` style for star/fork/watcher counts. Duplicated in both pages — if a third page needs it, consider extracting to a composable, but don't preemptively extract for two call sites.
- Dates format via `toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })`.
- UI copy is Traditional Chinese; keep new user-facing strings consistent with that (see README for rationale — it's the primary source of intent for this project).

## Styling

- `<style scoped>` per page, no global CSS framework. Reuse the existing CSS custom properties rather than hardcoding colors: `--text`, `--muted`, `--surface`, `--surface-hover`, `--border`, `--radius`, `--accent`. Error states use the literal `#f85149` (GitHub's error red) via `.state--error`.
