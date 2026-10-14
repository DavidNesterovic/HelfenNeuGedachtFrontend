// Ortssuche über GET /geo/search (Backend-Proxy für Photon/OpenStreetMap).
// Tippen löst die Suche erst nach einer kurzen Pause aus. Ältere Anfragen werden abgebrochen,
// damit eine langsame Antwort nicht die Treffer der neueren Eingabe überschreibt.
export const GEO_MIN_QUERY_LENGTH = 3
export const GEO_DEBOUNCE_MS = 300
export const CURRENT_LOCATION_LABEL = 'Mein Standort'

export const useGeoSearch = ({ debounceMs = GEO_DEBOUNCE_MS } = {}) => {
  const config = useRuntimeConfig()

  const results = ref([])
  const loading = ref(false)
  const error = ref(false)

  let timer = null
  let controller = null

  const cancel = () => {
    clearTimeout(timer)
    timer = null
    controller?.abort()
    controller = null
  }

  const run = async (query) => {
    controller = new AbortController()
    const current = controller
    loading.value = true
    error.value = false
    try {
      const data = await $fetch(`${config.public.apiBase}/geo/search`, {
        params: { q: query },
        signal: current.signal,
      })
      if (current.signal.aborted) return
      results.value = Array.isArray(data) ? data : []
    } catch {
      if (current.signal.aborted) return
      results.value = []
      error.value = true
    } finally {
      if (controller === current) {
        loading.value = false
        controller = null
      }
    }
  }

  const search = (query) => {
    cancel()
    const q = (query ?? '').trim()
    if (q.length < GEO_MIN_QUERY_LENGTH) {
      results.value = []
      loading.value = false
      error.value = false
      return
    }
    loading.value = true
    timer = setTimeout(() => run(q), debounceMs)
  }

  const clear = () => {
    cancel()
    results.value = []
    loading.value = false
    error.value = false
  }

  if (getCurrentInstance()) onBeforeUnmount(cancel)

  return { results, loading, error, search, clear }
}
