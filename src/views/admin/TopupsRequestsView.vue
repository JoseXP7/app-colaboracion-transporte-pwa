<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useSupabase } from '@/client/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, X } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'

const { supabase } = useSupabase()
const userStore = useUserStore()

const loading = ref(false)
const processingId = ref(null)
const topups = ref([])

const fetchTopups = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('topup_requests')
      .select(
        `
        id,
        amount_bs,
        reference,
        created_at,
        status,
        user:profiles!topup_requests_user_id_fkey (
          first_name,
          last_name,
          cedula,
          phone_number
        )
      `,
      )
      .eq('faculty_id', userStore.profile.faculty_id)
      .eq('status', 'pendiente')
      .order('created_at', { ascending: false })

    if (error) throw error
    topups.value = data
  } catch (err) {
    toast.error('Error cargando recargas pendientes', {
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

/* =========================
   APROBAR (RPC)
========================= */
const approve = async (id) => {
  processingId.value = id

  try {
    const { error } = await supabase.rpc('approve_topup_tx', {
      p_topup_id: id,
      p_admin_id: userStore.user.id,
    })

    if (error) throw error

    toast.success('Recarga aprobada correctamente', {
      position: 'bottom-right',
      duration: 5000,
    })

    await fetchTopups()
  } catch (err) {
    toast.error(err.message || 'Error aprobando la recarga', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  } finally {
    processingId.value = null
  }
}

/* =========================
   RECHAZAR (UPDATE SIMPLE)
========================= */
const reject = async (id) => {
  processingId.value = id

  try {
    const { error } = await supabase
      .from('topup_requests')
      .update({
        status: 'rechazada',
        reviewed_by: userStore.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    toast.success('Recarga rechazada', {
      position: 'bottom-right',
      duration: 5000,
    })

    await fetchTopups()
  } catch (err) {
    toast.error(err.message || 'Error rechazando la recarga', {
      position: 'bottom-right',
      duration: 5000,
      style: {
        backgroundColor: 'var(--destructive)',
        color: '#fff',
        border: 'none',
      },
    })
  } finally {
    processingId.value = null
  }
}

onMounted(fetchTopups)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-900">Recargas pendientes</h1>

    <div v-if="loading" class="flex items-center text-sm text-slate-500">
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      Cargando recargas…
    </div>

    <div v-else-if="!topups.length" class="text-sm text-slate-500">
      No hay recargas pendientes 🎉
    </div>

    <div class="space-y-4">
      <div
        v-for="topup in topups"
        :key="topup.id"
        class="bg-white rounded-2xl shadow-sm p-4 space-y-3"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-slate-900">
              {{ topup.user.first_name }} {{ topup.user.last_name }} - C.I.
              {{ topup.user.cedula }}
            </p>
            <!-- WhatsApp green button -->
            <a
              :href="`https://wa.me/58${topup.user.phone_number}`"
              target="_blank"
              class="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-sm text-white px-2 py-1 rounded-md mt-1 mb-1"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-whatsapp"
                viewBox="0 0 16 16"
              >
                <path
                  d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"
                />
              </svg>
              Contacto: {{ topup.user.phone_number }}</a
            >
            <p class="text-xs text-slate-500">
              {{ new Date(topup.created_at).toLocaleDateString() }}
            </p>
          </div>

          <Badge variant="outline">Pendiente</Badge>
        </div>

        <div class="text-sm">
          <p><strong>Monto:</strong> Bs {{ topup.amount_bs.toFixed(2) }}</p>
          <p><strong>Referencia:</strong> {{ topup.reference }}</p>
        </div>

        <div class="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button size="sm" class="flex-1">
                <Check class="w-4 h-4 mr-1" />
                Aprobar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle
                  >¿Desea aprobar esta recarga?</AlertDialogTitle
                >
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se sumara saldo a la wallet
                  del estudiante seleccionado.
                  <p>Datos del solicitante:</p>
                  <ul class="mt-2 list-disc list-inside">
                    <li>
                      <strong>Nombre:</strong>
                      {{ topup.user.first_name }} {{ topup.user.last_name }}
                    </li>
                    <li><strong>Cédula:</strong> {{ topup.user.cedula }}</li>
                    <li>
                      <strong>Teléfono:</strong> {{ topup.user.phone_number }}
                    </li>
                  </ul>
                  <p>Datos de la recarga:</p>
                  <ul class="mt-2 list-disc list-inside">
                    <li>
                      <strong>Monto:</strong> Bs
                      {{ topup.amount_bs.toFixed(2) }}
                    </li>
                    <li><strong>Referencia:</strong> {{ topup.reference }}</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  :disabled="processingId === topup.id"
                  @click="approve(topup.id)"
                  >Si! Confirmar</AlertDialogAction
                >
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button size="sm" variant="destructive" class="flex-1">
                <X class="w-4 h-4 mr-1" />
                Rechazar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle
                  >¿Desea rechazar esta recarga?</AlertDialogTitle
                >
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto rechazará la recarga y
                  no se sumará saldo a la wallet del estudiante seleccionado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  :disabled="processingId === topup.id"
                  @click="reject(topup.id)"
                  class="bg-destructive text-white hover:bg-destructive/90"
                  >Si! Rechazar</AlertDialogAction
                >
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  </div>
</template>
