<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
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

import { forgotPasswordSchema } from '@/schemas/forgotPassword.schema'
import { useAuth } from '@/composables/useAuth'

const { resetPassword } = useAuth()

const loading = ref(false)
const success = ref(false)

const form = ref({
  email: '',
})

const errors = ref({})

const submit = async () => {
  errors.value = {}
  loading.value = true

  const result = forgotPasswordSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    loading.value = false
    return
  }

  try {
    await resetPassword(form.value.email)

    success.value = true
    toast.success(
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
      {
        position: 'bottom-right',
        duration: 6000,
      },
    )
  } catch (error) {
    toast.error('No se pudo procesar la solicitud', {
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
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-b from-primary to-blue-800 px-4"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-white tracking-tight">UCLAGo</h1>
        <p class="text-slate-300 mt-2 text-sm">
          Recupera el acceso a tu cuenta
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6"
      >
        <div v-if="!success">
          <form @submit.prevent="submit" class="space-y-5">
            <FieldGroup>
              <!-- Email -->
              <Field>
                <FieldLabel for="email">Correo</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@email.com"
                  v-model="form.email"
                  :aria-invalid="!!errors.email"
                />
                <FieldError v-if="errors.email">
                  {{ errors.email }}
                </FieldError>
              </Field>
            </FieldGroup>

            <Button class="w-full" size="lg" :disabled="loading">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
            </Button>

            <p class="text-center text-sm text-slate-600">
              ¿Recordaste tu contraseña?
              <RouterLink
                to="/login"
                class="font-semibold text-primary hover:underline"
              >
                Inicia sesión
              </RouterLink>
            </p>
          </form>
        </div>

        <!-- Success -->
        <div v-else class="text-center space-y-4">
          <p class="text-sm text-slate-700">
            Si el correo está registrado, recibirás un enlace para restablecer
            tu contraseña.
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
