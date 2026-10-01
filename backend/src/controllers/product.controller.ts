import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { productSchema, productUpdateSchema } from '../schemas/product.schema'
import { Material, Prisma } from '@prisma/client'
import { generateUniqueProductSlug, syncProductSlug } from '../lib/slug'

const productInclude = {
    category: true,
    images:   { orderBy: { order: 'asc' } },
} satisfies Prisma.ProductInclude

// Público
export const getProducts = async (req: Request, res: Response) => {
    const { page = '1', limit = '12', category, search, material } = req.query

    const where: any = { active: true }
    if (category) where.category = { slug: category }
    if (search)   where.name = { contains: String(search), mode: 'insensitive' }
    if (material) {
        const mat = String(material).toUpperCase()
        if (Object.values(Material).includes(mat as Material)) {
            where.material = mat as Material
        }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                images:   { orderBy: { order: 'asc' } },
            },
            skip:    (Number(page) - 1) * Number(limit),
            take:    Number(limit),
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
    ])

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
}

// Si el slug es uno anterior (el producto fue renombrado) devuelve el producto
// con su slug vigente; el frontend reemplaza la URL.
export const getProduct = async (req: Request, res: Response) => {
    const slug = String(req.params.slug)
    const product =
        await prisma.product.findUnique({ where: { slug }, include: productInclude }) ??
        (await prisma.productSlugHistory.findUnique({
            where:   { slug },
            include: { product: { include: productInclude } },
        }))?.product
    if (!product) { res.status(404).json({ error: 'Producto no encontrado' }); return }
    res.json(product)
}

// Admin — todos los productos (activos e inactivos)
export const getAllProducts = async (req: Request, res: Response) => {
    const { page = '1', limit = '50', search } = req.query
    const where: any = {}
    if (search) where.name = { contains: String(search), mode: 'insensitive' }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true, images: { orderBy: { order: 'asc' } } },
            skip:    (Number(page) - 1) * Number(limit),
            take:    Number(limit),
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
    ])

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
}

// Admin
export const createProduct = async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    const { images, ...productData } = parsed.data as any
    const slug = await generateUniqueProductSlug(prisma, productData.name)

    const product = await prisma.product.create({
        data: {
            ...productData,
            slug,
            images: images?.length
                ? { create: images.map((url: string, i: number) => ({ url, order: i })) }
                : undefined,
        },
        include: { category: true, images: { orderBy: { order: 'asc' } } },
    })
    res.status(201).json(product)
}

export const updateProduct = async (req: Request, res: Response) => {
    const parsed = productUpdateSchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return }

    const { images, ...productData } = parsed.data as any
    // Actualiza el producto
    const product = await prisma.product.update({
        where: { id: Number(req.params.id) }, data:  productData,
    })

    // El slug sigue al nombre: si cambió, se regenera y el anterior queda en el historial
    if (productData.name !== undefined) {
        await prisma.$transaction((tx) => syncProductSlug(tx, product.id, product.slug, product.name))
    }

    // Si vienen imágenes nuevas, reemplaza todas
    if (images !== undefined) {
        await prisma.productImage.deleteMany({ where: { productId: product.id } })
        if (images.length > 0) {
            await prisma.productImage.createMany({
                data: images.map((url: string, i: number) => ({
                    url, order: i, productId: product.id,
                })),
            })
        }
    }

    const updated = await prisma.product.findUnique({
        where:   { id: product.id },
        include: { category: true, images: { orderBy: { order: 'asc' } } },
    })
    res.json(updated)
}

export const deleteProduct = async (req: Request, res: Response) => {
    await prisma.product.update({
        where: { id: Number(req.params.id) },
        data: { active: false },
    })
    return res.json({ message: 'Producto desactivado' })
}