import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import {
  parseJwt,
  saveToken,
  getToken,
  isAuthenticated,
  logout,
  getAuthHeader,
  getUserInfo,
  getUserRole,
  getHomeRoute,
  hasRole,
  authenticatedFetch,
} from '~/assets/utils/auth'
import { createToken, ROLE_CLAIM, inSeconds } from '../helpers/jwt'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

beforeEach(() => {
  localStorage.clear()
  navigateToMock.mockClear()
})

describe('parseJwt', () => {
  it('liest den Payload eines gültigen Tokens', () => {
    const token = createToken({ sub: '42', OrganizationId: '7' })
    expect(parseJwt(token)).toEqual({ sub: '42', OrganizationId: '7' })
  })

  it('dekodiert UTF-8 (Umlaute) korrekt', () => {
    const token = createToken({ name: 'Jürgen Größl' })
    expect(parseJwt(token).name).toBe('Jürgen Größl')
  })

  it('gibt null für leere oder kaputte Tokens zurück', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(parseJwt(null)).toBeNull()
    expect(parseJwt('')).toBeNull()
    expect(parseJwt('kein-jwt')).toBeNull()
    expect(parseJwt('a.%%%.c')).toBeNull()
    spy.mockRestore()
  })
})

describe('Token-Speicher', () => {
  it('speichert Token und User-Info im localStorage', () => {
    const token = createToken({ sub: '1', email: 'a@b.at' })
    saveToken(token)
    expect(getToken()).toBe(token)
    expect(getUserInfo()).toEqual({ sub: '1', email: 'a@b.at' })
  })

  it('liefert einen Bearer-Header bzw. leeren String ohne Token', () => {
    expect(getAuthHeader()).toBe('')
    const token = createToken({ sub: '1' })
    saveToken(token)
    expect(getAuthHeader()).toBe(`Bearer ${token}`)
  })

  it('logout löscht Token und leitet auf /login um', () => {
    saveToken(createToken({ sub: '1' }))
    logout()
    expect(getToken()).toBeNull()
    expect(getUserInfo()).toBeNull()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })
})

describe('isAuthenticated', () => {
  it('ist false ohne Token', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('ist true für ein nicht abgelaufenes Token', () => {
    saveToken(createToken({ exp: inSeconds(3600) }))
    expect(isAuthenticated()).toBe(true)
  })

  it('ist false für ein abgelaufenes Token', () => {
    saveToken(createToken({ exp: inSeconds(-60) }))
    expect(isAuthenticated()).toBe(false)
  })

  it('ist false für ein Token ohne exp', () => {
    saveToken(createToken({ sub: '1' }))
    expect(isAuthenticated()).toBe(false)
  })
})

describe('getUserRole / getHomeRoute', () => {
  it('liest die Rolle aus dem ASP.NET ClaimTypes.Role-URI-Key', () => {
    saveToken(createToken({ [ROLE_CLAIM]: 'OrganizationAdmin' }))
    expect(getUserRole()).toBe('OrganizationAdmin')
  })

  it('fällt auf den kurzen role-Claim zurück', () => {
    saveToken(createToken({ role: 'Helper' }))
    expect(getUserRole()).toBe('Helper')
  })

  it('nimmt bei mehreren Rollen die erste', () => {
    saveToken(createToken({ [ROLE_CLAIM]: ['SuperAdmin', 'Helper'] }))
    expect(getUserRole()).toBe('SuperAdmin')
  })

  it('gibt null ohne Token oder Rolle zurück', () => {
    expect(getUserRole()).toBeNull()
    saveToken(createToken({ sub: '1' }))
    expect(getUserRole()).toBeNull()
  })

  it.each(['OrganizationUser', 'OrganizationAdmin'])(
    'leitet %s auf das Organisations-Dashboard',
    (role) => {
      saveToken(createToken({ [ROLE_CLAIM]: role }))
      expect(getHomeRoute()).toBe('/organization/dashboard')
    },
  )

  it('leitet SuperAdmins in den Admin-Bereich, auch wenn die Rolle nicht die erste ist', () => {
    saveToken(createToken({ [ROLE_CLAIM]: 'SuperAdmin' }))
    expect(getHomeRoute()).toBe('/admin/newsletter')
    saveToken(createToken({ [ROLE_CLAIM]: ['OrganizationAdmin', 'SuperAdmin'] }))
    expect(getHomeRoute()).toBe('/admin/newsletter')
  })

  it('hasRole prüft alle Rollen im Token', () => {
    expect(hasRole('SuperAdmin')).toBe(false)
    saveToken(createToken({ [ROLE_CLAIM]: ['Helper', 'SuperAdmin'] }))
    expect(hasRole('SuperAdmin')).toBe(true)
    expect(hasRole('OrganizationAdmin')).toBe(false)
  })

  it('leitet Helfer und Gäste auf /events', () => {
    expect(getHomeRoute()).toBe('/events')
    saveToken(createToken({ [ROLE_CLAIM]: 'Helper' }))
    expect(getHomeRoute()).toBe('/events')
  })
})

describe('authenticatedFetch', () => {
  const token = createToken({ sub: '1' })
  let fetchMock

  const respond = (status, body = null) =>
    fetchMock.mockResolvedValueOnce(new Response(body ? JSON.stringify(body) : null, { status }))

  beforeEach(() => {
    saveToken(token)
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('setzt Authorization- und JSON-Content-Type-Header', async () => {
    respond(200, { ok: true })
    const res = await authenticatedFetch('/api/events', { method: 'POST', body: '{}' })

    expect(res.status).toBe(200)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/events')
    expect(opts.headers.Authorization).toBe(`Bearer ${token}`)
    expect(opts.headers['Content-Type']).toBe('application/json')
  })

  it('setzt keinen Content-Type bei FormData', async () => {
    respond(200)
    await authenticatedFetch('/api/upload', { method: 'POST', body: new FormData() })
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined()
  })

  it('übernimmt einen explizit gesetzten Content-Type', async () => {
    respond(200)
    await authenticatedFetch('/api/x', { headers: { 'Content-Type': 'text/plain' } })
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBe('text/plain')
  })

  it('wirft bei HTTP-Fehlern mit status und data', async () => {
    respond(400, { message: 'Ungültig' })
    await expect(authenticatedFetch('/api/x')).rejects.toMatchObject({
      status: 400,
      data: { message: 'Ungültig' },
    })
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('meldet bei 401 ab und wirft', async () => {
    respond(401)
    await expect(authenticatedFetch('/api/x')).rejects.toMatchObject({ status: 401, data: null })
    expect(getToken()).toBeNull()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })
})
