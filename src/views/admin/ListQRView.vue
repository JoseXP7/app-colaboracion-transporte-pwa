<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download } from 'lucide-vue-next'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'

const { supabase } = useSupabase()
const userStore = useUserStore()

const loading = ref(false)
const qrs = ref([])

const fetchQrs = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select(
        `
        id,
        token,
        amount_bs,
        is_active,
        created_at
      `
      )
      .eq('faculty_id', userStore.profile.faculty_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    qrs.value = data
  } catch (err) {
    toast.error(err.message || 'Error cargando los QRs', {
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

const downloadPdf = async (qr) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    // Generar QR base64
    const qrBig = await QRCode.toDataURL(qr.token, { width: 600 })
    const qrSmall = await QRCode.toDataURL(qr.token, { width: 300 })

    /* =======================
       POSTER (QR GRANDE)
    ======================= */
    doc.setFontSize(22)
    doc.text('Escanea para pagar', 105, 20, { align: 'center' })

    doc.addImage(qrBig, 'PNG', 55, 30, 100, 100)

    doc.setFontSize(16)
    doc.text(`Monto: Bs ${qr.amount_bs.toFixed(2)}`, 105, 140, {
      align: 'center',
    })

    doc.setFontSize(10)
    doc.text(`Token: ${qr.token}`, 105, 148, {
      align: 'center',
      maxWidth: 180,
    })

    /* =======================
       SEPARADOR
    ======================= */
    doc.setDrawColor(200)
    doc.line(10, 160, 200, 160)

    /* =======================
       TARJETA (QR PEQUEÑO)
    ======================= */
    doc.roundedRect(40, 170, 130, 50, 4, 4)
    doc.addImage(qrSmall, 'PNG', 45, 175, 40, 40)

    doc.setFontSize(12)
    doc.text('Pago rápido', 95, 185)
    doc.text(`Bs ${qr.amount_bs.toFixed(2)}`, 95, 193)

    doc.setFontSize(8)
    doc.text(qr.token, 95, 202, { maxWidth: 70 })

    doc.save(`QR_${qr.amount_bs}_bs.pdf`)

    toast.success('PDF descargado')
  } catch (err) {
    toast.error(err.message || 'Error generando el PDF', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  }
}

onMounted(fetchQrs)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-semibold text-slate-900">QRs generados</h1>
      <p class="text-sm text-slate-500">Descarga o reutiliza los QRs creados</p>
    </div>

    <div v-if="loading" class="flex items-center text-sm text-slate-500">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Cargando QRs…
    </div>

    <div v-else-if="!qrs.length" class="text-sm text-slate-500">
      No hay QRs creados aún
    </div>

    <div class="space-y-4">
      <div
        v-for="qr in qrs"
        :key="qr.id"
        class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-medium text-slate-900">
            Bs {{ qr.amount_bs.toFixed(2) }}
          </p>
          <p class="text-xs text-slate-500">
            {{ new Date(qr.created_at).toLocaleDateString() }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Badge :variant="qr.is_active ? 'outline' : 'destructive'">
            {{ qr.is_active ? 'Activo' : 'Usado' }}
          </Badge>

          <Button size="sm" variant="outline" @click="downloadPdf(qr)">
            <Download class="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
