import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock the auth module so we can control refresh behavior
vi.mock('../auth', () => {
  const refresh = vi.fn()
  return {
    __esModule: true,
    default: { refresh },
    refresh,
  }
})

import fetchWithAuth from '../fetcher'
import auth from '../auth'

describe('fetchWithAuth', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('passes through successful requests', async () => {
    const mockResp = { status: 200, ok: true, json: async () => ({}) }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResp))

    const r = await fetchWithAuth('/some')
    expect(r).toBe(mockResp)
    expect((globalThis.fetch as any).mock.calls.length).toBe(1)
  })

  it('retries after 401 when refresh succeeds', async () => {
    const first = { status: 401, ok: false }
    const second = { status: 200, ok: true }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
    vi.stubGlobal('fetch', fetchMock)

    ;(auth as any).refresh.mockResolvedValue(true)

    const r = await fetchWithAuth('/some')
    expect(r).toBe(second)
    expect(fetchMock.mock.calls.length).toBe(2)
    expect((auth as any).refresh).toHaveBeenCalled()
  })

  it('does not retry when refresh fails', async () => {
    const first = { status: 401, ok: false }
    const fetchMock = vi.fn().mockResolvedValue(first)
    vi.stubGlobal('fetch', fetchMock)
    ;(auth as any).refresh.mockResolvedValue(false)

    const r = await fetchWithAuth('/some')
    expect(r).toBe(first)
    expect(fetchMock.mock.calls.length).toBe(1)
    expect((auth as any).refresh).toHaveBeenCalled()
  })
})
