// Erzeugt ein unsigniertes Fake-JWT (header.payload.signature) für Tests.
const base64Url = (obj) => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const createToken = payload =>
  `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`

export const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

export const inSeconds = seconds => Math.floor(Date.now() / 1000) + seconds
