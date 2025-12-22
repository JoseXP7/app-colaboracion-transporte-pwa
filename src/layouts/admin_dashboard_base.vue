<script setup>
import { RouterView, RouterLink } from 'vue-router'
import {
  LayoutDashboard,
  QrCode,
  ArrowDownUp,
  CreditCard,
  LogOut,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const facultyAcronyms = {
  1: 'DCS',
  2: 'DCEE',
  3: 'DAG',
  4: 'DCV',
  5: 'DCYT',
  6: 'DEHA',
  7: 'DIC',
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    <!-- SIDEBAR -->
    <aside class="w-64 bg-white border-r hidden md:flex flex-col">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold text-slate-900">CE Dashboard</h2>
        <p class="text-xs text-slate-500">
          {{
            facultyAcronyms[userStore.profile?.faculty_id] ||
            userStore.profile.faculty_id
          }}
        </p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          to="/ce"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <LayoutDashboard class="w-4 h-4" />
          Resumen
        </RouterLink>

        <RouterLink
          to="/ce/topups-requests"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <ArrowDownUp class="w-4 h-4" />
          Recargas
        </RouterLink>

        <RouterLink
          to="/ce/qr"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <QrCode class="w-4 h-4" />
          QRs
        </RouterLink>

        <RouterLink
          to="/ce/pagos"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <CreditCard class="w-4 h-4" />
          Datos de pago
        </RouterLink>
      </nav>

      <div class="p-4 border-t">
        <Button variant="outline" class="w-full" @click="userStore.logout()">
          <LogOut class="w-4 h-4 mr-2" /> Salir
        </Button>
      </div>
    </aside>

    <!-- CONTENT -->
    <div class="flex-1 flex flex-col">
      <!-- TOP BAR -->
      <header class="bg-white border-b p-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-slate-900">
          Panel del Centro de Estudiantes
        </h1>
        <span class="text-sm text-slate-500">{{ userStore.user?.email }}</span>
      </header>

      <!-- PAGE -->
      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* layout base */
</style>
