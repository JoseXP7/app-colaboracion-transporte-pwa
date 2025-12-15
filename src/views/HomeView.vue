<script setup>
import { Button } from '@/components/ui/button'

import {
  BanknoteArrowUp,
  ScanQrCode,
  ReceiptText,
  User,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-slate-100 px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div
          class="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold"
        >
          J
        </div>
        <div>
          <p class="text-sm font-medium text-slate-900">Juan Pérez</p>
          <p class="text-xs text-slate-500">Estudiante</p>
        </div>
      </div>

      <Button
        size="icon"
        variant="outline"
        class="rounded-full w-10 h-10 shadow"
      >
        <Bell />
      </Button>
    </div>

    <!-- Balance Card -->
    <div class="rounded-3xl bg-primary text-white p-6 shadow-xl mb-6">
      <p class="text-sm opacity-80">Saldo disponible</p>
      <h2 class="text-3xl font-bold mt-2">Bs 99999,00</h2>
      <p class="text-xs opacity-80 mt-1">Aqui lo que sobra es rial</p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <!-- Recarga -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <BanknoteArrowUp />
        </RouterLink>
        <span class="text-xs text-slate-600">Recargar</span>
      </div>

      <!-- Scan QR -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <ScanQrCode />
        </RouterLink>
        <span class="text-xs text-slate-600">Escanear</span>
      </div>

      <!-- Movements -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="/"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <ReceiptText />
        </RouterLink>
        <span class="text-xs text-slate-600">Movimientos</span>
      </div>

      <!-- Profile -->
      <div class="flex flex-col items-center gap-2">
        <RouterLink
          to="profile"
          class="h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-xl"
        >
          <User />
        </RouterLink>
        <span class="text-xs text-slate-600">Perfil</span>
      </div>
    </div>

    <!-- Transactions -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-semibold text-slate-900">
          Transacciones recientes
        </h3>
        <RouterLink to="/" class="text-sm text-primary font-medium"
          >Ver todas</RouterLink
        >
      </div>

      <div class="space-y-3">
        <!-- Item -->
        <div
          class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div class="bg-red-100 p-2 rounded-md text-red-500">
              <ArrowDownRight />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">
                Colaboracion transporte
              </p>
              <p class="text-xs text-slate-500">Hoy · 08:30 AM</p>
            </div>
          </div>
          <span class="text-sm font-semibold text-red-500"> - Bs 25,00 </span>
        </div>

        <div
          class="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div class="bg-green-100 p-2 rounded-md text-green-600">
              <ArrowUpRight />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-900">Recarga aprobada</p>
              <p class="text-xs text-slate-500">Ayer · 02:15 PM</p>
            </div>
          </div>
          <span class="text-sm font-semibold text-green-600">
            + Bs 100,00
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
