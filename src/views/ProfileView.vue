<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ShieldUser } from 'lucide-vue-next'

import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const userStore = useUserStore()
const { signOut } = useAuth()

const profile = computed(() => userStore.profile)
const user = computed(() => userStore.user)

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

    <!-- Actions -->
    <div class="mt-6 space-y-4">
      <Button class="w-full" size="lg" variant="outline">
        Editar perfil
      </Button>

      <Button class="w-full" size="lg" variant="destructive" @click="logout">
        Cerrar sesión
      </Button>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-xs text-slate-500">UCLAGo · v1.0</p>
  </div>
</template>
