<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

import { Wallet, Clock, Calendar, ArrowUpRight } from 'lucide-vue-next'

const { supabase } = useSupabase()
const userStore = useUserStore()

const loading = ref(true)

const stats = ref({
  total: 0,
  pending: 0,
  today: 0,
})

const recentTransactions = ref([])

onMounted(async () => {
  loading.value = true

  const facultyId = userStore.profile.faculty_id

  // TOTAL RECAUDADO (Recargas aprobadas)
  const { data: totalTx } = await supabase
    .from('transactions')
    .select('amount_bs')
    .eq('faculty_id', facultyId)
    .eq('type', 'recarga')

  stats.value.total =
    totalTx?.reduce((acc, t) => acc + Number(t.amount_bs), 0) || 0

  // RECARGAS PENDIENTES
  const { count } = await supabase
    .from('topup_requests')
    .select('*', { count: 'exact', head: true })
    .eq('faculty_id', facultyId)
    .eq('status', 'pendiente')

  stats.value.pending = count || 0

  // RECAUDADO HOY
  const today = new Date().toISOString().split('T')[0]

  const { data: todayTx } = await supabase
    .from('transactions')
    .select('amount_bs')
    .eq('faculty_id', facultyId)
    .gte('created_at', `${today}T00:00:00`)

  stats.value.today =
    todayTx?.reduce((acc, t) => acc + Number(t.amount_bs), 0) || 0

  // ÚLTIMAS TRANSACCIONES
  const { data } = await supabase
    .from('transactions')
    .select('id, amount_bs, type, created_at')
    .eq('faculty_id', facultyId)
    .order('created_at', { ascending: false })
    .limit(5)

  recentTransactions.value = data || []

  loading.value = false
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900">
      Resumen del Centro de Estudiantes
    </h1>

    <!-- STATS -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-4 shadow flex gap-3">
        <Wallet class="text-primary" />
        <div>
          <p class="text-xs text-slate-500">Total recaudado</p>
          <p class="font-semibold text-lg">Bs {{ stats.total.toFixed(2) }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow flex gap-3">
        <Clock class="text-amber-500" />
        <div>
          <p class="text-xs text-slate-500">Recargas pendientes</p>
          <p class="font-semibold text-lg">{{ stats.pending }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow flex gap-3">
        <Calendar class="text-green-600" />
        <div>
          <p class="text-xs text-slate-500">Recaudado hoy</p>
          <p class="font-semibold text-lg">Bs {{ stats.today.toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- TRANSACTIONS -->
    <div class="bg-white rounded-2xl shadow p-4">
      <h2 class="text-sm font-semibold mb-3">Últimas transacciones</h2>

      <div
        v-if="recentTransactions.length === 0"
        class="text-sm text-slate-500"
      >
        No hay movimientos recientes
      </div>

      <div
        v-for="tx in recentTransactions"
        :key="tx.id"
        class="flex justify-between items-center py-2 border-b last:border-b-0"
      >
        <div class="flex items-center gap-2">
          <ArrowUpRight class="text-primary" />
          <div>
            <p class="text-sm font-medium">
              {{ tx.type }}
            </p>
            <p class="text-xs text-slate-500">
              {{ new Date(tx.created_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <span class="font-semibold text-green-600">
          Bs {{ Number(tx.amount_bs).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>
