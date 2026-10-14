import { describe, it, expect } from 'vitest'
import { formatDistance } from '~/assets/utils/geo'

describe('formatDistance', () => {
  it('zeigt unter 1 km "< 1 km"', () => {
    expect(formatDistance(0)).toBe('< 1 km entfernt')
    expect(formatDistance(0.4)).toBe('< 1 km entfernt')
  })

  it('zeigt unter 10 km eine Nachkommastelle mit Komma', () => {
    expect(formatDistance(3.46)).toBe('3,5 km entfernt')
    expect(formatDistance(5)).toBe('5 km entfernt')
  })

  it('rundet ab 10 km auf ganze Kilometer', () => {
    expect(formatDistance(12.4)).toBe('12 km entfernt')
    expect(formatDistance(249.6)).toBe('250 km entfernt')
  })

  it('zeigt nichts ohne Entfernung', () => {
    expect(formatDistance(null)).toBe('')
    expect(formatDistance(undefined)).toBe('')
    expect(formatDistance('abc')).toBe('')
  })
})
