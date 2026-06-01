import { z } from 'zod'

export const productSchema = z.object({
    name:        z.string().min(2),
    description: z.string().optional(),
    material:    z.enum(['ALAMO', 'PINO']).optional(),
    price:       z.number().positive(),
    stock:       z.number().int().min(0),
    discount:    z.number().min(0).max(50).optional(),
    active:      z.boolean().optional(),
    categoryId:  z.number().int().positive(),
    images:      z.array(z.string().url()).optional(),
})

export const productUpdateSchema = productSchema.partial()