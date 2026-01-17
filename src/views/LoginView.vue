<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Loader2, Eye, EyeOff } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'

import { loginSchema } from '@/schemas/auth.schema'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { loginWithPassw } = useAuth()

const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  email: '',
  password: '',
})

const errors = ref({})

const submit = async () => {
  errors.value = {}
  loading.value = true

  const result = loginSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      errors.value[field] = issue.message
    })
    loading.value = false
    return
  }

  try {
    await loginWithPassw(form.value)
    router.push('/resume')
  } catch (error) {
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
          Accede a tu billetera universitaria
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6"
      >
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

            <!-- Password -->
            <Field>
              <div class="flex justify-between items-center">
                <FieldLabel for="password">Contraseña</FieldLabel>
                <RouterLink
                  to="/forgot-password"
                  class="text-sm text-primary hover:underline float-right mt-1"
                >
                  ¿Olvidaste tu contraseña?
                </RouterLink>
              </div>
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
              <FieldError v-if="errors.password">
                {{ errors.password }}
              </FieldError>
            </Field>
          </FieldGroup>

          <Button class="w-full" size="lg" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
          </Button>

          <p class="text-center text-sm text-slate-600">
            ¿No tienes cuenta?
            <RouterLink
              to="/register"
              class="font-semibold text-primary hover:underline"
            >
              Regístrate
            </RouterLink>
          </p>
        </form>
      </div>

      <p class="text-center text-xs text-slate-300 mt-6">
        Uso exclusivo de la comunidad universitaria de la UCLA
      </p>
    </div>
  </div>
</template>
