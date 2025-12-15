import { z } from 'zod'

export const completeProfileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  phone_number: z
    .string()
    .min(11, 'El número de teléfono es requerido')
    .max(11, 'El número de teléfono debe tener 11 dígitos')
    .regex(/^(0412|0414|0416|0424|0426|0422)\d{7}$/, {
      message: 'El número debe ser venezolano válido (Ej: 04121234567)',
    }),
  cedula: z.string().regex(/^V-\d{7,8}$/, {
    message: 'La cédula debe tener el formato V-12345678',
  }),
  faculty_id: z.number().min(1, 'La facultad es requerida'),
})
