// npm-audit-Check für den Quality Gate (nur Produktions-Dependencies).
//   BLOCK -> HIGH/CRITICAL-Advisory, das nicht in audit-exceptions.json steht
//            oder dessen Ausnahme abgelaufen ist
//   WARN  -> HIGH/CRITICAL-Advisory mit gültiger Ausnahme (Begründung + Ablaufdatum)
// LOW/MODERATE prüft der separate, nicht blockierende Audit-Schritt im Workflow.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const BLOCKING = ['high', 'critical']

const exceptions = JSON.parse(readFileSync(new URL('../audit-exceptions.json', import.meta.url), 'utf8'))

let json
try {
  json = execFileSync('npm', ['audit', '--package-lock-only', '--omit=dev', '--json'], {
    encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024,
  })
} catch (e) {
  // npm audit endet mit Exit-Code 1, sobald es Findings gibt -> JSON steht trotzdem in stdout
  json = e.stdout
}
const { vulnerabilities = {} } = JSON.parse(json)

// Nur die eigentlichen Advisories, nicht die Pakete, die nur über ein anderes Paket betroffen sind
const advisories = new Map()
for (const [pkg, vuln] of Object.entries(vulnerabilities)) {
  for (const via of vuln.via.filter(v => typeof v === 'object')) {
    if (!BLOCKING.includes(via.severity)) continue
    const id = via.url.split('/').pop()
    advisories.set(id, { id, pkg, severity: via.severity, title: via.title, url: via.url, fix: vuln.fixAvailable })
  }
}

const gh = process.env.GITHUB_ACTIONS === 'true'
const report = (level, msg) => console.log(gh ? `::${level} title=npm audit::${msg}` : `[${level}] ${msg}`)

const today = new Date().toISOString().slice(0, 10)
let blocked = 0
for (const a of advisories.values()) {
  const label = `${a.severity.toUpperCase()} ${a.pkg} ${a.id}: ${a.title} (${a.url})`
  const exception = exceptions.find(e => e.id === a.id)
  if (!exception) {
    report('error', `${label}. Fix mit "npm audit fix" oder Ausnahme in audit-exceptions.json eintragen.`)
    blocked++
  } else if (exception.expires < today) {
    report('error', `${label}. Ausnahme ist am ${exception.expires} abgelaufen, bitte neu bewerten.`)
    blocked++
  } else {
    report('warning', `${label}. Akzeptiert bis ${exception.expires}: ${exception.reason}`)
    // fixAvailable ist nicht verlässlich (z.B. node-forge: npm meldet true, "npm audit fix" ändert aber nichts),
    // deshalb nur als Hinweis. Das Ablaufdatum erzwingt die Neubewertung.
    if (a.fix === true) report('notice', `${a.pkg} ${a.id}: npm meldet einen möglichen Fix, "npm audit fix" ausprobieren.`)
  }
}

for (const e of exceptions.filter(e => !advisories.has(e.id))) {
  report('notice', `Ausnahme ${e.id} (${e.package}) wird nicht mehr gebraucht und kann aus audit-exceptions.json entfernt werden.`)
}

console.log(`\nnpm-audit-Check: ${blocked} blockiert, ${advisories.size - blocked} per Ausnahme akzeptiert`)
process.exit(blocked ? 1 : 0)
