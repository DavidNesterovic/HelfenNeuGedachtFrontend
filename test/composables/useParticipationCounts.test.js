import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useParticipationCounts } from '~/composables/useParticipationCounts'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('$fetch', () => fetchMock)

describe('useParticipationCounts', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    const { interestedCount, upcomingCount } = useParticipationCounts()
    interestedCount.value = 0
    upcomingCount.value = 0
  })

  it('zählt interessierte (0) und anstehende (1, 4) Teilnahmen', async () => {
    fetchMock.mockResolvedValueOnce([
      { status: 0 }, { status: 0 }, { status: 1 }, { status: 4 }, { status: 2 },
    ])
    const { interestedCount, upcomingCount, refresh } = useParticipationCounts()
    await refresh()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/Participation\/user$/),
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(interestedCount.value).toBe(2)
    expect(upcomingCount.value).toBe(2)
  })

  it('teilt den State zwischen Aufrufen (useState)', async () => {
    fetchMock.mockResolvedValueOnce([{ status: 0 }])
    await useParticipationCounts().refresh()
    expect(useParticipationCounts().interestedCount.value).toBe(1)
  })

  it('behandelt eine leere Antwort als 0', async () => {
    fetchMock.mockResolvedValueOnce(null)
    const { interestedCount, upcomingCount, refresh } = useParticipationCounts()
    await refresh()
    expect(interestedCount.value).toBe(0)
    expect(upcomingCount.value).toBe(0)
  })

  it('ignoriert API-Fehler und behält die alten Werte', async () => {
    const { interestedCount, refresh } = useParticipationCounts()
    interestedCount.value = 5
    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await expect(refresh()).resolves.toBeUndefined()
    expect(interestedCount.value).toBe(5)
  })
})
