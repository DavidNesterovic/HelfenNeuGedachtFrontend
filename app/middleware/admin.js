import { isAuthenticated, hasRole, getHomeRoute } from '~/assets/utils/auth'

// Nur für SuperAdmins. Die eigentliche Prüfung macht die API (403), das hier spart nur den Umweg.
export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return
  if (!isAuthenticated()) return navigateTo('/login')
  if (!hasRole('SuperAdmin')) return navigateTo(getHomeRoute())
})
