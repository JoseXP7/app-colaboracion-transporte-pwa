<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Button } from '@/components/ui/button'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'
import jsPDF from 'jspdf'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
)

const { supabase } = useSupabase()
const userStore = useUserStore()

const period = ref('monthly') // day | month | year
const loading = ref(false)

const stats = ref(null)

const fetchStats = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.rpc('get_faculty_stats', {
      p_faculty_id: userStore.profile.faculty_id,
      p_range: period.value,
    })

    if (error) throw error
    stats.value = data
  } catch (err) {
    toast.error(err.message || 'Error cargando los datos', {
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

const chartData = computed(() => {
  if (!stats.value?.distribution) return null

  return {
    labels: stats.value.distribution.map((d) => d.user),
    datasets: [
      {
        data: stats.value.distribution.map((d) => d.amount),
        backgroundColor: [
          '#3b82f6',
          '#22c55e',
          '#f97316',
          '#a855f7',
          '#ef4444',
        ],
      },
    ],
  }
})

const downloadPdf = () => {
  loading.value = true
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    let y = 22
    // Fecha y hora actual en la esquina superior derecha
    const now = new Date()
    const fechaHora = format(now, 'dd/MM/yyyy HH:mm')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(120)
    pdf.text(`Generado: ${fechaHora}`, 200, 10, { align: 'right' })

    // Título principal
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Estadísticas', 105, y, { align: 'center' })
    y += 10
    // Subtítulo de rango de periodo
    let periodoLabel = ''
    if (period.value === 'daily') periodoLabel = 'Estadística diaria'
    else if (period.value === 'monthly') periodoLabel = 'Estadística mensual'
    else if (period.value === 'yearly') periodoLabel = 'Estadística anual'
    if (periodoLabel) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.setTextColor(120)
      pdf.text(periodoLabel, 105, y + 4, { align: 'center' })
      y += 8
    } else {
      y += 2
    }

    // KPIs en tarjetas minimalistas
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const kpiBox = (label, value, x, yBox) => {
      pdf.setDrawColor(230)
      pdf.setFillColor(245, 245, 245)
      pdf.roundedRect(x, yBox, 48, 18, 3, 3, 'F')
      pdf.setTextColor(120)
      pdf.text(label, x + 3, yBox + 7)
      pdf.setTextColor(33, 37, 41)
      pdf.setFont('helvetica', 'bold')
      pdf.text(value, x + 3, yBox + 15)
      pdf.setFont('helvetica', 'normal')
    }
    if (stats.value) {
      // Primera fila
      kpiBox('Recargas', `${stats.value.total_topups ?? '-'}`, 35, y)
      kpiBox(
        'Total recargado',
        `Bs ${stats.value.total_amount?.toFixed(2) ?? '-'}`,
        110,
        y
      )
      // Segunda fila
      kpiBox('Activos', `${stats.value.active_students ?? '-'}`, 35, y + 22)
      kpiBox(
        'Recargaron',
        `${stats.value.students_with_topups ?? '-'}`,
        110,
        y + 22
      )
      // Top estudiante en una tarjeta
      kpiBox(
        'Top estudiante',
        `${stats.value.top_student?.name ?? '—'}`,
        35,
        y + 44
      )
      pdf.setTextColor(120)
      pdf.text(
        `Bs ${stats.value.top_student?.total?.toFixed(2) ?? '0.00'}`,
        110,
        y + 57
      )
      y += 66
    }

    // Línea divisoria
    pdf.setDrawColor(230)
    pdf.line(20, y, 190, y)
    y += 10

    // Gráfica (proporcional, cuadrada y centrada)
    const chartCanvas = document.querySelector('canvas')
    if (chartCanvas) {
      const chartImg = chartCanvas.toDataURL('image/png')
      pdf.setFontSize(13)
      pdf.setTextColor(33, 37, 41)
      pdf.text('Distribución de recargas', 105, y, { align: 'center' })
      y += 5
      // Tamaño cuadrado y centrado
      const chartSize = 70
      const chartX = (210 - chartSize) / 2
      pdf.addImage(chartImg, 'PNG', chartX, y, chartSize, chartSize)
      y += chartSize + 10
    }

    pdf.save('estadisticas-ce.pdf')
  } catch (err) {
    toast.error(err.message || 'Error generando el pdf', {
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

onMounted(fetchStats)
</script>

<template>
  <div class="space-y-6" id="stats-pdf">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold">Estadísticas</h1>

      <div class="flex gap-2">
        <select
          v-model="period"
          @change="fetchStats"
          class="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="daily">Diario</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </select>

        <Button :disabled="!stats || loading" @click="downloadPdf">
          Descargar PDF
        </Button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-xs text-slate-500">Recargas</p>
        <p class="text-xl font-bold">{{ stats?.total_topups }}</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-xs text-slate-500">Total recargado</p>
        <p class="text-xl font-bold">
          Bs {{ stats?.total_amount?.toFixed(2) }}
        </p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-xs text-slate-500">Estudiantes activos</p>
        <p class="text-xl font-bold">{{ stats?.active_students }}</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-xs text-slate-500">Estudiantes que recargaron</p>
        <p class="text-xl font-bold">{{ stats?.students_with_topups }}</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <p class="text-xs text-slate-500">Top estudiante</p>
        <p class="text-sm font-semibold">
          {{ stats?.top_student?.name || '—' }}
        </p>
        <p class="text-xs text-slate-500">
          Bs {{ stats?.top_student?.total?.toFixed(2) || '0.00' }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow" v-if="chartData">
        <h3 class="text-sm font-medium mb-4">Distribución de recargas</h3>

        <Pie :data="chartData" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
