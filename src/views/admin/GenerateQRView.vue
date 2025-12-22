<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import { Loader2, QrCode, Copy } from 'lucide-vue-next'
import { useSupabase } from '@/client/supabase'
import { generateQrSchema } from '@/schemas/qr.schema'

const { supabase } = useSupabase()

const amount = ref(0)
const token = ref(null)
const qrDataUrl = ref(null)
const loading = ref(false)
const errors = ref({})

const generateQr = async () => {
  errors.value = {}
  token.value = null
  qrDataUrl.value = null
  loading.value = true

  const result = generateQrSchema.safeParse({
    amount_bs: amount.value,
  })

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
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

    // generar QR visual
    qrDataUrl.value = await QRCode.toDataURL(data.token, {
      width: 240,
      margin: 2,
    })

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

const copyToken = () => {
  if (!token.value) return
  navigator.clipboard.writeText(token.value)
  toast.success('Token copiado')
}
</script>

<template>
  <div class="space-y-6 max-w-xl">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div
        class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
      >
        <QrCode />
      </div>
      <div>
        <h1 class="text-xl font-semibold text-slate-900">
          Generar QR de cobro
        </h1>
        <p class="text-sm text-slate-500">
          Crea un QR para recibir pagos rápidos
        </p>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-sm p-6 space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Monto (Bs)</FieldLabel>
          <Input type="number" placeholder="Ej: 25" v-model.number="amount" />
          <FieldError v-if="errors.amount_bs">
            {{ errors.amount_bs }}
          </FieldError>
        </Field>
      </FieldGroup>

      <Button class="w-full" size="lg" :disabled="loading" @click="generateQr">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        {{ loading ? 'Generando…' : 'Generar QR' }}
      </Button>

      <!-- RESULT -->
      <div
        v-if="token"
        class="border border-slate-200 rounded-2xl p-4 space-y-4"
      >
        <div class="flex justify-center">
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR generado"
            class="rounded-xl border"
          />
        </div>

        <div class="bg-slate-50 rounded-xl p-3 text-sm font-mono break-all">
          {{ token }}
        </div>

        <Button variant="outline" size="sm" class="w-full" @click="copyToken">
          <Copy class="w-4 h-4 mr-2" />
          Copiar token
        </Button>
      </div>
    </div>
  </div>
</template>
