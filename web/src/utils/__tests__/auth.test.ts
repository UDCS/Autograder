import { vi, describe, it, expect, afterEach } from 'vitest'
import * as auth from '../auth'

describe('auth.refresh', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when refresh endpoint responds ok and dedupes concurrent calls', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      calls++
      return Promise.resolve({ ok: true })
    }))

    const [a, b] = await Promise.all([auth.refresh(), auth.refresh()])
    expect(a).toBe(true)
    expect(b).toBe(true)
    expect(calls).toBe(1)
  })

  it('returns false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => { throw new Error('net') }))
    const res = await auth.refresh()
    expect(res).toBe(false)
  })

  it('returns false when fetch returns non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const res = await auth.refresh()
    expect(res).toBe(false)
  })
})
