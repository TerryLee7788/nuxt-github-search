# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A minimal Nuxt 3 example app: search GitHub repositories on the home page, click through to a repo detail page. All GitHub API calls are proxied through Nuxt server routes so the GitHub token never reaches the client. Repo README (in Traditional Chinese) is the primary source of intent for this project — read it for the rationale behind the server-proxy design.

## Commands

```bash
npm install        # install deps (postinstall runs `nuxt prepare`)
npm run dev         # dev server at http://localhost:3000
npm run build        # production build
npm run generate      # static generation
npm run preview       # preview a production build
```

Copy `.env.example` to `.env` and set `GITHUB_TOKEN` to raise GitHub API rate limits (unauthenticated: 10 req/min for search, 60 req/hr for core; authenticated: 5000 req/hr). The app runs without it. No test suite or lint config exists in this repo.

## Architecture

**Server acts as a proxy to `api.github.com`.** The client never calls GitHub directly:
- `GITHUB_TOKEN` is read via `runtimeConfig` in `nuxt.config.ts`, which keeps it server-only (never bundled into client JS).
- Frontend pages call `/api/*` on the same origin; the Nitro server handlers attach the `Authorization` header and forward to `api.github.com`, translating GitHub error responses into Nuxt `createError` responses (`statusCode`/`statusMessage`) so `useFetch`'s `error` ref on the client works directly.

**Data flow / SSR:** Both pages use `await useFetch(...)` so the first request is resolved server-side and serialized into the SSR payload — no refetch on hydration. On the home page, the search keyword lives in the URL (`?q=`) as the source of truth (shareable, back/forward-button friendly); the text input is debounced (400ms) before it pushes a new `q` into the route, which `useFetch` then reactively refetches.

**Types:** `types/github.ts` defines `RepoSummary` (search result shape) and `RepoDetail` (extends `RepoSummary` with fields only the single-repo endpoint returns, e.g. `watchers_count`, `license`, `default_branch`). Both server handlers and both pages import from here — keep them in sync with the actual GitHub REST response shape when changing either endpoint.

## Route layout

The detail page and its API route live where Nuxt's file-based routers expect them: `pages/repos/[owner]/[name].vue` → `/repos/:owner/:name`, and `server/api/repo/[owner]/[name].get.ts` → `/api/repo/:owner/:name`. (These were originally misplaced at the repo root / directly under `server/api/`, which silently broke both routes — if either ever ends up back outside `pages/` or `server/api/repo/`, that's why.)
