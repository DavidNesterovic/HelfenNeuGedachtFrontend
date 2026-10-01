import { isAuthenticated } from '~/assets/utils/auth'

export default defineNuxtRouteMiddleware(() => {
  if (process.client && !isAuthenticated()) {
    return navigateTo('/login')
  }
})
