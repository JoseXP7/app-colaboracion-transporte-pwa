<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { CheckCircle, ChevronLeft } from 'lucide-vue-next'

const router = useRouter()

const scanned = ref(false)
const result = ref('')
const errorMsg = ref('')
const redirectIn = ref(7)
let interval = null

function onDetect([data]) {
  scanned.value = true
  result.value = data.rawValue || data
}

function onError(error) {
  if (error.name === 'NotAllowedError') {
    errorMsg.value = 'Permiso de cámara denegado'
  } else if (error.name === 'NotFoundError') {
    errorMsg.value = 'No se encontró una cámara'
  } else if (error.name === 'InsecureContextError') {
    errorMsg.value = 'Debes usar HTTPS'
  } else {
    errorMsg.value = 'Error al iniciar el escáner'
  }
}

// redirección automática
watch(scanned, (val) => {
  if (val) {
    redirectIn.value = 7

    interval = setInterval(() => {
      redirectIn.value--
      if (redirectIn.value <= 0) {
        clearInterval(interval)
        router.push('/resume')
      }
    }, 1000)
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header | Recordatorio: Ocultar el link al escanear exitosamente -->
    <div class="flex items-center gap-4 mb-6">
      <RouterLink
        to="/resume"
        class="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center text-slate-600"
      >
        <ChevronLeft size="20" />
      </RouterLink>
    </div>
    <div
      class="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md flex flex-col items-center gap-4"
    >
      <h1 class="text-lg font-semibold text-slate-900">Escanear QR</h1>
      <p class="text-sm text-slate-500 text-center">
        Apunta la cámara al código QR
      </p>

      <!-- ERROR -->
      <div
        v-if="errorMsg"
        class="w-full rounded-xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-700"
      >
        {{ errorMsg }}
      </div>

      <!-- SCANNER -->
      <div class="relative">
        <QrcodeStream
          v-if="!errorMsg"
          :paused="scanned"
          @detect="onDetect"
          @error="onError"
          class="w-72 h-72 rounded-2xl overflow-hidden border-2 border-primary/40"
        />

        <!-- SUCCESS OVERLAY -->
        <div
          v-if="scanned"
          class="absolute inset-0 bg-green-600/90 rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in zoom-in"
        >
          <CheckCircle class="w-16 h-16 mb-2" />
          <p class="font-semibold text-lg">Pago detectado</p>
          <p class="text-sm opacity-90 mt-1">
            Redirigiendo al inicio en
            <span class="font-semibold tabular-nums"> {{ redirectIn }}s </span>
          </p>
          <div class="w-32 h-1 bg-white/30 rounded-full mt-3 overflow-hidden">
            <div
              class="h-full bg-white transition-all duration-1000"
              :style="{ width: `${(redirectIn / 7) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mantén la estética de las cards y botones */
</style>
