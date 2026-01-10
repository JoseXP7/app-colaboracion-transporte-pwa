<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import {
  ChevronLeft,
  CreditCard,
  Copy,
  ClipboardCheck,
  CheckCircle,
  Loader2,
  ChevronDownIcon,
} from 'lucide-vue-next'

import { topupSchema } from '@/schemas/topup.schema'
import { useSupabase } from '@/client/supabase'

const { supabase } = useSupabase()

const router = useRouter()

import { useUserStore } from '@/stores/userStore'
import { usePaymentMobileInfo } from '@/composables/usePaymentMobileInfo'

const userStore = useUserStore()
const { paymentInfo, loading, fetchPaymentInfo } = usePaymentMobileInfo()

onMounted(() => {
  fetchPaymentInfo(userStore.profile.faculty_id)
})

const step = ref(1)

// paso 2
const form = ref({
  amount_bs: 0.0,
  reference: '',
  date: '',
})

const rawAmount = ref('')

const selectedDate = ref(null)
const calendarOpen = ref(false)
// Sincroniza la fecha seleccionada con el formulario
watch(selectedDate, (date) => {
  if (date) {
    // Ajustar a zona local para evitar desfase de día
    const localDate = new Date(date)
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset())
    form.value.date = format(localDate, 'yyyy-MM-dd')
  } else {
    form.value.date = ''
  }
})

const amountModel = computed({
  get() {
    if (!rawAmount.value) return ''
    const value = Number(rawAmount.value) / 100
    return value.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  },
  set(val) {
    const digits = val.replace(/\D/g, '')
    rawAmount.value = digits
    form.value.amount_bs = digits ? Number(digits) / 100 : 0
  },
})

const errors = ref({})
const submitting = ref(false)

const copyPaymentInfo = () => {
  if (!paymentInfo.value) return

  const text = `
  ${paymentInfo.value.cedula}
  ${paymentInfo.value.phone}
  ${paymentInfo.value.bank}
  `.trim()

  navigator.clipboard.writeText(text)

  toast.success('Datos de pago copiados', {
    position: 'bottom-right',
  })
}

const nextStep = async () => {
  // STEP 1 → 2
  if (step.value === 1) {
    step.value = 2
    return
  }

  // STEP 2 → submit
  if (step.value === 2) {
    errors.value = {}

    const result = topupSchema.safeParse(form.value)

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        errors.value[field] = issue.message
      })
      return
    }

    submitting.value = true

    try {
      const { error } = await supabase.from('topup_requests').insert({
        user_id: userStore.user.id,
        faculty_id: userStore.profile.faculty_id,
        amount_bs: form.value.amount_bs,
        reference: form.value.reference,
        date: form.value.date,
        status: 'pendiente',
      })

      if (error) throw error

      toast.success('Solicitud de recarga enviada', {
        position: 'bottom-right',
      })

      step.value = 3
    } catch (err) {
      toast.error(err.message || 'Error registrando la recarga', {
        position: 'bottom-right',
        duration: 5000,
        style: {
          backgroundColor: 'var(--destructive)',
          color: '#fff',
          border: 'none',
        },
      })
    } finally {
      submitting.value = false
    }
  }
}
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
        Recargar
      </h1>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-lg p-6 max-w-md space-y-6">
      <!-- STEP INDICATOR -->
      <div class="flex justify-between text-xs text-slate-400">
        <span :class="{ 'text-primary font-medium': step === 1 }">Pago</span>
        <span :class="{ 'text-primary font-medium': step === 2 }"
          >Registro</span
        >
        <span :class="{ 'text-primary font-medium': step === 3 }">Final</span>
      </div>

      <!-- STEP 1 -->
      <div v-if="step === 1" class="space-y-4">
        <div class="flex items-center gap-2 text-primary">
          <CreditCard />
          <h2 class="font-semibold">Datos de Pago Móvil</h2>
        </div>

        <div v-if="loading" class="text-sm text-slate-500 flex items-center">
          <Loader2 class="animate-spin mr-2" /> Cargando datos de pago…
        </div>

        <div
          v-else-if="paymentInfo"
          class="bg-slate-50 rounded-2xl p-4 space-y-1 text-sm"
        >
          <p><strong>Cédula:</strong> {{ paymentInfo.cedula }}</p>
          <p><strong>Teléfono:</strong> {{ paymentInfo.phone }}</p>
          <p><strong>Banco:</strong> {{ paymentInfo.bank }}</p>
        </div>

        <div v-else class="text-sm text-red-600">
          {{ 'No hay datos de pago disponibles para esta facultad' }}
        </div>

        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="copyPaymentInfo"
        >
          <Copy class="h-4 w-4" /> Copiar datos
        </Button>

        <Button class="w-full" size="lg" @click="nextStep">
          Ya realicé el pago
        </Button>
      </div>

      <!-- STEP 2 -->
      <div v-if="step === 2" class="space-y-4">
        <div class="flex items-center gap-2 text-primary">
          <ClipboardCheck />
          <h2 class="font-semibold">Registrar pago</h2>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel>Monto (Bs)</FieldLabel>
            <Input
              type="text"
              inputmode="numeric"
              placeholder="0,00"
              v-model="amountModel"
            />

            <FieldError v-if="errors.amount_bs">
              {{ errors.amount_bs }}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Referencia</FieldLabel>
            <Input placeholder="Ej: 123456789" v-model="form.reference" />
            <FieldError v-if="errors.reference">
              {{ errors.reference }}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Fecha del pago</FieldLabel>

            <Popover v-model:open="calendarOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  class="w-full justify-between text-left font-normal"
                >
                  <span v-if="form.date">
                    {{ form.date }}
                  </span>
                  <span v-else class="text-slate-400">
                    Selecciona una fecha
                  </span>
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>

              <PopoverContent class="w-auto p-0">
                <Calendar
                  mode="single"
                  v-model="selectedDate"
                  @update:model-value="calendarOpen = false"
                  locale="es"
                />
              </PopoverContent>
            </Popover>

            <FieldError v-if="errors.date">
              {{ errors.date }}
            </FieldError>
          </Field>
        </FieldGroup>

        <Button
          class="w-full"
          size="lg"
          :disabled="submitting"
          @click="nextStep"
        >
          <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ submitting ? 'Enviando…' : 'Enviar solicitud' }}
        </Button>
      </div>

      <!-- STEP 3 -->
      <div
        v-if="step === 3"
        class="flex flex-col items-center text-center gap-3"
      >
        <CheckCircle class="w-16 h-16 text-green-600" />
        <h2 class="text-lg font-semibold text-slate-900">Recarga registrada</h2>
        <p class="text-sm text-slate-600">
          Tu recarga será validada en un lapso de
          <strong>24 a 48 horas</strong>.
        </p>

        <Button class="w-full mt-2" @click="router.push('/resume')">
          Volver al inicio
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* mantiene consistencia visual */
</style>
