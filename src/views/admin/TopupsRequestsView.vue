<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useSupabase } from '@/client/supabase'
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
          last_name
        )
      `
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
              {{ topup.user.first_name }} {{ topup.user.last_name }}
            </p>
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
          <Button
            size="sm"
            class="flex-1"
            :disabled="processingId === topup.id"
            @click="approve(topup.id)"
          >
            <Check class="w-4 h-4 mr-1" />
            Aprobar
          </Button>

          <Button
            size="sm"
            variant="destructive"
            class="flex-1"
            :disabled="processingId === topup.id"
            @click="reject(topup.id)"
          >
            <X class="w-4 h-4 mr-1" />
            Rechazar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
