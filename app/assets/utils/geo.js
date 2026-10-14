// Anzeige der Luftlinie zum Suchstandort, z. B. "12 km entfernt".
export const formatDistance = (km) => {
  if (km === null || km === undefined || !Number.isFinite(Number(km))) return ''
  const value = Number(km)
  if (value < 1) return '< 1 km entfernt'
  if (value < 10) return `${value.toLocaleString('de-AT', { maximumFractionDigits: 1 })} km entfernt`
  return `${Math.round(value)} km entfernt`
}
