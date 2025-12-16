<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import { Loader2, QrCode, ChevronLeft } from 'lucide-vue-next'
import { useSupabase } from '@/client/supabase'
import { generateQrSchema } from '@/schemas/qr.schema'

const { supabase } = useSupabase()

const amount = ref(0)
const token = ref(null)
const loading = ref(false)
const errors = ref({})

const generateQr = async () => {
  errors.value = {}
  token.value = null
  loading.value = true

  const result = generateQrSchema.safeParse({
    amount_bs: amount.value,
  })

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      errors.value[field] = issue.message
    })
    loading.value = false
    return
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate_qr', {
      body: {
        amount_bs: result.data.amount_bs,
      },
    })

    if (error) throw error

    token.value = data.token

    toast.success('QR generado correctamente', {
      position: 'bottom-right',
    })
  } catch (err) {
    toast.error(err.message || 'Error generando el QR', {
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
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <RouterLink
        to="/resume"
        class="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center text-slate-600"
      >
        <ChevronLeft size="20" />
      </RouterLink>
      <div
        class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
      >
        <QrCode />
      </div>

      <div>
        <h1 class="text-lg font-semibold text-slate-900">
          Generar QR de cobro
        </h1>
        <p class="text-sm text-slate-500">Crea un QR para recibir pagos</p>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-lg p-6 space-y-6 max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel for="amount">Monto (Bs)</FieldLabel>
          <Input
            id="amount"
            type="number"
            placeholder="Ej: 25"
            v-model.number="amount"
            :aria-invalid="!!errors.amount_bs"
          />
          <FieldError v-if="errors.amount_bs">
            {{ errors.amount_bs }}
          </FieldError>
        </Field>
      </FieldGroup>

      <Button class="w-full" size="lg" :disabled="loading" @click="generateQr">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ loading ? 'Generando...' : 'Generar QR' }}
      </Button>

      <!-- Token -->
      <div
        v-if="token"
        class="rounded-2xl bg-slate-50 border border-slate-200 p-4"
      >
        <p class="text-xs text-slate-500 mb-1">Token generado</p>
        <p class="text-sm font-mono break-all text-slate-900">
          {{ token }}
        </p>
      </div>
    </div>
  </div>
</template>
