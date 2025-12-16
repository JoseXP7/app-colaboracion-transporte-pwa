import { z } from 'zod'

export const generateQrSchema = z.object({
  amount_bs: z
    .number({
      required_error: 'Debes indicar un monto',
      invalid_type_error: 'El monto debe ser un número',
    })
    .min(20, 'El monto debe ser mínimo 20 Bs'),
})
