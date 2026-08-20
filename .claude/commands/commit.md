---
description: Stage current changes and commit them (split into logical batches if large), following Conventional Commits / GitHub PR title rules.
argument-hint: [optional focus, e.g. "only server/"]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Bash(git restore:*), Bash(git reset:*)
---

## Context

- Remote: `https://github.com/TerryLee7788/nuxt-github-search.git`
- Current status: !`git status`
- Staged + unstaged diff stat: !`git diff HEAD --stat 2>/dev/null || git diff --stat`

## Your task

Stage and commit the working tree's current changes. Optional focus from the user: $ARGUMENTS (if given, only consider files matching that focus — ignore everything else).

1. **Inspect first.** Read `git status` and `git diff` (or `git diff --cached` for anything already staged) for full content, not just the stat summary. Never blindly `git add -A` — decide deliberately what belongs together.

2. **Decide: one commit or several batches.**
   - If the changes are small and form a single logical unit, stage everything relevant and make one commit.
   - If the diff is large or spans unrelated concerns (e.g. frontend `pages/*.vue` changes, backend `server/api/**` changes, config/tooling changes, docs, dependency lockfile bumps), split into multiple commits — one per logical concern. Stage each batch with `git add <specific files>` (never `-A`), commit it, then move to the next batch.
   - Never mix an unrelated concern into a batch just because it touched the same file — if a file has hunks belonging to two different concerns, call this out to the user rather than silently commingling them (`git add -p` if you need partial-file staging).

3. **Commit message rules — Conventional Commits, matching GitHub PR title conventions:**
   - Format: `<type>(<optional scope>): <imperative, present-tense summary>`, subject line under ~72 chars, no trailing period.
   - `<type>` is one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `chore`, `ci`.
   - `<scope>` is optional, lowercase, names the affected area (e.g. `api`, `search`, `repo-detail`, `deps`).
   - Body (optional, blank line after subject): explain *why*, not what — skip it for trivial/self-evident changes.
   - Write subjects in English unless the existing commit history on this repo shows otherwise.

4. **Never push.** This command only stages and commits locally. Pushing to `origin` requires a separate explicit request from the user.

5. **Report back** a short list of the commit(s) you made (hash + subject) when done.
