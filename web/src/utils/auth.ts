let refreshPromise: Promise<boolean> | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null
let initialized = false
let lastForegroundRefreshAttemptMs = 0

const REFRESH_LEAD_MS = 5 * 60 * 1000
const FALLBACK_REFRESH_MS = 45 * 60 * 1000
const FOREGROUND_REFRESH_THROTTLE_MS = 60 * 1000

function inBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function scheduleNextRefresh(accessExpiresAtMs?: number): void {
  if (!inBrowser()) return

  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }

  let delay = FALLBACK_REFRESH_MS
  if (typeof accessExpiresAtMs === 'number' && Number.isFinite(accessExpiresAtMs)) {
    delay = Math.max(10_000, accessExpiresAtMs - Date.now() - REFRESH_LEAD_MS)
  }

  refreshTimer = setTimeout(() => {
    void refresh()
  }, delay)
}

function parseAccessExpiryFromRefreshResponse(payload: any): number | undefined {
  const raw = payload?.access_expires_at
  return typeof raw === 'number' ? raw : undefined
}

function maybeRefreshOnForeground(): void {
  if (!inBrowser()) return
  if (document.hidden) return

  const now = Date.now()
  if (now-lastForegroundRefreshAttemptMs < FOREGROUND_REFRESH_THROTTLE_MS) return
  lastForegroundRefreshAttemptMs = now
  void refresh()
}

export async function refresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
      if (!res.ok) return false

      let accessExpiresAtMs: number | undefined
      try {
        if (typeof res.json === 'function') {
          const payload = await res.json()
          accessExpiresAtMs = parseAccessExpiryFromRefreshResponse(payload)
        }
      } catch {
        // Ignore malformed refresh payload and use a fallback schedule.
      }

      scheduleNextRefresh(accessExpiresAtMs)
      return true
    } catch (err) {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// init attempts a refresh once on app startup so short-lived access tokens
// can be renewed transparently if a valid refresh token exists.
export async function init(): Promise<void> {
  if (!initialized) {
    initialized = true
    if (inBrowser()) {
      window.addEventListener('focus', maybeRefreshOnForeground)
      document.addEventListener('visibilitychange', maybeRefreshOnForeground)
    }
  }

  try {
    await refresh()
  } catch (err) {
    // ignore
  }
}

export default { refresh, init }
