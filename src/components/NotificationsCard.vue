<script setup>
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/composables/usePushNotifications'

const { permission, enableNotifications, loading, error } =
  usePushNotifications()
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow space-y-2">
    <h3 class="font-semibold text-sm">Notificaciones</h3>

    <p class="text-xs text-slate-500">
      Recibe un aviso cuando tu recarga sea aprobada.
    </p>

    <Button
      v-if="permission === 'default'"
      :disabled="loading"
      @click="enableNotifications"
    >
      Activar notificaciones
    </Button>

    <p v-if="permission === 'granted'" class="text-green-600 text-xs">
      Notificaciones activadas
    </p>

    <p v-if="permission === 'denied'" class="text-red-600 text-xs">
      Notificaciones bloqueadas por el navegador
    </p>

    <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
  </div>
</template>
