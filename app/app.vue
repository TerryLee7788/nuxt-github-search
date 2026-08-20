<template>
  <div class="app">
    <header class="app-header">
      <NuxtLink to="/" class="brand">
        <svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>Nuxt GitHub Search</span>
      </NuxtLink>
    </header>

    <main class="app-main">
      <NuxtPage />
    </main>

    <footer class="app-footer">
      資料來源 GitHub REST API · Nuxt 3 範例
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --surface-hover: #1c2230;
  --border: #30363d;
  --text: #e6edf3;
  --muted: #8b949e;
  --accent: #58a6ff;
  --star: #e3b341;
  --green: #3fb950;
  --radius: 12px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang TC',
    'Microsoft JhengHei', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
}

a { color: inherit; text-decoration: none; }

.app { min-height: 100vh; display: flex; flex-direction: column; }

.app-header {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 900px;
  margin: 0 auto;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 16px;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 20px 48px;
}

.app-footer {
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 13px;
  text-align: center;
  padding: 20px;
}
</style>
