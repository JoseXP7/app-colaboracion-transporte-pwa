import { z } from 'zod'

export const paymentMobileSchema = z.object({
  cedula: z.string().regex(/^V-\d{7,8}$/, {
    message: 'La cédula debe tener el formato V-12345678',
  }),

  phone: z
    .string()
    .length(12, 'El número debe tener el formato 0412-1234567')
    .regex(/^(0412|0414|0416|0424|0426|0422)-\d{7}$/, {
      message: 'Formato inválido (Ej: 0412-1234567)',
    }),

  bank: z
    .string()
    .min(6, 'Banco requerido')
    .max(50, 'Nombre de banco muy largo'),
})
