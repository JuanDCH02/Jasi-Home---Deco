import 'dotenv/config'
import { Prisma } from '@prisma/client'
import { prisma } from '../src/lib/prisma'
import { generateUniqueProductSlug, slugify, syncProductSlug } from '../src/lib/slug'

// Regenera el slug de todos los productos a partir de su nombre. Los slugs
// anteriores quedan en el historial, así que las URLs viejas siguen funcionando.
// Los productos activos tienen prioridad: si uno desactivado ocupa el slug que le
// corresponde a uno activo, el desactivado pasa a un sufijo ("-2") y la URL queda
// para el visible.
// Por defecto simula (rollback al final): ejecutá con --apply para guardar.

class DryRunRollback extends Error {}

interface SlugChange {
    id:     number
    name:   string
    from:   string
    to:     string
    motivo: string
}

const productSelect = { id: true, name: true, slug: true, active: true } satisfies Prisma.ProductSelect

/**
 * Libera para cada producto activo el slug que le corresponde si lo ocupa uno
 * desactivado. El slug liberado no va al historial del desactivado: pasa a ser
 * la URL del producto activo.
 */
async function releaseSlugsHeldByInactive(tx: Prisma.TransactionClient): Promise<SlugChange[]> {
    const activeProducts = await tx.product.findMany({ where: { active: true }, select: productSelect, orderBy: { id: 'asc' } })
    const released: SlugChange[] = []

    for (const product of activeProducts) {
        const slug = slugify(product.name)
        if (!slug || slug === product.slug) continue

        const holder = await tx.product.findFirst({ where: { slug, active: false }, select: productSelect })
        if (!holder) continue

        // Sin productId: el slug base cuenta como ocupado y devuelve el primer sufijo libre
        const nextSlug = await generateUniqueProductSlug(tx, holder.name)
        await tx.product.update({ where: { id: holder.id }, data: { slug: nextSlug } })
        released.push({ id: holder.id, name: holder.name, from: slug, to: nextSlug, motivo: `cede su URL al #${product.id}` })
    }
    return released
}

async function main() {
    const apply = process.argv.includes('--apply')
    const changes: SlugChange[] = []

    try {
        await prisma.$transaction(async (tx) => {
            changes.push(...await releaseSlugsHeldByInactive(tx))

            // Se leen después de liberar, para trabajar con los slugs vigentes
            const products = await tx.product.findMany({
                select:  productSelect,
                orderBy: [{ active: 'desc' }, { id: 'asc' }],
            })
            for (const product of products) {
                const slug = await syncProductSlug(tx, product.id, product.slug, product.name)
                if (slug !== product.slug) {
                    changes.push({ id: product.id, name: product.name, from: product.slug, to: slug, motivo: product.active ? 'nombre' : 'nombre (inactivo)' })
                }
            }
            if (!apply) throw new DryRunRollback()
        }, { timeout: 120_000 })
    } catch (error) {
        if (!(error instanceof DryRunRollback)) throw error
    }

    console.table(changes)
    console.log(apply
        ? `✅ ${changes.length} slugs actualizados`
        : `🔎 Simulación: ${changes.length} slugs cambiarían. Ejecutá con --apply para guardarlos.`)
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
