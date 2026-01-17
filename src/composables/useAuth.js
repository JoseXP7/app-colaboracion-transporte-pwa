import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

export function useAuth() {
  const { supabase } = useSupabase()
  const userStore = useUserStore()

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    const session = data.session

    if (!session?.user) {
      userStore.clear()
      return null
    }

    // Fuente de verdad: auth.users
    userStore.setUser(session.user)

    // Cargar profile SIEMPRE que haya sesión
    await userStore.getProfile()

    return session
  }

  const signUpWithPassw = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    userStore.setUser(data.user)
  }

  const loginWithPassw = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    userStore.setUser(data.user)
    await userStore.getProfile()
  }

  const resetPassword = async (email) => {
    // Usa la URL de producción si está en producción, si no usa localhost
    const redirectTo = import.meta.env.VITE_REDIRECT_URL

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
  }

  const resetPasswordWithToken = async (form) => {
    const res = await supabase.auth.updateUser({
      password: form.password,
    })

    if (res?.error) throw res.error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    userStore.clear()

    if (error) throw error
  }

  return {
    getSession,
    signUpWithPassw,
    loginWithPassw,
    signOut,
    resetPassword,
    resetPasswordWithToken,
  }
}
