export function useEventStatus() {
  const normalizeStatus = (statusVal) => {
    if (statusVal === undefined || statusVal === null) return 0
    if (typeof statusVal === 'number') return statusVal
    const parsed = parseInt(statusVal)
    if (!isNaN(parsed)) return parsed
    const map = { Planned: 0, TakePlace: 1, Accomplished: 2, Canceled: 3 }
    return map[statusVal] ?? 0
  }

  const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
      case 0: return 'Entwurf'
      case 1: return 'Veröffentlicht'
      case 2: return 'Durchgeführt'
      case 3: return 'Abgesagt'
      default: return 'Entwurf'
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (normalizeStatus(status)) {
      case 0: return 'bg-slate-100 border-slate-200 text-slate-500'
      case 1: return 'bg-blue-50 border-blue-200 text-blue-600'
      case 2: return 'bg-emerald-50 border-emerald-200 text-emerald-600'
      case 3: return 'bg-red-50 border-red-200 text-red-600'
      default: return 'bg-slate-100 border-slate-200 text-slate-500'
    }
  }

  const needsAttention = (event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = event.endDate ? new Date(event.endDate) : start
    const status = normalizeStatus(event.eventStatus)
    if (start > now && status === 2) return true
    if (end < now && (status === 0 || status === 1)) return true
    return false
  }

  const getAttentionHint = (event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = event.endDate ? new Date(event.endDate) : start
    const status = normalizeStatus(event.eventStatus)
    if (start > now && status === 2) return 'Zukünftiges Event kann nicht durchgeführt sein.'
    if (end < now && (status === 0 || status === 1)) return 'Vergangenes Event sollte durchgeführt oder abgesagt sein.'
    return ''
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  const getInterestedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 0)
  const getAppliedHelpers   = (shift) => (shift.helperList || []).filter(h => h.status === 4)
  const getConfirmedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 1)

  return {
    normalizeStatus,
    getStatusLabel,
    getStatusBadgeClass,
    needsAttention,
    getAttentionHint,
    formatDate,
    getInterestedHelpers,
    getAppliedHelpers,
    getConfirmedHelpers,
  }
}
