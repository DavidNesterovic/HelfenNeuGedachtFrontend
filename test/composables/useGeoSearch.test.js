import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { GEO_DEBOUNCE_MS, useGeoSearch } from '~/composables/useGeoSearch'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('$fetch', () => fetchMock)

const dornbirn = { label: '6850 Dornbirn, Österreich', latitude: 47.4125, longitude: 9.7417 }

describe('useGeoSearch', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sucht erst nach der Pause und nur einmal für schnelles Tippen', async () => {
    fetchMock.mockResolvedValue([dornbirn])
    const { results, search } = useGeoSearch()

    search('Dor')
    search('Dorn')
    search('Dornbirn')
    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/geo\/search$/),
      expect.objectContaining({ params: { q: 'Dornbirn' } }),
    )
    expect(results.value).toEqual([dornbirn])
  })

  it('sucht unter 3 Zeichen nicht und leert die Treffer', async () => {
    fetchMock.mockResolvedValue([dornbirn])
    const { results, loading, search } = useGeoSearch()

    search('Dornbirn')
    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)
    expect(results.value).toHaveLength(1)

    search('Do')
    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(results.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  it('meldet einen Fehler und liefert keine Treffer, wenn die Suche fehlschlägt', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const { results, error, loading, search } = useGeoSearch()

    search('Dornbirn')
    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)

    expect(error.value).toBe(true)
    expect(results.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  it('bricht die laufende Anfrage ab, wenn neu gesucht wird', async () => {
    let firstSignal
    fetchMock
      .mockImplementationOnce((_url, { signal }) => {
        firstSignal = signal
        return new Promise(() => {})
      })
      .mockResolvedValueOnce([dornbirn])
    const { results, search } = useGeoSearch()

    search('Bregenz')
    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)
    search('Dornbirn')
    await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)

    expect(firstSignal.aborted).toBe(true)
    expect(results.value).toEqual([dornbirn])
  })
})
