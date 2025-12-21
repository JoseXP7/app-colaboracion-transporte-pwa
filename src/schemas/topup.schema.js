import { z } from 'zod'

export const topupSchema = z.object({
  amount_bs: z
    .number({
      required_error: 'El monto es requerido',
      invalid_type_error: 'Monto inválido',
    })
    .positive('El monto debe ser mayor a 0'),

  reference: z.string().min(1, 'La referencia es requerida'),

  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
})
