import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { orderCreateSchema, orderStatusSchema } from '../schemas/order.schema'
import { OrderStatus, Prisma } from '@prisma/client'

// Precio unitario final aplicando descuento — misma fórmula que el carrito del front.
const finalPrice = (price: Prisma.Decimal, discount: number) =>
    Number(price) * (1 - discount / 100)

// Ingresos confirmados = consultas que se concretaron como venta.
const CONFIRMED: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED']

// ─── Público: registrar una consulta de compra (carrito → orden) ──────────────
export const createOrder = async (req: Request, res: Response) => {
    const parsed = orderCreateSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const { items } = parsed.data
    const productIds = items.map(i => i.productId)

    // Recalculamos precios en el servidor (no confiamos en el cliente).
    const products = await prisma.product.findMany({
        where:  { id: { in: productIds } },
        select: { id: true, price: true, discount: true },
    })
    const byId = new Map(products.map(p => [p.id, p]))

    const orderItems = items
        .map(item => {
            const product = byId.get(item.productId)
            if (!product) return null
            return {
                productId: product.id,
                quantity:  item.quantity,
                unitPrice: finalPrice(product.price, product.discount),
            }
        })
        .filter((i): i is NonNullable<typeof i> => i !== null)

    if (orderItems.length === 0) {
        res.status(400).json({ error: 'Ningún producto válido en la consulta' })
        return
    }

    const total = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    const order = await prisma.order.create({
        data: {
            total,
            items: { create: orderItems },
        },
        include: { items: true },
    })

    res.status(201).json(order)
}

// ─── Admin: listado de consultas con filtro por estado ────────────────────────
export const getOrders = async (req: Request, res: Response) => {
    const { page = '1', limit = '20', status } = req.query

    const where: Prisma.OrderWhereInput = {}
    if (status && typeof status === 'string' && status in OrderStatus) {
        where.status = status as OrderStatus
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: { orderBy: { order: 'asc' }, take: 1 }, category: true },
                        },
                    },
                },
            },
            skip:    (Number(page) - 1) * Number(limit),
            take:    Number(limit),
            orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
    ])

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
}

// ─── Admin: cambiar el estado de una consulta ─────────────────────────────────
export const updateOrderStatus = async (req: Request, res: Response) => {
    const parsed = orderStatusSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const order = await prisma.order.update({
        where: { id: Number(req.params.id) },
        data:  { status: parsed.data.status },
    })

    res.json(order)
}

// ─── Admin: métricas agregadas del dashboard ──────────────────────────────────
export const getDashboardStats = async (_req: Request, res: Response) => {
    const now            = new Date()
    const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPrevMon = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const last30         = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
    last30.setHours(0, 0, 0, 0)

    const [
        statusGroups,
        consultasMes,
        consultasMesPrev,
        recentOrders,
        soldItems,
        products,
        totalCategorias,
        stockBajoListaRaw,
    ] = await Promise.all([
        // Conteo e ingreso por estado.
        prisma.order.groupBy({
            by:     ['status'],
            _count: { _all: true },
            _sum:   { total: true },
        }),
        prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.order.count({
            where: { createdAt: { gte: startOfPrevMon, lt: startOfMonth } },
        }),
        // Órdenes de los últimos 30 días para la tendencia diaria.
        prisma.order.findMany({
            where:   { createdAt: { gte: last30 } },
            select:  { createdAt: true, total: true },
            orderBy: { createdAt: 'asc' },
        }),
        // Ítems vendidos (no cancelados) para top productos e ingresos por categoría.
        prisma.orderItem.findMany({
            where:   { order: { status: { not: 'CANCELLED' } } },
            include: {
                product: {
                    include: { category: true, images: { orderBy: { order: 'asc' }, take: 1 } },
                },
            },
        }),
        // Productos para las cards de stock/estado.
        prisma.product.findMany({ select: { active: true, stock: true } }),
        prisma.category.count(),
        // Lista de stock bajo para la sección accionable del dashboard.
        prisma.product.findMany({
            where:   { active: true, stock: { lte: 3 } },
            select:  { id: true, name: true, stock: true, images: { orderBy: { order: 'asc' }, take: 1 } },
            orderBy: { stock: 'asc' },
            take:    8,
        }),
    ])

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const totalConsultas = statusGroups.reduce((s, g) => s + g._count._all, 0)

    const ingresosConfirmados = statusGroups
        .filter(g => CONFIRMED.includes(g.status))
        .reduce((s, g) => s + Number(g._sum.total ?? 0), 0)

    const ingresosEstimados = statusGroups
        .filter(g => g.status !== 'CANCELLED')
        .reduce((s, g) => s + Number(g._sum.total ?? 0), 0)

    const confirmadasCount = statusGroups
        .filter(g => CONFIRMED.includes(g.status))
        .reduce((s, g) => s + g._count._all, 0)

    const ticketPromedio = confirmadasCount > 0 ? ingresosConfirmados / confirmadasCount : 0

    // ── Distribución por estado ─────────────────────────────────────────────────
    const porEstado: Record<OrderStatus, number> = {
        PENDING: 0, PAID: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
    }
    for (const g of statusGroups) porEstado[g.status] = g._count._all

    // ── Consultas por día (relleno de días vacíos) ──────────────────────────────
    const dayMap = new Map<string, { count: number; total: number }>()
    for (let i = 0; i < 30; i++) {
        const d = new Date(last30.getTime() + i * 24 * 60 * 60 * 1000)
        dayMap.set(d.toISOString().slice(0, 10), { count: 0, total: 0 })
    }
    for (const o of recentOrders) {
        const key = o.createdAt.toISOString().slice(0, 10)
        const entry = dayMap.get(key)
        if (entry) {
            entry.count += 1
            entry.total += Number(o.total)
        }
    }
    const consultasPorDia = Array.from(dayMap.entries()).map(([date, v]) => ({
        date, count: v.count, total: v.total,
    }))

    // ── Top productos e ingresos por categoría ──────────────────────────────────
    const prodMap = new Map<number, { id: number; name: string; image: string | null; cantidad: number; ingresos: number }>()
    const catMap  = new Map<number, { id: number; name: string; ingresos: number; cantidad: number }>()

    for (const item of soldItems) {
        const revenue = Number(item.unitPrice) * item.quantity
        const p = item.product

        const prod = prodMap.get(p.id) ?? {
            id: p.id, name: p.name, image: p.images[0]?.url ?? null, cantidad: 0, ingresos: 0,
        }
        prod.cantidad += item.quantity
        prod.ingresos += revenue
        prodMap.set(p.id, prod)

        const c = p.category
        const cat = catMap.get(c.id) ?? { id: c.id, name: c.name, ingresos: 0, cantidad: 0 }
        cat.ingresos += revenue
        cat.cantidad += item.quantity
        catMap.set(c.id, cat)
    }

    const topProductos = Array.from(prodMap.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 8)

    const ingresosPorCategoria = Array.from(catMap.values())
        .sort((a, b) => b.ingresos - a.ingresos)

    // ── Cards de productos ──────────────────────────────────────────────────────
    const productosActivos   = products.filter(p => p.active).length
    const productosInactivos = products.filter(p => !p.active).length
    const stockBajo          = products.filter(p => p.active && p.stock <= 3).length

    const stockBajoLista = stockBajoListaRaw.map(p => ({
        id:    p.id,
        name:  p.name,
        stock: p.stock,
        image: p.images[0]?.url ?? null,
    }))

    res.json({
        kpis: {
            totalConsultas,
            consultasMes,
            consultasMesPrev,
            ingresosConfirmados,
            ingresosEstimados,
            ticketPromedio,
        },
        porEstado,
        consultasPorDia,
        topProductos,
        ingresosPorCategoria,
        productosActivos,
        productosInactivos,
        stockBajo,
        totalCategorias,
        stockBajoLista,
    })
}
