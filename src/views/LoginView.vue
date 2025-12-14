<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-b from-primary to-blue-800 px-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo / App name -->
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
        <!-- Email -->
        <div class="space-y-2">
          <Label for="email" class="text-sm font-medium text-slate-700"
            >Correo</Label
          >
          <Input type="email" id="email" placeholder="correo@email.com" />
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <Label for="password" class="text-sm font-medium text-slate-700"
            >Contraseña</Label
          >
          <Input type="password" id="password" placeholder="••••••••" />
        </div>

        <!-- Button -->
        <Button class="w-full" size="lg">Iniciar sesión</Button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="h-px bg-slate-300 flex-1" />
          <span class="text-xs text-slate-400">o</span>
          <div class="h-px bg-slate-300 flex-1" />
        </div>

        <!-- Register -->
        <p class="text-center text-sm text-slate-600">
          ¿No tienes cuenta?
          <RouterLink
            to="/register"
            class="font-semibold text-primary hover:underline"
          >
            Regístrate
          </RouterLink>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-300 mt-6">
        Uso exclusivo de la comunidad universitaria de la UCLA
      </p>
    </div>
  </div>
</template>
