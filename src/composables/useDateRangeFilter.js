// Filtro de rango de fechas reutilizable para transacciones y recargas
import { ref, computed } from 'vue'

export function useDateRangeFilter() {
  const range = ref('month') // day | week | month

  // Devuelve el rango de fechas según la opción seleccionada
  const dateRange = computed(() => {
    const now = new Date()
    let start, end
    end = new Date(now)
    switch (range.value) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        start = new Date(now)
        start.setDate(now.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        break
      case 'month':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }
    return { start, end }
  })

  return {
    range,
    dateRange,
  }
}
