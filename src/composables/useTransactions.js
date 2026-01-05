import { useSupabase } from '@/client/supabase'

export function useTransactions() {
  const { supabase } = useSupabase()

  const fetchTransactions = async ({
    limit = 20,
    page = 1,
    range = 'month',
  } = {}) => {
    const offset = (page - 1) * limit

    const { data, error } = await supabase.rpc('get_user_transactions', {
      p_limit: limit,
      p_offset: offset,
      p_range: range,
    })

    if (error) throw error
    return data
  }

  return {
    fetchTransactions,
  }
}
