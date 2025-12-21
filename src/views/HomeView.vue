<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import TransactionItem from '@/components/TransactionItem.vue'
import { toast } from 'vue-sonner'
import {
  BanknoteArrowUp,
  ScanQrCode,
  ReceiptText,
  User,
  Bell,
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useSupabase } from '@/client/supabase'

const userStore = useUserStore()
const profile = computed(() => userStore.profile)
const user = computed(() => userStore.user)

const wallet = ref(0)
const walletLoading = ref(true)
const transactions = ref([])

const initials = computed(() => {
  if (!profile.value) return '?'
  return (
    profile.value.first_name.charAt(0) + profile.value.last_name.charAt(0)
  ).toUpperCase()
})

const { supabase } = useSupabase()
const { fetchTransactions } = useTransactions()

onMounted(async () => {
  if (!user.value?.id) return
  walletLoading.value = true
  const { data, error } = await supabase
    .from('wallets')
    .select('balance_bs')
    .eq('user_id', user.value.id)
    .maybeSingle()

  wallet.value = data?.balance_bs ?? 0
  walletLoading.value = false

  transactions.value = await fetchTransactions(4)
  if (error) {
    toast.error(error.message, {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div
          class="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold"
        >
          {{ initials }}
        </div>
        <div>
          <p class="text-sm font-medium text-slate-900">
            {{ profile.first_name }} {{ profile.last_name }}
          </p>
          <p class="text-xs text-slate-500">Estudiante</p>
        </div>
      </div>

      <Button
        size="icon"
        variant="outline"
        class="rounded-full w-10 h-10 shadow"
      >
        <Bell />
      </Button>
    </div>

    <!-- Balance Card -->
    <div class="rounded-3xl bg-primary text-white p-6 shadow-xl mb-6">
      <p class="text-sm opacity-80">Saldo disponible</p>
      <h2 class="text-3xl font-bold mt-2 flex items-center gap-2">
        Bs
        {{
          Number(wallet).toLocaleString('es-VE', {
            minimumFractionDigits: 2,
          })
        }}
        <Spinner class="size-6" v-if="walletLoading" />
      </h2>
      <p class="text-xs opacity-80 mt-1">Tu saldo actual en la billetera</p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <!-- Recarga -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/topup-request"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <BanknoteArrowUp />
        </RouterLink>
        <span class="text-xs text-slate-600">Recargar</span>
      </div>

      <!-- Scan QR -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/scan-qr"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <ScanQrCode />
        </RouterLink>
        <span class="text-xs text-slate-600">Escanear</span>
      </div>

      <!-- Movements -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/transactions"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <ReceiptText />
        </RouterLink>
        <span class="text-xs text-slate-600">Movimientos</span>
      </div>

      <!-- Profile -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="profile"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <User />
        </RouterLink>
        <span class="text-xs text-slate-600">Perfil</span>
      </div>
    </div>

    <!-- Transactions -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-slate-900">
          Transacciones recientes
        </h3>
        <RouterLink to="/transactions" class="text-sm text-primary font-medium"
          >Ver todas</RouterLink
        >
      </div>

      <div class="space-y-3">
        <div
          v-if="transactions.length === 0"
          class="bg-white rounded-3xl shadow p-6 text-center text-slate-500"
        >
          No hay transacciones registradas
        </div>

        <!-- List -->
        <div v-if="loading" class="text-center text-slate-500">
          Cargando transacciones…
        </div>

        <div v-else class="space-y-3">
          <TransactionItem
            v-for="tx in transactions"
            :key="tx.id"
            :transaction="tx"
          />
        </div>
      </div>
    </div>
  </div>
</template>
