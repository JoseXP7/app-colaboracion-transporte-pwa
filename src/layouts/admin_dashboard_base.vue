<script setup>
import { ref, computed, watch } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  QrCode,
  ArrowDownUp,
  ChartNoAxesCombined,
  CreditCard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const isSidebarOpen = ref(false)
const isQrOpen = ref(false)

/**
 * Abre automáticamente el dropdown
 * si estamos en alguna ruta /ce/qr/*
 */
const isQrRoute = computed(() => route.path.startsWith('/ce/qr'))

if (isQrRoute.value) {
  isQrOpen.value = true
}

const facultyAcronyms = {
  1: 'DCS',
  2: 'DCEE',
  3: 'DAG',
  4: 'DCV',
  5: 'DCYT',
  6: 'DEHA',
  7: 'DIC',
}

watch(isQrRoute, (val) => {
  if (val) isQrOpen.value = true
})
</script>

<template>
  <div class="h-screen bg-slate-100 flex overflow-hidden">
    <!-- OVERLAY (solo móvil) -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/40 z-30 md:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- SIDEBAR -->
    <aside
      class="fixed z-40 inset-y-0 left-0 w-64 bg-white border-r flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 md:flex h-screen overflow-y-auto"
      :class="{
        '-translate-x-full md:translate-x-0': !isSidebarOpen,
        'translate-x-0': isSidebarOpen,
      }"
    >
      <div class="p-6 border-b flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900">CE Dashboard</h2>
          <p class="text-xs text-slate-500">
            {{
              facultyAcronyms[userStore.profile?.faculty_id] ||
              userStore.profile?.faculty_id
            }}
          </p>
        </div>

        <!-- Cerrar en móvil -->
        <Button
          class="md:hidden text-slate-500"
          variant="outline"
          @click="isSidebarOpen = false"
        >
          <X class="w-5 h-5" />
        </Button>
      </div>

      <!-- NAV -->
      <nav class="flex-1 p-4 space-y-1">
        <!-- Resumen -->
        <RouterLink
          to="/ce/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          active-class="bg-slate-100 text-slate-900 font-medium"
          @click="isSidebarOpen = false"
        >
          <LayoutDashboard class="w-4 h-4" />
          Resumen
        </RouterLink>

        <!-- Recargas -->
        <RouterLink
          to="/ce/topups-requests"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          active-class="bg-slate-100 text-slate-900 font-medium"
          @click="isSidebarOpen = false"
        >
          <ArrowDownUp class="w-4 h-4" />
          Recargas
        </RouterLink>

        <!-- Estadisticas -->
        <RouterLink
          to="/ce/statistics"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          active-class="bg-slate-100 text-slate-900 font-medium"
          @click="isSidebarOpen = false"
        >
          <ChartNoAxesCombined class="w-4 h-4" />
          Estadísticas
        </RouterLink>

        <!-- QRs -->
        <button
          @click="isQrOpen = !isQrOpen"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          :class="{ 'bg-slate-100 text-slate-900 font-medium': isQrRoute }"
        >
          <div class="flex items-center gap-3">
            <QrCode class="w-4 h-4" />
            QRs
          </div>
          <ChevronDown
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isQrOpen }"
          />
        </button>

        <div v-show="isQrOpen" class="ml-7 mt-1 space-y-1">
          <RouterLink
            to="/ce/qr/generate"
            class="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            active-class="bg-slate-100 text-slate-900 font-medium"
            @click="isSidebarOpen = false"
          >
            Generar QR
          </RouterLink>

          <RouterLink
            to="/ce/qr/list"
            class="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            active-class="bg-slate-100 text-slate-900 font-medium"
            @click="isSidebarOpen = false"
          >
            Lista de QRs
          </RouterLink>
        </div>

        <!-- Datos de pago -->
        <RouterLink
          to="/ce/payment-info"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          active-class="bg-slate-100 text-slate-900 font-medium"
          @click="isSidebarOpen = false"
        >
          <CreditCard class="w-4 h-4" />
          Datos de pago
        </RouterLink>
      </nav>

      <div class="p-4 border-t">
        <Button class="w-full mb-2" @click="router.push('/profile')">
          <User class="w-4 h-4 mr-2" />
          Ir a Perfil
        </Button>
      </div>
    </aside>

    <!-- CONTENT -->
    <div class="flex-1 flex flex-col overflow-y-auto">
      <!-- TOP BAR -->
      <header class="bg-white border-b p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- BOTÓN MOBILE -->
          <Button
            class="md:hidden text-slate-600"
            variant="outline"
            @click="isSidebarOpen = true"
          >
            <Menu class="w-6 h-6" />
          </Button>

          <h1 class="text-lg font-semibold text-slate-900">Panel del CE</h1>
        </div>

        <span class="text-sm text-slate-500">
          {{ userStore.user?.email }}
        </span>
      </header>

      <!-- PAGE -->
      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Layout base consistente */
</style>
