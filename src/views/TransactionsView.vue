<script setup>
import { ref, onMounted } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import { useTransactions } from '@/composables/useTransactions'
import TransactionItem from '@/components/TransactionItem.vue'
import { toast } from 'vue-sonner'

const transactions = ref([])
const loading = ref(true)

const { fetchTransactions } = useTransactions()

onMounted(async () => {
  try {
    transactions.value = await fetchTransactions(50)
  } catch (e) {
    toast.error(e.message, {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  } finally {
    loading.value = false
  }
})
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

    <!-- Empty state -->
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
</template>
