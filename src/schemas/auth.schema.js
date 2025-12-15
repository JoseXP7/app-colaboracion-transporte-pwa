import { z } from 'zod'

export const registerSchema = z
  .object({
    email: z.email('Debes proporcionar un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[A-Za-z])(?=.*\d).*$/, {
        message: 'La contraseña debe contener letras y números',
      }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  })
