<script setup>
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next'

const props = defineProps({
  transaction: Object,
})
</script>

<template>
  <div
    class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"
  >
    <div class="flex items-center gap-3">
      <div
        :class="[
          'p-2 rounded-md',
          transaction.sign === '-'
            ? 'bg-red-100 text-red-500'
            : 'bg-green-100 text-green-600',
        ]"
      >
        <ArrowDownRight v-if="transaction.sign === '-'" />
        <ArrowUpRight v-else />
      </div>

      <div>
        <p class="text-sm font-medium text-slate-900">
          {{
            transaction.type === 'pago' ? 'Colaboración transporte' : 'Recarga'
          }}
        </p>
        <p class="text-xs text-slate-500">
          {{ new Date(transaction.created_at).toLocaleString() }}
        </p>
      </div>
    </div>

    <span
      :class="[
        'text-sm font-semibold',
        transaction.sign === '-' ? 'text-red-500' : 'text-green-600',
      ]"
    >
      {{ transaction.sign }} Bs {{ transaction.amount_bs }}
    </span>
  </div>
</template>
