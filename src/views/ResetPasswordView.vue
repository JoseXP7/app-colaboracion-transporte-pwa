<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'
import { useSupabase } from '@/client/supabase'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import { resetPasswordSchema } from '@/schemas/resetPassword.schema'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { supabase } = useSupabase()
const { resetPasswordWithToken } = useAuth()

const loading = ref(false)
const success = ref(false)

const form = ref({
  password: '',
  passwordConfirm: '',
})

const errors = ref({})

// Estado para manejar la visibilidad de la contraseña
const showPassword = ref(false)

// Función para manejar el submit del formulario
const submit = async () => {
  errors.value = {}
  loading.value = true

  const result = resetPasswordSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    loading.value = false
    return
  }

  try {
    await resetPasswordWithToken(form.value)

    success.value = true
    toast.success('Contraseña actualizada con éxito', {
      position: 'bottom-right',
      duration: 5000,
    })
  } catch (error) {
    toast.error(error.message || 'Error al actualizar la contraseña', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    toast.error('Sesión de recuperación no válida o expirada.', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
    router.push('/login')
  }
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-b from-primary to-blue-800 px-4"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-white tracking-tight">UCLAGo</h1>
        <p class="text-slate-300 mt-2 text-sm">
          Ingresa una nueva contraseña para tu cuenta
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6"
      >
        <div v-if="!success">
          <form @submit.prevent="submit" class="space-y-5">
            <FieldGroup>
              <!-- Password -->
              <Field>
                <FieldLabel for="password">Nueva Contraseña</FieldLabel>
                <div class="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    v-model="form.password"
                    :aria-invalid="!!errors.password"
                    :type="showPassword ? 'text' : 'password'"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <Eye class="w-5 h-5 text-slate-500" v-if="!showPassword" />
                    <EyeOff class="w-5 h-5 text-slate-500" v-else />
                  </button>
                </div>
                <FieldError v-if="errors.password">{{
                  errors.password
                }}</FieldError>
              </Field>

              <!-- Confirm Password -->
              <Field>
                <FieldLabel for="confirmPassword"
                  >Confirmar Contraseña</FieldLabel
                >
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    v-model="form.passwordConfirm"
                    :aria-invalid="!!errors.passwordConfirm"
                    :type="showPassword ? 'text' : 'password'"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <Eye class="w-5 h-5 text-slate-500" v-if="!showPassword" />
                    <EyeOff class="w-5 h-5 text-slate-500" v-else />
                  </button>
                </div>
                <FieldError v-if="errors.passwordConfirm">{{
                  errors.passwordConfirm
                }}</FieldError>
              </Field>
            </FieldGroup>

            <Button class="w-full" size="lg" :disabled="loading">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Actualizando...' : 'Actualizar contraseña' }}
            </Button>
          </form>
        </div>

        <!-- Success -->
        <div v-else class="text-center space-y-4">
          <p class="text-sm text-slate-700">
            Tu contraseña ha sido actualizada correctamente. Puedes iniciar
            sesión con tu nueva contraseña.
          </p>

          <RouterLink
            to="/login"
            class="inline-block font-semibold text-primary hover:underline text-sm"
          >
            Volver al inicio de sesión
          </RouterLink>
        </div>
      </div>

      <p class="text-center text-xs text-slate-300 mt-6">
        Uso exclusivo de la comunidad universitaria de la UCLA
      </p>
    </div>
  </div>
</template>
