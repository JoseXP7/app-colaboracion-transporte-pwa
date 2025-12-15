import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

export function useAuth() {
  const { supabase } = useSupabase()
  const userStore = useUserStore()

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data.session?.user) {
      userStore.setUser(data.session.user)
      if (!userStore.profile) {
        await userStore.getProfile()
      }
    }
    return data.session
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
    const redirectTo =
      import.meta.env.VITE_REDIRECT_URL ||
      'http://localhost:5173/reset-password'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
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
  }
}
