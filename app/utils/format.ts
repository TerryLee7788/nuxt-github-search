export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
}
