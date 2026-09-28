// License-Check für den Quality Gate.
//   BLOCK -> starkes Copyleft / nicht-kommerziell: Exit-Code 1, Pipeline stoppt
//   WARN  -> schwaches Copyleft oder unbekannte Lizenz: Warnung, manuelle Prüfung
//   ALLOW -> permissive Lizenzen
// Bei "A OR B" reicht es, wenn eine Alternative erlaubt ist (wir dürfen wählen).
import { execFileSync } from 'node:child_process'

const ALLOW = [
  'MIT', 'MIT-0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', '0BSD',
  'BlueOak-1.0.0', 'CC0-1.0', 'CC-BY-4.0', 'Unlicense', 'Python-2.0',
]
const BLOCK = [/^A?GPL/i, /^SSPL/i, /^CC-BY-NC/i, /^EUPL/i]
const WARN = [/^LGPL/i, /^MPL/i, /^EPL/i, /^CDDL/i]

const bin = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const json = execFileSync(
  bin,
  ['license-checker-rseidelsohn', '--production', '--excludePrivatePackages', '--json'],
  { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024 },
)

const classify = (license) => {
  const options = String(license).replace(/[()]/g, '').split(/\s+OR\s+/i).map(s => s.trim())
  if (options.some(l => ALLOW.includes(l))) return 'allow'
  if (options.every(l => BLOCK.some(re => re.test(l)))) return 'block'
  if (options.some(l => WARN.some(re => re.test(l)))) return 'warn'
  return 'unknown' // z.B. "MIT*", "Custom: ...", "UNKNOWN"
}

const found = { block: [], warn: [], unknown: [] }
for (const [pkg, info] of Object.entries(JSON.parse(json))) {
  const licenses = [info.licenses].flat()
  const results = licenses.map(classify)
  const verdict = results.includes('block') ? 'block'
    : results.includes('allow') ? 'allow'
      : results.includes('warn') ? 'warn' : 'unknown'
  if (verdict !== 'allow') found[verdict].push(`${pkg} (${licenses.join(', ')})`)
}

const gh = process.env.GITHUB_ACTIONS === 'true'
const report = (level, msg) => console.log(gh ? `::${level} title=License::${msg}` : `[${level}] ${msg}`)

found.warn.forEach(p => report('warning', `Schwaches Copyleft, bitte prüfen: ${p}`))
found.unknown.forEach(p => report('warning', `Unbekannte Lizenz, bitte prüfen: ${p}`))
found.block.forEach(p => report('error', `Nicht erlaubte Lizenz: ${p}`))

console.log(`\nLicense-Check: ${found.block.length} blockiert, ${found.warn.length + found.unknown.length} Warnungen`)
process.exit(found.block.length ? 1 : 0)
