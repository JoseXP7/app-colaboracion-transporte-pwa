<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NotificationsCard from '@/components/NotificationsCard.vue'
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
import { toast } from 'vue-sonner'
import { useSupabase } from '@/client/supabase'
import { ChevronLeft, ShieldUser, Loader2 } from 'lucide-vue-next'
import { editPhoneSchema } from '@/schemas/editPhone.schema'

import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const userStore = useUserStore()
const { signOut } = useAuth()

const profile = computed(() => userStore.profile)
const user = computed(() => userStore.user)

const { supabase } = useSupabase()

const editOpen = ref(false)
const loading = ref(false)

const form = ref({
  phone_number: '',
})

const errors = ref({})

const facultyAcronyms = {
  1: 'DCS',
  2: 'DCEE',
  3: 'DAG',
  4: 'DCV',
  5: 'DCYT',
  6: 'DEHA',
  7: 'DIC',
}

const initials = computed(() => {
  if (!profile.value) return '?'
  return (
    profile.value.first_name.charAt(0) + profile.value.last_name.charAt(0)
  ).toUpperCase()
})

const openEditDialog = () => {
  errors.value = {}
  form.value.phone_number = profile.value.phone_number || ''
  editOpen.value = true
}

const savePhoneNumber = async () => {
  errors.value = {}
  loading.value = true

  const result = editPhoneSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      errors.value[field] = issue.message
    })
    loading.value = false
    return
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        phone_number: result.data.phone_number,
      })
      .eq('id', profile.value.id)

    if (error) throw error

    // sincronizamos store
    userStore.profile.phone_number = result.data.phone_number

    toast.success('Teléfono actualizado correctamente')
    editOpen.value = false
  } catch (err) {
    toast.error(err.message || 'Error al actualizar el teléfono')
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <div v-if="profile && user" class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <RouterLink
        to="/resume"
        class="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center text-slate-600"
      >
        <ChevronLeft size="20" />
      </RouterLink>

      <h1 class="text-lg font-semibold text-slate-900 tracking-tight">
        Perfil
      </h1>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-3xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-4">
        <div
          class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold"
        >
          {{ initials }}
        </div>

        <div>
          <p class="text-base font-semibold text-slate-900">
            {{ profile.first_name }} {{ profile.last_name }}
          </p>
          <p class="text-sm text-slate-500">
            Estudiante ·
            {{ facultyAcronyms[profile.faculty_id] || profile.faculty_id }}
          </p>
        </div>

        <Button
          class="ml-auto"
          v-if="userStore.profile.role == 'ce_admin'"
          size="sm"
          @click="router.push('/ce/')"
        >
          <ShieldUser class="w-4 h-4" />
          <span class="hidden sm:block">Ir al Dashboard CE</span>
        </Button>
      </div>
    </div>

    <!-- Info Section -->
    <div class="bg-white rounded-3xl shadow-sm divide-y">
      <div class="px-6 py-4">
        <p class="text-sm text-slate-500">Correo</p>
        <p class="text-sm font-medium text-slate-900">
          {{ user.email }}
        </p>
      </div>

      <div class="px-6 py-4">
        <p class="text-sm text-slate-500">Cédula</p>
        <p class="text-sm font-medium text-slate-900">
          {{ profile.cedula }}
        </p>
      </div>

      <div class="px-6 py-4">
        <p class="text-sm text-slate-500">Teléfono</p>
        <p class="text-sm font-medium text-slate-900">
          {{ profile.phone_number }}
        </p>
      </div>
    </div>

    <!-- Notifications Card -->
    <div class="mt-6">
      <NotificationsCard />
    </div>

    <!-- Actions -->
    <div class="mt-6 space-y-4">
      <Button
        class="w-full"
        size="lg"
        variant="outline"
        @click="openEditDialog"
      >
        Editar perfil
      </Button>

      <Button class="w-full" size="lg" variant="destructive" @click="logout">
        Cerrar sesión
      </Button>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-xs text-slate-500">UCLAGo · v1.0</p>

    <Dialog :open="editOpen" @update:open="editOpen = $event">
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar teléfono</DialogTitle>
    </DialogHeader>

    <form @submit.prevent="savePhoneNumber" class="space-y-5">
      <FieldGroup>
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
      </FieldGroup>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          @click="editOpen = false"
        >
          Cancelar
        </Button>

        <Button type="submit" :disabled="loading">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          {{ loading ? 'Guardando...' : 'Guardar cambios' }}
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

  </div>
</template>
