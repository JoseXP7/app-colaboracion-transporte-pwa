import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/userStore'

export const ceGuard = async (to, from, next) => {
  const { getSession } = useAuth()
  const userStore = useUserStore()

  // 1. Sesión
  const session = await getSession()
  if (!session) {
    return next('/login')
  }

  // 2. Usuario en store
  if (!userStore.user) {
    userStore.setUser(session.user)
  }

  // 3. Perfil
  let profile = userStore.profile
  if (!profile) {
    try {
      profile = await userStore.getProfile()
    } catch {
      profile = null
    }
  }

  // 4. Sin perfil → completar
  if (!profile) {
    return next('/complete-profile')
  }

  // 5. Rol CE
  if (profile.role !== 'ce_admin') {
    return next('/resume')
  }

  next()
}
