---
name: nuxt-backend
description: Conventions for server/api/**/*.ts Nitro routes in this Nuxt GitHub Search app — the GitHub API proxy pattern, token handling, error translation, and route file placement. Use when adding or editing any server/api route or touching GitHub API calls.
---

# Backend conventions (server/api/**)

This app's server routes exist only to proxy `api.github.com` so the GitHub token never reaches the client. Every route follows the same shape — copy it rather than inventing a new one.

## Route file placement

- Nitro maps file path to URL path directly, including bracket segments: `server/api/repo/[owner]/[name].get.ts` → `GET /api/repo/:owner/:name`. A route placed anywhere else (e.g. flattened at `server/api/` root) will silently not match and 404 — this exact mistake happened once in this repo (see CLAUDE.md "Route layout").
- The `.get.ts` suffix pins the HTTP method; use `.post.ts` etc. if a route ever needs another verb.

## Standard handler shape

Every handler follows this structure (see `server/api/search.get.ts` and `server/api/repo/[owner]/[name].get.ts`):

1. `export default defineEventHandler(async (event): Promise<T> => { ... })` — always type the return as the shared type from `~/types/github`.
2. Read input via `getQuery(event)` for query params or `getRouterParam(event, 'name')` for path params. Validate required params up front and `throw createError({ statusCode: 400, ... })` if missing (see the repo-detail handler's owner/name check) — don't let a missing param fall through to an upstream 404/500.
3. Pull the token via `useRuntimeConfig().githubToken` (never `process.env` directly in a handler — the config indirection is what keeps it server-only per `nuxt.config.ts`). Build headers:
   ```ts
   const headers: Record<string, string> = {
     Accept: 'application/vnd.github+json',
     'X-GitHub-Api-Version': '2022-11-28',
   }
   if (config.githubToken) headers.Authorization = `Bearer ${config.githubToken}`
   ```
   The app must keep working with an empty token (unauthenticated, lower rate limit) — never make the token a hard requirement.
4. Call `$fetch` against `https://api.github.com/...` inside a `try/catch`. URL-encode any interpolated path segments with `encodeURIComponent` (owner/repo names can contain characters needing escaping).
5. In `catch`, translate the upstream error into a Nuxt error — never let a raw GitHub error object leak to the client:
   ```ts
   throw createError({
     statusCode: e?.statusCode || e?.response?.status || 502,
     statusMessage: e?.data?.message || '<fallback message>',
   })
   ```
   Customize `statusMessage` per status when it improves UX (e.g. the repo-detail handler special-cases 404 → `'找不到這個 repo'`).

## Types

- `types/github.ts` is shared between server handlers and pages — it's the contract. When GitHub's response shape changes or a new field is needed, update the interface there first (`RepoSummary` for search items, `RepoDetail extends RepoSummary` for the single-repo endpoint), then wire it into both the handler's return type and the page that consumes it. Don't let a handler return fields absent from its declared type, or a page reach for a field the type doesn't declare.

## Adding a new proxied endpoint

- Confirm the equivalent GitHub REST endpoint and its auth requirements first.
- Mirror the URL shape under `server/api/` using bracket folders for path params, matching what the corresponding page will call.
- Reuse the header-building and error-translation snippets above verbatim rather than restyling them — consistency here is what keeps error handling predictable for the frontend's `useFetch` `error` ref.
