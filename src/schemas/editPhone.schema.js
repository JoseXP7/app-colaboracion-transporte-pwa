import { z } from 'zod'
import { completeProfileSchema } from './completeProfile.schema'

export const editPhoneSchema = completeProfileSchema.pick({
  phone_number: true,
})
