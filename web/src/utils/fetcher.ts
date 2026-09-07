import * as auth from './auth'

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const mergedInit: RequestInit = Object.assign({ credentials: 'include' }, init || {})

  const res = await fetch(input, mergedInit)
  if (res.status !== 401) return res

  // Try refreshing once
  const refreshed = await auth.refresh()
  if (!refreshed) return res

  // Retry original request once after refresh
  return fetch(input, mergedInit)
}

export default fetchWithAuth
