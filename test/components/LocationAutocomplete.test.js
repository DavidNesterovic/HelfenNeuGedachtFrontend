import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import LocationAutocomplete from '~/components/LocationAutocomplete.vue'
import { GEO_DEBOUNCE_MS } from '~/composables/useGeoSearch'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('$fetch', () => fetchMock)

const places = [
  { label: '6850 Dornbirn, Österreich', latitude: 47.4125, longitude: 9.7417 },
  { label: '6900 Bregenz, Österreich', latitude: 47.5031, longitude: 9.7471 },
]

const typeAndWait = async (wrapper, text) => {
  const input = wrapper.find('input[role="combobox"]')
  await input.setValue(text)
  await vi.advanceTimersByTimeAsync(GEO_DEBOUNCE_MS)
  await wrapper.vm.$nextTick()
  return input
}

describe('LocationAutocomplete', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(places)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('zeigt Treffer und übernimmt einen per Klick gewählten Ort samt Koordinaten', async () => {
    const wrapper = await mountSuspended(LocationAutocomplete, { props: { label: 'Ort' } })
    const input = await typeAndWait(wrapper, 'Dornb')

    expect(input.attributes('aria-expanded')).toBe('true')
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)

    await options[1].trigger('mousedown')

    expect(wrapper.emitted('update:modelValue').at(-1)).toEqual(['6900 Bregenz, Österreich'])
    expect(wrapper.emitted('update:coordinates').at(-1)).toEqual([{ latitude: 47.5031, longitude: 9.7471 }])
    expect(wrapper.emitted('select').at(-1)[0]).toEqual(places[1])
  })

  it('lässt sich mit Pfeiltasten und Enter bedienen, Escape schließt die Liste', async () => {
    const wrapper = await mountSuspended(LocationAutocomplete, { props: { label: 'Ort' } })
    const input = await typeAndWait(wrapper, 'Dornb')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.attributes('aria-activedescendant')).toMatch(/-option-0$/)

    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select').at(-1)[0]).toEqual(places[0])

    await typeAndWait(wrapper, 'Bregenz')
    expect(input.attributes('aria-expanded')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('verwirft die Koordinaten, sobald der Ort neu getippt wird', async () => {
    const wrapper = await mountSuspended(LocationAutocomplete, {
      props: { label: 'Ort', modelValue: 'Dornbirn', coordinates: { latitude: 47.4, longitude: 9.7 } },
    })

    await wrapper.find('input').setValue('Dornbirn Markt')

    expect(wrapper.emitted('update:coordinates').at(-1)).toEqual([null])
  })
})
