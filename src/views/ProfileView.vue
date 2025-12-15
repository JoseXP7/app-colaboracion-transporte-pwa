<script setup>
import { Button } from '@/components/ui/button'

import { ChevronLeft } from 'lucide-vue-next'
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
        Perfil
      </h1>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-3xl shadow-lg p-6 mb-6">
      <div class="flex items-center gap-4">
        <div
          class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold"
        >
          J
        </div>

        <div>
          <p class="text-base font-semibold text-slate-900">Juan Pérez</p>
          <p class="text-sm text-slate-500">Estudiante · DCYT</p>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="bg-white rounded-3xl shadow-sm divide-y">
      <!-- Item -->
      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <p class="text-sm text-slate-500">Correo</p>
          <p class="text-sm font-medium text-slate-900">correo@gmail.com</p>
        </div>
      </div>

      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <p class="text-sm text-slate-500">Cédula</p>
          <p class="text-sm font-medium text-slate-900">V-12345678</p>
        </div>
      </div>

      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <p class="text-sm text-slate-500">Teléfono</p>
          <p class="text-sm font-medium text-slate-900">0412-1234567</p>
        </div>
      </div>

      <div class="flex items-center justify-between px-6 py-4">
        <div>
          <p class="text-sm text-slate-500">Facultad</p>
          <p class="text-sm font-medium text-slate-900">
            Decanato de Ciencias y Tecnología
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 space-y-4">
      <Button class="w-full" size="lg" variant="outline">
        Editar perfil
      </Button>

      <Button class="w-full" size="lg" variant="destructive">
        Cerrar sesión
      </Button>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-xs text-slate-500">UCLAGo · v1.0</p>
  </div>
</template>
