import { getAuthHeader } from '~/assets/utils/auth'

export const useCurrentUser = () => {
  const config = useRuntimeConfig()

  const user = useState('current-user', () => null)
  const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
  const avatarUrl = computed(() => user.value?.avatarUrl ? `${apiBase.value}${user.value.avatarUrl}` : null)

  const refresh = async () => {
    try {
      user.value = await $fetch(`${config.public.apiBase}/User/me`, {
        headers: { Authorization: getAuthHeader() },
      })
    } catch {}
  }

  return { user, avatarUrl, refresh }
}
