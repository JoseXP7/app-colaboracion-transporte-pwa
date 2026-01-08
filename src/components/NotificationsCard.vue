<script setup>
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/composables/usePushNotifications'

const { permission, loading, error, enableNotifications } =
  usePushNotifications()

const activate = async () => {
  await enableNotifications()
}
</script>

<template>
  <div class="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
    <h3 class="font-semibold flex items-center gap-2">🔔 Notificaciones</h3>

    <p class="text-sm text-slate-500">
      Recibe una notificación cuando tu recarga sea aprobada.
    </p>

    <!-- BOTÓN -->
    <Button
      v-if="permission === 'default'"
      :disabled="loading"
      @click="activate"
    >
      {{ loading ? 'Activando…' : 'Activar notificaciones' }}
    </Button>

    <!-- ESTADO OK -->
    <div
      v-else-if="permission === 'granted'"
      class="text-sm text-green-600 font-medium"
    >
      ✅ Notificaciones activadas correctamente
    </div>

    <!-- BLOQUEADO -->
    <div v-else class="text-sm text-red-500">
      ❌ Las notificaciones están bloqueadas en tu navegador
    </div>

    <!-- ERROR -->
    <p v-if="error" class="text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
