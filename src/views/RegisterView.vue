<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-b from-primary to-indigo-800 px-4 py-10"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-white tracking-tight">
          Crear cuenta
        </h1>
        <p class="text-slate-400 mt-2 text-sm">
          Regístrate para usar el transporte universitario
        </p>
      </div>

      <!-- Card -->
      <div
        class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 space-y-5"
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

        <!-- Confirm Password -->
        <div class="space-y-2">
          <Label
            for="confirmPassword"
            class="text-sm font-medium text-slate-700"
            >Confirmar contraseña</Label
          >
          <Input type="password" id="confirmPassword" placeholder="••••••••" />
        </div>

        <!-- Button -->
        <Button class="w-full" size="lg">Crear cuenta</Button>

        <!-- Login link -->
        <p class="text-center text-sm text-slate-600 mt-2">
          ¿Ya tienes cuenta?
          <RouterLink
            to="/login"
            class="font-semibold text-primary hover:underline"
          >
            Inicia sesión
          </RouterLink>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-500 mt-6">
        Al registrarte aceptas los terminos y condiciones de los Centros de
        Estudiantes de la UCLA
      </p>
    </div>
  </div>
</template>
