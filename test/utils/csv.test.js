import { describe, it, expect } from 'vitest'
import { BOM, escapeCsvValue, toCsv } from '~/assets/utils/csv'

describe('escapeCsvValue', () => {
  it('lässt einfache Werte unverändert', () => {
    expect(escapeCsvValue('max@example.com')).toBe('max@example.com')
  })

  it('setzt Werte mit Trenner, Anführungszeichen oder Zeilenumbruch in Anführungszeichen', () => {
    expect(escapeCsvValue('a;b')).toBe('"a;b"')
    expect(escapeCsvValue('sag "hallo"')).toBe('"sag ""hallo"""')
    expect(escapeCsvValue('a\nb')).toBe('"a\nb"')
  })

  it('entschärft Werte, die Excel als Formel ausführen würde', () => {
    expect(escapeCsvValue('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(escapeCsvValue('+43@example.com')).toBe("'+43@example.com")
    expect(escapeCsvValue('@sum')).toBe("'@sum")
  })

  it('macht aus null und undefined eine leere Zelle', () => {
    expect(escapeCsvValue(null)).toBe('')
    expect(escapeCsvValue(undefined)).toBe('')
  })
})

describe('toCsv', () => {
  it('schreibt BOM, Kopfzeile und eine Zeile je Eintrag mit Semikolon', () => {
    const csv = toCsv(
      [{ email: 'a@example.com', type: 'Helfer' }, { email: 'b@example.com', type: 'Organisation / Verein' }],
      [{ label: 'E-Mail', value: r => r.email }, { label: 'Interesse als', value: r => r.type }],
    )

    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toBe(`${BOM}E-Mail;Interesse als\r\na@example.com;Helfer\r\nb@example.com;Organisation / Verein`)
  })
})
