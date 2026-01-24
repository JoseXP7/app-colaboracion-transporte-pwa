<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSupabase } from '@/client/supabase'
import { useUserStore } from '@/stores/userStore'
import jsPDF from 'jspdf'
import { toast } from 'vue-sonner'
import { Loader2, Calendar as CalendarIcon, FileDown } from 'lucide-vue-next'
import { format } from 'date-fns'
import { today, getLocalTimeZone } from '@internationalized/date'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
)

const { supabase } = useSupabase()
const userStore = useUserStore()

const selectedDate = ref(today(getLocalTimeZone()))

const period = ref('monthly') // day | month | year
const loading = ref(false)
const filterOpen = ref(false)
const calendarFilterActive = ref(false)

const stats = ref(null)

const facultyAcronyms = {
  1: 'DCS',
  2: 'DCEE',
  3: 'DAG',
  4: 'DCV',
  5: 'DCYT',
  6: 'DEHA',
  7: 'DIC',
}

const applyFilter = () => {
  // Si el usuario aplica un filtro desde el calendario,
  // forzamos el periodo a diario para que la fecha seleccionada
  // se interprete como un día concreto.
  period.value = 'daily'
  // marcar que el filtro por calendario está activo
  calendarFilterActive.value = true
  filterOpen.value = false
  fetchStats()
}

// Cuando el usuario cambia el periodo desde el Select
// reiniciamos el filtro del calendario para que el Select
// tenga efecto (día/mes/año) sin quedar atado a una fecha previa.
const onPeriodChange = (newVal) => {
  period.value = newVal
  // resetear la fecha seleccionada al día actual
  selectedDate.value = today(getLocalTimeZone())
  // cerrar diálogo de filtro si está abierto
  filterOpen.value = false
  // desactivar badge de calendario porque el usuario usó el Select
  calendarFilterActive.value = false
  // recargar estadísticas con el nuevo periodo
  fetchStats()
}

const buildRange = () => {
  const jsDate = selectedDate.value.toDate(getLocalTimeZone())

  let from, to

  if (period.value === 'daily') {
    from = new Date(jsDate.setHours(0, 0, 0, 0))
    to = new Date(jsDate.setHours(24, 0, 0, 0))
  }

  if (period.value === 'monthly') {
    from = new Date(jsDate.getFullYear(), jsDate.getMonth(), 1)
    to = new Date(jsDate.getFullYear(), jsDate.getMonth() + 1, 1)
  }

  if (period.value === 'yearly') {
    from = new Date(jsDate.getFullYear(), 0, 1)
    to = new Date(jsDate.getFullYear() + 1, 0, 1)
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

const fetchStats = async () => {
  loading.value = true
  try {
    const { from, to } = buildRange()

    const { data, error } = await supabase.rpc('get_faculty_stats', {
      p_faculty_id: userStore.profile.faculty_id,
      p_date_from: from,
      p_date_to: to,
    })

    if (error) throw error
    stats.value = data
  } catch (err) {
    toast.error(err.message || 'Error cargando estadísticas')
  } finally {
    loading.value = false
  }
}

const chartData = computed(() => {
  if (!stats.value?.pie_distribution) return null

  return {
    labels: stats.value.pie_distribution.map((d) => d.range),
    datasets: [
      {
        data: stats.value.pie_distribution.map((d) => d.students),
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

const lineData = computed(() => {
  const labels = stats.value?.daily_topups?.map((d) => d.day) ?? []
  const values = stats.value?.daily_topups?.map((d) => d.total) ?? []

  return {
    labels,
    datasets: values.length
      ? [
          {
            label: 'Recargas por día',
            data: values,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            fill: false,
            tension: 0.0,
            pointRadius: 3,
          },
        ]
      : [],
  }
})

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { display: true } },
  },
}

const downloadPdf = () => {
  loading.value = true
  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    let y = 22

    //Imagenes - Header
    const logoUclago = '/img/uclago_logo.png'
    pdf.addImage(logoUclago, 'PNG', 10, 10, 28, 28)
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
    pdf.text(
      `Estadisticas - ${facultyAcronyms[userStore.profile.faculty_id]}`,
      105,
      y,
      { align: 'center' },
    )
    y += 10
    // Subtítulo de rango de periodo
    let periodoLabel = ''
    if (period.value === 'daily') {
      // Mostrar la fecha seleccionada en lugar de un texto genérico
      try {
        const selJsDate = selectedDate.value.toDate(getLocalTimeZone())
        periodoLabel = format(selJsDate, 'dd/MM/yyyy')
      } catch (e) {
        periodoLabel = 'Estadística diaria'
      }
    } else if (period.value === 'monthly') periodoLabel = 'Estadística mensual'
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
        y,
      )
      // Segunda fila
      kpiBox('Activos', `${stats.value.active_students ?? '-'}`, 35, y + 22)
      kpiBox(
        'Recargaron',
        `${stats.value.students_with_topups ?? '-'}`,
        110,
        y + 22,
      )
      // Top estudiante en una tarjeta
      kpiBox(
        'Top estudiante',
        `${stats.value.top_student?.name ?? '—'}`,
        35,
        y + 44,
      )
      pdf.setTextColor(120)
      pdf.text(
        `Bs ${stats.value.top_student?.total?.toFixed(2) ?? '0.00'}`,
        110,
        y + 57,
      )
      y += 66
    }

    // Línea divisoria
    pdf.setDrawColor(230)
    pdf.line(20, y, 190, y)
    y += 10

    // Gráfica(s): incluir la de pastel siempre; la línea solo si el periodo
    // es mensual o anual. Se colocan lado a lado manteniendo diseño.
    const canvases = Array.from(document.querySelectorAll('canvas'))
    const pieCanvas = canvases[0]
    const lineCanvas = canvases[1]
    if (pieCanvas) {
      pdf.setFontSize(13)
      pdf.setTextColor(33, 37, 41)
      pdf.text('Distribución de recargas', 105, y, { align: 'center' })
      y += 5

      // Márgenes y tamaños en mm para A4 (210mm ancho)
      const marginX = 20
      const gap = 10
      const pieSize = 70
      const lineWidth = 210 - marginX * 2 - pieSize - gap // ajusta al espacio restante
      const chartY = y

      const pieImg = pieCanvas.toDataURL('image/png')
      pdf.addImage(pieImg, 'PNG', marginX, chartY, pieSize, pieSize)

      // Añadir la gráfica de líneas solo para periodos monthly/yearly
      if (period.value !== 'daily' && lineCanvas) {
        try {
          const lineImg = lineCanvas.toDataURL('image/png')
          const lineX = marginX + pieSize + gap
          // ajustar altura para mantener aspecto similar al pie
          const lineHeight = pieSize
          pdf.addImage(lineImg, 'PNG', lineX, chartY, lineWidth, lineHeight)
        } catch (e) {
          // Si falla al generar la imagen de la línea, ignorar y continuar
        }
      }

      y += pieSize + 10
    }

    // LISTA DE ESTUDIANTES
    if (stats.value?.students_list?.length) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(33)
      pdf.text('Detalle de estudiantes', 20, y)
      y += 6

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      // Encabezados
      pdf.setTextColor(120)
      pdf.text('Nombre', 20, y)
      pdf.text('Apellido', 65, y)
      pdf.text('Cédula', 110, y)
      pdf.text('Total Bs', 160, y, { align: 'right' })
      y += 4

      pdf.setDrawColor(230)
      pdf.line(20, y, 190, y)
      y += 4

      pdf.setTextColor(33)

      for (const s of stats.value.students_list) {
        if (y > 270) {
          pdf.addPage()
          y = 20
        }

        pdf.text(s.first_name, 20, y)
        pdf.text(s.last_name, 65, y)
        pdf.text(s.dni, 110, y)
        pdf.text(`Bs ${s.total.toFixed(2)}`, 190, y, {
          align: 'right',
        })
        y += 6
      }
    }

    pdf.save(
      `estadisticas_ce_${period.value}_${
        new Date().toISOString().split('T')[0]
      }.pdf`,
    )
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
      <h1 class="text-xl font-semibold">
        Estadísticas <Loader2 v-if="loading" class="animate-spin ml-2 inline" />
      </h1>

      <div class="flex gap-2">
        <div class="relative">
          <Button variant="outline" @click="filterOpen = true">
            <CalendarIcon class="w-4 h-4" />
          </Button>
          <Badge
            v-if="calendarFilterActive"
            class="absolute -top-2 -right-2 text-[10px]"
          >
            A
          </Badge>
        </div>
        <Select v-model="period" @update:modelValue="onPeriodChange">
          <SelectTrigger>
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Hoy</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
        <!--Boton responsive, en movil solo un icono, en general "Generar Reporte"-->
        <Button :disabled="!stats || loading" @click="downloadPdf">
          <span class="hidden md:inline">Generar Reporte</span>
          <span class="inline md:hidden"><FileDown class="w-4 h-4" /></span>
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
    <!-- CHART + LIST WRAPPER -->
    <div
      v-if="chartData && stats?.students_list?.length"
      class="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <!-- PIE CHART -->
      <div class="bg-white p-4 rounded-xl shadow md:col-span-1">
        <h3 class="text-sm font-medium mb-3">Distribución de recargas</h3>

        <!-- Contenedor que limita tamaño -->
        <div class="max-w-xs mx-auto">
          <Pie :data="chartData" />
        </div>
      </div>

      <!-- LISTA DE ESTUDIANTES -->
      <div class="bg-white rounded-xl shadow overflow-hidden md:col-span-2">
        <div class="px-4 py-3 border-b">
          <h3 class="text-sm font-semibold">
            Estudiantes que realizaron recargas
          </h3>
        </div>

        <!-- SCROLL AQUÍ -->
        <div class="overflow-x-auto max-h-105 overflow-y-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 text-slate-600 sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left">Nombre</th>
                <th class="px-4 py-2 text-left">Apellido</th>
                <th class="px-4 py-2 text-left">Cédula</th>
                <th class="px-4 py-2 text-right">Total Bs</th>
              </tr>
            </thead>

            <tbody class="divide-y">
              <tr
                v-for="(s, idx) in stats.students_list"
                :key="idx"
                class="hover:bg-slate-50"
              >
                <td class="px-4 py-2">{{ s.first_name }}</td>
                <td class="px-4 py-2">{{ s.last_name }}</td>
                <td class="px-4 py-2">{{ s.dni }}</td>
                <td class="px-4 py-2 text-right font-medium">
                  Bs {{ s.total.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow md:col-span-3">
        <h3 class="text-sm font-medium mb-3">Días de Recargas</h3>

        <!-- Contenedor para gráfico más grande -->
        <div class="w-full max-w-4xl mx-auto">
          <div class="h-72 md:h-96">
            <Line
              :data="lineData"
              :options="lineOptions"
              :height="380"
              :width="900"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="bg-white p-6 rounded-xl shadow text-center text-slate-500"
    >
      No hay recargas registradas en este período
    </div>

    <Dialog :open="filterOpen" @update:open="filterOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtrar por fecha</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Aquí está el Calendar de shadcn-vue -->
          <Calendar
            v-model="selectedDate"
            locale="es"
            weekday-format="short"
            class="mx-auto rounded-md border shadow-sm w-fit"
          />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button variant="outline" @click="filterOpen = false">
            Cancelar
          </Button>
          <Button @click="applyFilter"> Aplicar filtro </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped></style>
