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

const facultyAcronyms = {
  1: 'DCS',
  2: 'DCEE',
  3: 'DAG',
  4: 'DCV',
  5: 'DCYT',
  6: 'DEHA',
  7: 'DIC',
}

const facultyLogos = {
  1: '/img/uclago_logo.png',
  2: '/img/uclago_logo.png',
  3: '/img/faculties/dag_logo.png',
  4: '/img/faculties/dcv_logo.png',
  5: '/img/faculties/dcyt_logo.png',
  6: '/img/uclago_logo.png',
  7: '/img/uclago_logo.png',
}

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
      `,
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

    // ===============================
    // CONFIG GENERAL
    // ===============================
    const cardW = 86
    const cardH = 54
    const gap = 0

    const cardX = (210 - cardW) / 2
    const cardYFront = 70
    const cardYBack = cardYFront + cardH + gap

    const logoUclago = '/img/uclago_logo.png'
    const facultyLogoPlaceholder = facultyLogos[userStore.profile.faculty_id]

    const qrImg = await QRCode.toDataURL(qr.token, { width: 400 })

    /* ======================================================
       DOCUMENTO – HEADER
    ====================================================== */
    doc.addImage(logoUclago, 'PNG', 10, 10, 28, 28)

    doc.setFontSize(14)
    doc.text('QR de Cobro – Operación CE', 105, 18, { align: 'center' })

    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text(
      'Recorte la tarjeta completa, doble por la línea central y plastifique.\nEl QR puede circular entre usuarios durante el trayecto.',
      105,
      26,
      { align: 'center', maxWidth: 170 },
    )

    doc.setTextColor(0)

    /* ======================================================
       TARJETA – FRENTE
    ====================================================== */
    doc.roundedRect(cardX, cardYFront, cardW, cardH, 4, 4)

    // Header
    doc.setFillColor(15, 23, 42)
    doc.roundedRect(cardX, cardYFront, cardW, 12, 4, 4, 'F')

    doc.addImage(logoUclago, 'PNG', cardX + 4, cardYFront + 1, 10, 10)
    doc.addImage(
      facultyLogoPlaceholder,
      'PNG',
      cardX + cardW - 18,
      cardYFront + 1,
      10,
      10,
    )

    // QR
    doc.addImage(qrImg, 'PNG', cardX + 6, cardYFront + 16, 32, 32)

    // Monto
    doc.setFontSize(14)
    doc.text(`Bs ${qr.amount_bs.toFixed(2)}`, cardX + 44, cardYFront + 28)

    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text('Escanea para colaborar', cardX + 44, cardYFront + 35)

    // Token COMPLETO
    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text(qr.token, cardX + cardW / 2, cardYFront + cardH - 6, {
      align: 'center',
      maxWidth: cardW - 8,
    })

    /* ======================================================
       TARJETA – REVERSO (PEGADA ABAJO)
    ====================================================== */
    doc.roundedRect(cardX, cardYBack, cardW, cardH, 4, 4)

    doc.setFillColor(241, 245, 249)
    doc.roundedRect(cardX, cardYBack, cardW, 12, 4, 4, 'F')

    doc.setFontSize(10)
    doc.setTextColor(30)
    doc.text('Instrucciones de uso', cardX + cardW / 2, cardYBack + 8, {
      align: 'center',
    })

    doc.setFontSize(8)
    doc.setTextColor(60)
    doc.text(
      [
        '• QR reutilizable durante el trayecto.',
        '• El monto es fijo.',
        '• No doblar sobre el código.',
        '• En caso de daño, solicitar reemplazo.',
        '',
        'Sistema UCLAGo – Uso autorizado',
      ],
      cardX + 6,
      cardYBack + 18,
      { maxWidth: cardW - 12 },
    )

    doc.setFontSize(6)
    doc.setTextColor(150)
    doc.text(
      `Centro de Estudiantes del ${
        facultyAcronyms[userStore.profile.faculty_id]
      }`,
      cardX + cardW / 2,
      cardYBack + cardH - 6,
      { align: 'center' },
    )

    /* ======================================================
       LÍNEA DE DOBLEZ
    ====================================================== */
    doc.setDrawColor(180)
    doc.setLineDash([2, 2])
    doc.line(
      cardX,
      cardYFront + cardH + gap / 2,
      cardX + cardW,
      cardYFront + cardH + gap / 2,
    )
    doc.setLineDash([])

    /* ======================================================
       TEXTO OPERATIVO CE (DOCUMENTO)
    ====================================================== */
    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text(
      'Indicaciones para el CE:\n• Recortar una sola pieza.\n• Doblar por la línea punteada.\n• Plastificar para mayor durabilidad.\n• El QR puede pasarse entre usuarios.',
      105,
      cardYBack + cardH + 22,
      { align: 'center', maxWidth: 180 },
    )

    doc.save(`UCLAGo_QR_${qr.amount_bs}_bs.pdf`)
    toast.success('PDF generado correctamente')
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

const disableQr = async (qrId) => {
  try {
    const { error } = await supabase
      .from('qr_codes')
      .update({ is_active: false })
      .eq('id', qrId)
      .eq('faculty_id', userStore.profile.faculty_id)

    if (error) throw error

    toast.success('QR inhabilitado correctamente')
    fetchQrs()
  } catch (err) {
    toast.error(err.message || 'Error inhabilitando el QR', {
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
          <Badge :variant="qr.is_active ? '' : 'destructive'">
            {{ qr.is_active ? 'Activo' : 'Inhabilitado' }}
          </Badge>

          <Button size="sm" variant="outline" @click="downloadPdf(qr)">
            <Download class="w-4 h-4 mr-1" />
            PDF
          </Button>

          <Button
            v-if="qr.is_active"
            size="sm"
            variant="destructive"
            @click="disableQr(qr.id)"
          >
            Inhabilitar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
