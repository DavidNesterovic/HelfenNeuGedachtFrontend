// CSV für Excel im deutschsprachigen Raum: Semikolon als Trenner, BOM damit Umlaute stimmen.
const SEPARATOR = ';'
export const BOM = String.fromCharCode(0xfeff)

// Werte aus öffentlichen Formularen: Zellen, die mit = + - @ beginnen, würde Excel als Formel ausführen
const FORMULA_START = /^[=+\-@\t\r]/

export const escapeCsvValue = (value) => {
  let text = value == null ? '' : String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * @param {Array<object>} rows
 * @param {Array<{ label: string, value: (row: object) => unknown }>} columns
 */
export const toCsv = (rows, columns) => {
  const header = columns.map(c => escapeCsvValue(c.label)).join(SEPARATOR)
  const lines = rows.map(row => columns.map(c => escapeCsvValue(c.value(row))).join(SEPARATOR))
  return `${BOM}${[header, ...lines].join('\r\n')}`
}

export const downloadCsv = (filename, csv) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
