<script setup>
import { ref, onMounted } from 'vue'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'

import {
  Wallet,
  Clock,
  Calendar as CalendarIcon,
  ArrowUpRight,
  Loader2,
} from 'lucide-vue-next'

import { format } from 'date-fns'

/* =========================
   STATE
========================= */
const { supabase } = useSupabase()
const userStore = useUserStore()

const loading = ref(false)
const filterOpen = ref(false)

const defaultDate = today(getLocalTimeZone())
const selectedDate = ref(defaultDate)

const filterMode = ref('day') // 'day' | 'month'

const stats = ref({
  total: 0,
  pending: 0,
  today: 0,
})

const recentTransactions = ref([])

/* =========================
   FETCH DATA
========================= */
const fetchData = async () => {
  loading.value = true

  const { data, error } = await supabase.rpc('get_faculty_resume_by_date', {
    p_faculty_id: userStore.profile.faculty_id,
    p_mode: filterMode.value,
    p_date: `${selectedDate.value.year}-${String(
      selectedDate.value.month
    ).padStart(2, '0')}-${String(selectedDate.value.day).padStart(2, '0')}`,
  })

  if (error) {
    console.error(error)
    loading.value = false
    return
  }

  stats.value.total = data.total
  stats.value.pending = data.pending
  stats.value.today = data.today

  recentTransactions.value = data.transactions || []

  loading.value = false
}

/* =========================
   FILTER ACTION
========================= */
const applyFilter = () => {
  filterOpen.value = false
  fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-slate-900">
        <Loader2 v-if="loading" class="animate-spin mr-2 inline" /> Resumen del
        Centro de Estudiantes
      </h1>

      <Button variant="outline" @click="filterOpen = true" class="relative">
        <CalendarIcon class="w-4 h-4 mr-2" />
        Filtro
        <Badge
          v-if="
            filterMode !== 'day' ||
            selectedDate.toString() !== defaultDate.toString()
          "
          class="absolute -top-2 -right-2"
        >
          Activo
        </Badge>
      </Button>
    </div>

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
          <p class="font-semibold text-lg">
            {{ stats.pending }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow flex gap-3">
        <CalendarIcon class="text-green-600" />
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
              {{ format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm') }}
            </p>
          </div>
        </div>

        <span class="font-semibold text-green-600">
          Bs {{ Number(tx.amount_bs).toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- FILTER MODAL -->
    <Dialog :open="filterOpen" @update:open="filterOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar por fecha</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <Select v-model="filterMode">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecciona el modo de filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Día específico</SelectItem>
              <SelectItem value="month">Mes completo</SelectItem>
            </SelectContent>
          </Select>

          <!-- Aquí está el Calendar de shadcn-vue -->
          <Calendar
            v-model="selectedDate"
            locale="es"
            weekday-format="short"
            class="mx-auto rounded-md border shadow-sm w-fit"
          />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="filterOpen = false">
            Cancelar
          </Button>
          <Button @click="applyFilter"> Aplicar filtro </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
