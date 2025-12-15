import { defineStore } from 'pinia'
import { useSupabase } from '@/client/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    profile: null,
  }),

  actions: {
    setUser(userInfo) {
      this.user = userInfo
    },

    async getProfile() {
      if (!this.user?.id) {
        this.profile = null
        return null
      }

      const { supabase } = useSupabase()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle()

      if (error) throw error

      this.profile = data // puede ser null (antes de completeProfile)
      return data
    },

    clear() {
      this.user = null
      this.profile = null
    },
  },

  persist: true,
})
