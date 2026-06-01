import { z } from 'zod'

export const orderCreateSchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.number().int().positive(),
                quantity:  z.number().int().min(1),
            })
        )
        .min(1, 'El carrito está vacío'),
})

export const orderStatusSchema = z.object({
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})
