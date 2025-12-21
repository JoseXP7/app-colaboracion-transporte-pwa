import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useSupabase } from '@/client/supabase'

export function usePaymentMobileInfo() {
  const { supabase } = useSupabase()

  const loading = ref(false)
  const paymentInfo = ref(null)

  const fetchPaymentInfo = async (facultyId) => {
    loading.value = true

    try {
      const { data, error } = await supabase
        .from('payment_mobile_info')
        .select('cedula, phone, bank')
        .eq('faculty_id', facultyId)
        .single()

      if (error) throw error

      paymentInfo.value = data
    } catch (err) {
      toast.error(err.message || 'Error cargando datos de pago', {
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

  return {
    paymentInfo,
    loading,
    fetchPaymentInfo,
  }
}
