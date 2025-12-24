<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useSupabase } from '@/client/supabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Loader2, Pencil } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { paymentMobileSchema } from '@/schemas/paymentMobile.schema'

const { supabase } = useSupabase()
const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const open = ref(false)

const paymentInfo = ref(null)

const form = ref({
  cedula: '',
  phone: '',
  bank: '',
})

const errors = ref({})

const phoneComputed = computed({
  get() {
    return form.value.phone
  },
  set(value) {
    // eliminar todo lo que no sea número
    let digits = value.replace(/\D/g, '')

    // limitar a 11 dígitos
    digits = digits.slice(0, 11)

    // insertar guion después de los primeros 4
    if (digits.length > 4) {
      digits = digits.slice(0, 4) + '-' + digits.slice(4)
    }

    form.value.phone = digits
  },
})

const fetchPaymentInfo = async () => {
  loading.value = true
  try {
    const { data } = await supabase
      .from('payment_mobile_info')
      .select('*')
      .eq('faculty_id', userStore.profile.faculty_id)
      .single()

    if (data) {
      paymentInfo.value = data
      form.value = {
        cedula: data.cedula,
        phone: data.phone,
        bank: data.bank,
      }
    }
  } finally {
    loading.value = false
  }
}

const save = async () => {
  errors.value = {}

  const result = paymentMobileSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    return
  }

  saving.value = true
  try {
    const { error } = await supabase.rpc('update_payment_mobile_info', {
      p_cedula: form.value.cedula,
      p_phone: form.value.phone,
      p_bank: form.value.bank,
    })

    if (error) throw error

    toast.success('Datos de pago actualizados')
    open.value = false
    fetchPaymentInfo()
  } catch (err) {
    toast.error(err.message || 'Error guardando datos', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  } finally {
    saving.value = false
  }
}

onMounted(fetchPaymentInfo)
</script>

<template>
  <div class="space-y-6 max-w-xl">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-slate-900">Datos de Pago</h1>

      <Button size="sm" @click="open = true">
        <Pencil class="w-4 h-4 mr-1" />
        Editar
      </Button>
    </div>

    <div v-if="loading" class="flex items-center text-sm text-slate-500">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Cargando datos…
    </div>

    <div
      v-else-if="paymentInfo"
      class="bg-white rounded-2xl shadow-sm p-4 space-y-2 text-sm"
    >
      <p><strong>Cédula:</strong> {{ paymentInfo.cedula }}</p>
      <p><strong>Teléfono:</strong> {{ paymentInfo.phone }}</p>
      <p><strong>Banco:</strong> {{ paymentInfo.bank }}</p>
    </div>

    <div v-else class="text-sm text-slate-500">
      Aún no hay datos de pago configurados.
    </div>

    <!-- Dialog -->
    <Dialog v-model:open="open">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar datos de pago</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>Cédula</FieldLabel>
            <Input v-model="form.cedula" />
            <FieldError v-if="errors.cedula">
              {{ errors.cedula }}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Teléfono</FieldLabel>

            <Input
              v-model="phoneComputed"
              placeholder="0412-1234567"
              maxlength="12"
            />

            <FieldError v-if="errors.phone">
              {{ errors.phone }}
            </FieldError>
          </Field>

          <Field>
            <FieldLabel>Banco</FieldLabel>
            <Input v-model="form.bank" />
            <FieldError v-if="errors.bank">
              {{ errors.bank }}
            </FieldError>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" @click="open = false"> Cancelar </Button>

          <Button :disabled="saving" @click="save">
            <Loader2 v-if="saving" class="w-4 h-4 mr-1 animate-spin" />
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
