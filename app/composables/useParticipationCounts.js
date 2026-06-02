import { getAuthHeader } from '~/assets/utils/auth'

export const useParticipationCounts = () => {
  const config = useRuntimeConfig()

  const interestedCount = useState('participation-interested-count', () => 0)
  const upcomingCount = useState('participation-upcoming-count', () => 0)

  const refresh = async () => {
    try {
      const parts = await $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      })
      interestedCount.value = (parts || []).filter(p => p.status === 0).length
      upcomingCount.value = (parts || []).filter(p => p.status === 1 || p.status === 4).length
    } catch {
      // silently ignore — nav badges are best-effort
    }
  }

  return { interestedCount, upcomingCount, refresh }
}
