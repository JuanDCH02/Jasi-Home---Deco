import { z } from 'zod'

export const contactSchema = z.object({
    name: z.string().trim().min(2, 'El nombre es demasiado corto').max(100),
    email: z.string().trim().email('Email inválido').max(150),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    message: z.string().trim().min(5, 'El mensaje es demasiado corto').max(2000),
})

export type ContactInput = z.infer<typeof contactSchema>
