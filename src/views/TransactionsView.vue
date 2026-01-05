<script setup>
import { ref, onMounted, computed } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { useTransactions } from '@/composables/useTransactions'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'
import TransactionItem from '@/components/TransactionItem.vue'
import { toast } from 'vue-sonner'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const activeTab = ref('transactions') // transactions | topups

const { supabase } = useSupabase()

const transactions = ref([])
const topups = ref([])
const loading = ref(true)
const loadingTopups = ref(false)
const { range, dateRange } = useDateRangeFilter()
const page = ref(1)
const limit = 10
const userStore = useUserStore()

const { fetchTransactions } = useTransactions()

const loadTransactions = async () => {
  loading.value = true
  try {
    transactions.value = await fetchTransactions({
      limit,
      page: page.value,
      range: range.value,
    })
  } catch (e) {
    toast.error(e.message)
  } finally {
    loading.value = false
  }
}

const fetchTopups = async () => {
  loadingTopups.value = true
  try {
    const { data, error } = await supabase
      .from('topup_requests')
      .select('id, amount_bs, reference, status, created_at')
      .eq('user_id', userStore.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    topups.value = data
  } catch (e) {
    toast.error('Error cargando solicitudes de recarga ' + e.message, {
      position: 'bottom-right',
      duration: 5000,
    })
  } finally {
    loadingTopups.value = false
  }
}

const filteredTopups = computed(() => {
  if (!topups.value.length) return []
  const { start, end } = dateRange.value
  return topups.value.filter((topup) => {
    const created = new Date(topup.created_at)
    return created >= start && created <= end
  })
})

const prevPage = () => {
  if (page.value === 1) return
  page.value--
  loadTransactions()
}

const nextPage = () => {
  page.value++
  loadTransactions()
}

const switchTab = async (tab) => {
  activeTab.value = tab
  if (tab === 'topups') {
    await fetchTopups()
  }
}

const badgeClass = (status) => {
  if (status === 'aprobada')
    return 'bg-green-100 text-green-700 border-green-200'

  if (status === 'pendiente')
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'

  if (status === 'rechazada') return 'bg-red-100 text-red-700 border-red-200'

  return ''
}

const statusLabel = (status) => {
  if (status === 'aprobada') return 'Aprobada'
  if (status === 'rechazada') return 'Rechazada'
  return 'En proceso'
}

onMounted(loadTransactions)
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <RouterLink
        to="/resume"
        class="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center text-slate-600"
      >
        <ChevronLeft size="20" />
      </RouterLink>

      <h1 class="text-lg font-semibold text-slate-900 tracking-tight">
        Transacciones
      </h1>
    </div>

    <!-- Tabs -->
    <div class="flex bg-white rounded-2xl shadow mb-6 overflow-hidden">
      <button
        class="flex-1 py-3 text-sm font-medium"
        :class="
          activeTab === 'transactions'
            ? 'bg-primary text-white'
            : 'text-slate-600'
        "
        @click="switchTab('transactions')"
      >
        Transacciones
      </button>

      <button
        class="flex-1 py-3 text-sm font-medium"
        :class="
          activeTab === 'topups' ? 'bg-primary text-white' : 'text-slate-600'
        "
        @click="switchTab('topups')"
      >
        Recargas
      </button>
    </div>

    <!-- Filter Buttons -->
    <div class="flex justify-between items-center mb-4">
      <div class="w-40">
        <Select
          v-model="range"
          @update:modelValue="
            () => {
              page = 1
              loadTransactions()
              if (activeTab === 'topups') fetchTopups()
            }
          "
        >
          <SelectTrigger>
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoy</SelectItem>
            <SelectItem value="week">Últimos 7 días</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <span class="text-xs text-slate-500"> Página {{ page }} </span>
    </div>

    <!-- TAB: Transacciones -->
    <div v-if="activeTab === 'transactions'">
      <div
        v-if="loading || transactions.length === 0"
        class="bg-white rounded-3xl shadow p-6 text-center text-slate-500"
      >
        {{
          loading
            ? 'Cargando transacciones…'
            : 'No hay transacciones registradas'
        }}
      </div>

      <div v-else class="space-y-3">
        <TransactionItem
          v-for="tx in transactions"
          :key="tx.id"
          :transaction="tx"
        />
      </div>
    </div>

    <!-- TAB: Recargas -->
    <div v-if="activeTab === 'topups'">
      <div v-if="loadingTopups" class="text-center text-slate-500">
        Cargando solicitudes…
      </div>
      <div
        v-else-if="filteredTopups.length === 0"
        class="bg-white rounded-3xl shadow p-6 text-center text-slate-500"
      >
        No hay recargas en este periodo
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="topup in filteredTopups"
          :key="topup.id"
          class="bg-white rounded-2xl shadow p-4 space-y-2"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-slate-900">
                Bs {{ topup.amount_bs.toFixed(2) }}
              </p>
              <p class="text-xs text-slate-500">
                {{ new Date(topup.created_at).toLocaleDateString() }}
              </p>
            </div>
            <Badge
              variant="outline"
              :class="[badgeClass(topup.status), 'capitalize tracking-wide']"
            >
              {{ statusLabel(topup.status) }}
            </Badge>
          </div>
          <p class="text-sm text-slate-600">
            <strong>Referencia:</strong> {{ topup.reference }}
          </p>
          <p v-if="topup.status === 'pendiente'" class="text-xs text-slate-500">
            Tu recarga está siendo revisada por el Centro de Estudiantes
          </p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6">
      <Button
        variant="outline"
        size="sm"
        :disabled="page === 1"
        @click="prevPage"
      >
        Anterior
      </Button>

      <Button
        variant="outline"
        size="sm"
        :disabled="transactions.length < limit"
        @click="nextPage"
      >
        Siguiente
      </Button>
    </div>
  </div>
</template>
