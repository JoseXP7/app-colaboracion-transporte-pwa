<script setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select'

import { User } from 'lucide-vue-next'
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
        <!-- Nombre -->
        <div class="space-y-2">
          <Label for="name" class="text-sm font-medium text-slate-700"
            >Nombre completo</Label
          >
          <Input type="text" id="name" placeholder="Juan Pérez" />
        </div>

        <!-- Cédula -->
        <div class="space-y-2">
          <Label for="idNumber" class="text-sm font-medium text-slate-700"
            >Cédula</Label
          >
          <Input type="text" id="idNumber" placeholder="V-12345678" />
        </div>

        <!-- Teléfono -->
        <div class="space-y-2">
          <Label for="phone" class="text-sm font-medium text-slate-700"
            >Teléfono</Label
          >

          <div class="flex items-center gap-2">
            <Select id="code_phone">
              <SelectTrigger>
                <SelectValue placeholder="0000" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0414"> 0414 </SelectItem>
                <SelectItem value="0424"> 0424 </SelectItem>
                <SelectItem value="0416"> 0416 </SelectItem>
                <SelectItem value="0426"> 0426 </SelectItem>
                <SelectItem value="0412"> 0412 </SelectItem>
                <SelectItem value="0422"> 0422 </SelectItem>
              </SelectContent>
            </Select>
            <Input type="text" id="phone" placeholder="1234567" />
          </div>
        </div>

        <!-- Facultad -->
        <div class="space-y-2">
          <Label for="faculty" class="text-sm font-medium text-slate-700">
            Decanato
          </Label>
          <Select id="faculty">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecciona tu Decanato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DCV">
                Decanato de Ciencias Veterinarias
              </SelectItem>
              <SelectItem value="DAG"> Decanato de Agronomía </SelectItem>
              <SelectItem value="DCYT">
                Decanato de Ciencias y Tecnología
              </SelectItem>
              <SelectItem value="DIC">
                Decanato de Ingeniería Civil
              </SelectItem>
              <SelectItem value="DCS">
                Decanato de Ciencias de la Salud
              </SelectItem>
              <SelectItem value="DEHA">
                Decanato Experimental de Humanidades y Artes
              </SelectItem>
              <SelectItem value="DCEE">
                Decanato de Ciencias Económicas y Empresariales
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Button -->
        <Button class="w-full" size="lg">Guardar y continuar</Button>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-slate-500">
        Tus datos son usados únicamente para la gestión del transporte
      </p>
    </div>
  </div>
</template>
