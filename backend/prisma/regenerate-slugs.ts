import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { syncProductSlug } from '../src/lib/slug'

// Regenera el slug de todos los productos a partir de su nombre. Los slugs
// anteriores quedan en el historial, así que las URLs viejas siguen funcionando.
// Por defecto simula (rollback al final): ejecutá con --apply para guardar.

class DryRunRollback extends Error {}

interface SlugChange {
    id:   number
    name: string
    from: string
    to:   string
}

async function main() {
    const apply = process.argv.includes('--apply')
    const products = await prisma.product.findMany({
        select:  { id: true, name: true, slug: true },
        orderBy: { id: 'asc' },
    })

    const changes: SlugChange[] = []
    try {
        await prisma.$transaction(async (tx) => {
            for (const product of products) {
                const slug = await syncProductSlug(tx, product.id, product.slug, product.name)
                if (slug !== product.slug) changes.push({ id: product.id, name: product.name, from: product.slug, to: slug })
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
