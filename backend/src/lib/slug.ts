import { Prisma } from '@prisma/client'

type Db = Prisma.TransactionClient

/** Convierte un texto en slug ASCII: "Cómoda Aura -Bali" → "comoda-aura-bali". */
export const slugify = (text: string): string =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

/**
 * Devuelve un slug libre derivado del nombre. Está ocupado si es el slug actual
 * de otro producto o un slug histórico de otro producto; en ese caso se agrega
 * un sufijo numérico ("-2", "-3"...).
 */
export const generateUniqueProductSlug = async (db: Db, name: string, productId?: number): Promise<string> => {
    const base = slugify(name) || 'producto'

    const takenByProducts = await db.product.findMany({
        where:  { slug: { startsWith: base }, ...(productId === undefined ? {} : { id: { not: productId } }) },
        select: { slug: true },
    })
    const takenByHistory = await db.productSlugHistory.findMany({
        where:  { slug: { startsWith: base }, ...(productId === undefined ? {} : { productId: { not: productId } }) },
        select: { slug: true },
    })
    const taken = new Set([...takenByProducts, ...takenByHistory].map((row) => row.slug))

    let candidate = base
    for (let suffix = 2; taken.has(candidate); suffix++) candidate = `${base}-${suffix}`
    return candidate
}

/**
 * Alinea el slug del producto con su nombre. Si cambia, el slug anterior queda
 * en el historial para que las URLs viejas sigan resolviendo. Devuelve el slug vigente.
 */
export const syncProductSlug = async (db: Db, productId: number, currentSlug: string, name: string): Promise<string> => {
    const nextSlug = await generateUniqueProductSlug(db, name, productId)
    if (nextSlug === currentSlug) return currentSlug

    // Si vuelve a un nombre que ya tuvo, ese slug deja de ser histórico
    await db.productSlugHistory.deleteMany({ where: { slug: nextSlug, productId } })
    await db.productSlugHistory.upsert({
        where:  { slug: currentSlug },
        update: { productId },
        create: { slug: currentSlug, productId },
    })
    await db.product.update({ where: { id: productId }, data: { slug: nextSlug } })
    return nextSlug
}
