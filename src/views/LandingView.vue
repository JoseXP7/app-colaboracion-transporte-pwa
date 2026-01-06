<script setup>
import { ScanQrCode, HandHeart } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'

const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user)
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header -->
    <header class="px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold"
        >
          UC
        </div>
        <span class="font-semibold text-slate-900"> UCLAGo </span>
      </div>

      <template v-if="!isLoggedIn">
        <RouterLink to="/login" class="text-sm font-medium text-primary"
          >Iniciar sesión</RouterLink
        >
      </template>
    </header>

    <!-- Hero -->
    <main
      class="flex-1 flex flex-col items-center justify-center px-6 text-start relative overflow-hidden"
    >
      <!-- Floating cards -->
      <div class="relative w-full max-w-sm h-72 mb-12 perspective">
        <!-- Back card -->
        <div
          class="absolute top-0 right-6 w-64 h-36 rounded-3xl bg-white p-4 shadow-xl border card-3d card-back"
        >
          <p class="text-xs text-slate-500">Última colaboración</p>
          <p class="text-xl font-semibold text-slate-900 mt-2">Bs 25,00</p>
          <p class="text-xs text-slate-500 mt-1">UCLAGo</p>
        </div>

        <!-- Front card -->
        <div
          class="absolute top-10 left-6 w-64 h-36 rounded-3xl bg-primary text-white p-4 shadow-2xl card-3d card-front"
        >
          <p class="text-xs opacity-80">Saldo disponible</p>
          <p class="text-2xl font-bold mt-2">Bs 120,00</p>
          <p class="text-xs opacity-70 mt-1">Billetera universitaria</p>
        </div>

        <!-- Floating Scan QR button -->
        <div
          class="absolute bottom-1/4 left-1/4 -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-white shadow-xl border grid place-items-center card-3d card-action"
        >
          <ScanQrCode />
        </div>

        <!-- Floating collaboration button -->
        <div
          class="absolute top-2 right-1/8 -translate-x-1/2 w-14 h-14 rounded-full bg-white text-primary shadow-xl border grid place-items-center card-3d card-action-delayed"
        >
          <HandHeart />
        </div>
      </div>

      <!-- Text -->
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-4">
        Tu transporte,
        <br />
        más simple y digital
      </h1>

      <p class="text-slate-500 max-w-sm mb-10">
        Gestiona tu saldo, colabora de forma segura y accede al transporte
        universitario desde una sola app.
      </p>

      <!-- CTA -->
      <div class="w-full max-w-sm space-y-4">
        <template v-if="!isLoggedIn">
          <RouterLink
            to="/register"
            class="w-full h-14 rounded-2xl bg-primary text-white font-semibold text-base grid items-center justify-center shadow-lg hover:opacity-90 transition active:scale-[0.97]"
          >
            Comenzar
          </RouterLink>

          <RouterLink
            to="/login"
            class="w-full h-14 rounded-2xl bg-slate-100 text-slate-800 grid items-center justify-center font-medium hover:bg-slate-200 transition"
          >
            Ya tengo cuenta
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            to="/resume"
            class="w-full h-14 rounded-2xl bg-primary text-white font-semibold text-base grid items-center justify-center shadow-lg hover:opacity-90 transition active:scale-[0.97]"
          >
            Entrar
          </RouterLink>
        </template>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-xs text-slate-400">
      UCLAGo · v1.0
    </footer>
  </div>
</template>

<style scoped>
.perspective {
  perspective: 1200px;
}

/* Base 3D */
.card-3d {
  transform-style: preserve-3d;
  animation: float-3d 7s ease-in-out infinite;
}

/* Variaciones */
.card-front {
  animation-delay: 0s;
}

.card-back {
  animation-delay: 1.2s;
}

.card-action {
  animation: float-action 5s ease-in-out infinite;
}

.card-action-delayed {
  animation: float-action 5s ease-in-out infinite;
  animation-delay: 1s;
}

/* Animaciones */
@keyframes float-3d {
  0% {
    transform: translateY(0px) rotateX(14deg) rotateY(-10deg);
  }
  50% {
    transform: translateY(-14px) rotateX(18deg) rotateY(10deg);
  }
  100% {
    transform: translateY(0px) rotateX(14deg) rotateY(-10deg);
  }
}

@keyframes float-action {
  0% {
    transform: translateY(0px) rotateZ(0deg);
  }
  50% {
    transform: translateY(-10px) rotateZ(6deg);
  }
  100% {
    transform: translateY(0px) rotateZ(0deg);
  }
}
</style>
