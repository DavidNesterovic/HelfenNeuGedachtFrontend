import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useEventStatus } from '~/composables/useEventStatus'

const {
  normalizeStatus,
  getStatusLabel,
  getStatusBadgeClass,
  needsAttention,
  getAttentionHint,
  formatDate,
  getInterestedHelpers,
  getAppliedHelpers,
  getConfirmedHelpers,
} = useEventStatus()

describe('normalizeStatus', () => {
  it.each([
    [0, 0],
    [3, 3],
    ['1', 1],
    ['2', 2],
    ['Planned', 0],
    ['TakePlace', 1],
    ['Accomplished', 2],
    ['Canceled', 3],
    [null, 0],
    [undefined, 0],
    ['Unbekannt', 0],
  ])('%j -> %i', (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected)
  })
})

describe('getStatusLabel / getStatusBadgeClass', () => {
  it.each([
    [0, 'Entwurf', 'slate'],
    [1, 'Veröffentlicht', 'blue'],
    [2, 'Durchgeführt', 'emerald'],
    [3, 'Abgesagt', 'red'],
  ])('Status %i -> %s', (status, label, color) => {
    expect(getStatusLabel(status)).toBe(label)
    expect(getStatusBadgeClass(status)).toContain(color)
  })

  it('fällt bei unbekannten Werten auf Entwurf zurück', () => {
    expect(getStatusLabel(99)).toBe('Entwurf')
    expect(getStatusBadgeClass(99)).toContain('slate')
  })
})

describe('needsAttention / getAttentionHint', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('markiert vergangene Events im Entwurf oder veröffentlicht', () => {
    for (const eventStatus of [0, 1]) {
      const event = { startDate: '2026-06-01T10:00:00Z', endDate: '2026-06-02T10:00:00Z', eventStatus }
      expect(needsAttention(event)).toBe(true)
      expect(getAttentionHint(event)).toBe('Vergangenes Event sollte durchgeführt oder abgesagt sein.')
    }
  })

  it('markiert zukünftige Events, die schon durchgeführt sind', () => {
    const event = { startDate: '2026-07-01T10:00:00Z', eventStatus: 2 }
    expect(needsAttention(event)).toBe(true)
    expect(getAttentionHint(event)).toBe('Zukünftiges Event kann nicht durchgeführt sein.')
  })

  it('nutzt das Startdatum, wenn kein Enddatum gesetzt ist', () => {
    expect(needsAttention({ startDate: '2026-06-01T10:00:00Z', eventStatus: 1 })).toBe(true)
  })

  it('lässt laufende und korrekt abgeschlossene Events in Ruhe', () => {
    const running = { startDate: '2026-06-14T10:00:00Z', endDate: '2026-06-16T10:00:00Z', eventStatus: 1 }
    const done = { startDate: '2026-06-01T10:00:00Z', endDate: '2026-06-02T10:00:00Z', eventStatus: 2 }
    const canceled = { startDate: '2026-06-01T10:00:00Z', eventStatus: 3 }
    for (const event of [running, done, canceled]) {
      expect(needsAttention(event)).toBe(false)
      expect(getAttentionHint(event)).toBe('')
    }
  })
})

describe('formatDate', () => {
  it('formatiert im deutschen Format', () => {
    expect(formatDate('2026-03-07T12:00:00')).toBe('07.03.2026')
  })

  it('gibt "-" für leere Werte zurück', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
  })
})

describe('Helfer-Filter', () => {
  const shift = {
    helperList: [
      { id: 1, status: 0 },
      { id: 2, status: 1 },
      { id: 3, status: 4 },
      { id: 4, status: 0 },
      { id: 5, status: 2 },
    ],
  }

  it('filtert nach Interessiert (0), Beworben (4) und Bestätigt (1)', () => {
    expect(getInterestedHelpers(shift).map(h => h.id)).toEqual([1, 4])
    expect(getAppliedHelpers(shift).map(h => h.id)).toEqual([3])
    expect(getConfirmedHelpers(shift).map(h => h.id)).toEqual([2])
  })

  it('kommt mit fehlender helperList zurecht', () => {
    expect(getInterestedHelpers({})).toEqual([])
    expect(getAppliedHelpers({})).toEqual([])
    expect(getConfirmedHelpers({})).toEqual([])
  })
})
