<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { User } from 'lucide-vue-next'

import { useUserStore } from '@/stores/userStore'
import { useSupabase } from '@/client/supabase'
import { useAuth } from '@/composables/useAuth'

import { completeProfileSchema } from '@/schemas/completeProfile.schema'

// state
const faculties = ref([])

const { supabase } = useSupabase()
const { getSession } = useAuth()

const loading = ref(false)
const router = useRouter()

const form = ref({
  first_name: '',
  last_name: '',
  phone_number: '',
  cedula: 'V-',
  faculty_id: '',
})

const userStore = useUserStore()

const cedulaModel = computed({
  get() {
    return form.value.cedula || 'V-'
  },
  set(val) {
    let digits = val.replace(/^V-?/i, '').replace(/[^\d]/g, '')
    form.value.cedula = 'V-' + digits
  },
})

const errors = ref({})

const submit = async () => {
  errors.value = {}
  loading.value = true

  const result = completeProfileSchema.safeParse(form.value)
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      errors.value[field] = issue.message
    })
    loading.value = false
    return
  }

  try {
    const session = await getSession()

    const userId = session.user.id

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      ...form.value,
    })

    if (error) throw error
    await userStore.getProfile()
    router.push('/resume')
  } catch (error) {
    console.log(error)
    toast.error(error.message, {
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

onMounted(async () => {
  const { data, error } = await supabase
    .from('faculties')
    .select('id, name, acronym')
    .order('name')

  if (error) {
    toast.error('Error cargando facultades', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
    return
  }

  faculties.value = data
})
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
        >
          <User class="text-primary" />
        </div>

        <h1 class="text-2xl font-semibold text-slate-900">
          Completa tu perfil
        </h1>
        <p class="mt-2 text-sm text-slate-500">
          Necesitamos algunos datos para activar tu billetera
        </p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl bg-white shadow-lg p-6 space-y-5">
        <form @submit.prevent="submit" autocomplete="off" class="space-y-5">
          <FieldGroup>
            <!-- Nombre -->
            <Field>
              <FieldLabel for="first_name">Nombre</FieldLabel>
              <Input
                id="first_name"
                type="text"
                placeholder="Juan"
                v-model="form.first_name"
                :aria-invalid="!!errors.first_name"
              />
              <FieldError v-if="errors.first_name">
                {{ errors.first_name }}
              </FieldError>
            </Field>

            <!-- Apellido -->
            <Field>
              <FieldLabel for="last_name">Apellido</FieldLabel>
              <Input
                id="last_name"
                type="text"
                placeholder="Pérez"
                v-model="form.last_name"
                :aria-invalid="!!errors.last_name"
              />
              <FieldError v-if="errors.last_name">
                {{ errors.last_name }}
              </FieldError>
            </Field>

            <!-- Cédula -->
            <Field>
              <FieldLabel for="cedula">Cédula</FieldLabel>
              <Input
                id="cedula"
                type="text"
                placeholder="V-12345678"
                v-model="cedulaModel"
                :aria-invalid="!!errors.cedula"
              />
              <FieldError v-if="errors.cedula">
                {{ errors.cedula }}
              </FieldError>
            </Field>

            <!-- Teléfono -->
            <Field>
              <FieldLabel for="phone_number">Teléfono</FieldLabel>
              <Input
                id="phone_number"
                type="tel"
                placeholder="04141234567"
                v-model="form.phone_number"
                :aria-invalid="!!errors.phone_number"
              />
              <FieldError v-if="errors.phone_number">
                {{ errors.phone_number }}
              </FieldError>
            </Field>

            <!-- Facultad -->
            <Field>
              <FieldLabel for="faculty_id">Decanato</FieldLabel>
              <Select v-model="form.faculty_id">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Selecciona tu Decanato" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem
                    v-for="faculty in faculties"
                    :key="faculty.id"
                    :value="faculty.id"
                  >
                    {{ faculty.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError v-if="errors.faculty_id">
                {{ errors.faculty_id }}
              </FieldError>
            </Field>
          </FieldGroup>

          <!-- Button -->
          <Button class="w-full" size="lg" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? 'Guardando...' : 'Guardar y continuar' }}
          </Button>
        </form>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-slate-500">
        Tus datos son usados únicamente para la gestión del transporte
      </p>
    </div>
  </div>
</template>
