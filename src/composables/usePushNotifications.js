import { ref } from 'vue'
import { messaging, getToken } from '@/lib/firebase'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

export function usePushNotifications() {
  const permission = ref(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const loading = ref(false)
  const error = ref(null)

  const { supabase } = useSupabase()
  const userStore = useUserStore()

  const enableNotifications = async () => {
    error.value = null
    loading.value = true

    try {
      if (!('Notification' in window)) {
        throw new Error('Este navegador no soporta notificaciones')
      }

      const result = await Notification.requestPermission()
      permission.value = result

      if (result !== 'granted') {
        throw new Error('Permiso de notificaciones denegado')
      }

      const token = await getToken(messaging)

      if (!token) {
        throw new Error('No se pudo obtener el token de notificación')
      }

      await supabase.from('user_push_tokens').upsert({
        user_id: userStore.user.id,
        fcm_token: token,
      })

      return token
    } catch (err) {
      console.error('[Push notifications]', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    permission,
    loading,
    error,
    enableNotifications,
  }
}
