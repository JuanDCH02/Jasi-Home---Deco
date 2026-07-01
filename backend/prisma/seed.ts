import 'dotenv/config'
import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient, Material } from '@prisma/client'
import bcrypt from 'bcryptjs'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Iniciando seed...')

    // ── ADMIN ──────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where:  { email: 'admin@jasihome.com' },
        update: {},
        create: {
            name:     'Admin JasiHome',
            email:    'admin@jasihome.com',
            password: hashedPassword,
            role:     'ADMIN',
        },
    })
    console.log('✅ Admin creado:', admin.email)

    // ── CATEGORÍAS ─────────────────────────────────────
    const categorias = await Promise.all([
        prisma.category.upsert({
            where:  { slug: 'decoracion' },
            update: {},
            create: { name: 'Decoración', slug: 'decoracion' },
        }),
        prisma.category.upsert({
            where:  { slug: 'textiles' },
            update: {},
            create: { name: 'Textiles', slug: 'textiles' },
        }),
        prisma.category.upsert({
            where:  { slug: 'iluminacion' },
            update: {},
            create: { name: 'Iluminación', slug: 'iluminacion' },
        }),
        prisma.category.upsert({
            where:  { slug: 'cocina' },
            update: {},
            create: { name: 'Cocina', slug: 'cocina' },
        }),
    ])
    console.log('✅ Categorías creadas:', categorias.map(c => c.name).join(', '))

    const [decoracion, textiles, iluminacion, cocina] = categorias

    // ── PRODUCTOS ──────────────────────────────────────
    const productos = [
        {
            name:        'Florero cerámica artesanal',
            slug:        'florero-ceramica-artesanal',
            description: 'Florero de cerámica elaborado a mano por artesanos locales. Ideal para centros de mesa o estantes. Su acabado en terracota aporta calidez a cualquier ambiente. 22cm de alto × 14cm de diámetro.',
            price:       4200,
            discount:    15,
            stock:       8,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&q=80'],
        },
        {
            name:        'Set velas aromáticas x3',
            slug:        'set-velas-aromaticas-x3',
            description: 'Set de 3 velas aromáticas de soja con aromas a lavanda, vainilla y cedro. Duración aproximada de 40 horas cada una. Presentadas en frasco de vidrio reutilizable.',
            price:       2800,
            discount:    10,
            stock:       15,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1602874801006-8e8e1d346d80?w=600&q=80'],
        },
        {
            name:        'Maceta minimalista blanca',
            slug:        'maceta-minimalista-blanca',
            description: 'Maceta de cemento con acabado liso en blanco mate. Diseño minimalista que combina con cualquier estilo de decoración. Incluye plato. Diámetro 15cm.',
            price:       3500,
            discount:    0,
            stock:       12,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80'],
        },
        {
            name:        'Cuadro abstracto moderno',
            slug:        'cuadro-abstracto-moderno',
            description: 'Impresión artística en lienzo con bastidor de madera. Tonos tierra y verde que complementan espacios modernos y nórdicos. 40×50cm.',
            price:       6900,
            discount:    20,
            stock:       5,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80'],
        },
        {
            name:        'Almohadón lino natural',
            slug:        'almohadon-lino-natural',
            description: 'Almohadón de lino 100% natural con relleno de vellón siliconado. Tono beige natural que va con todo. Funda desmontable con cierre. 45×45cm.',
            price:       3200,
            discount:    0,
            stock:       20,
            categoryId:  textiles.id,
            images:      ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'],
        },
        {
            name:        'Manta tejida mostaza',
            slug:        'manta-tejida-mostaza',
            description: 'Manta artesanal tejida en telar con hilo de algodón y acrílico. Color mostaza vibrante, perfecta para sofás y pies de cama. 130×170cm.',
            price:       5500,
            discount:    5,
            stock:       7,
            categoryId:  textiles.id,
            images:      ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80'],
        },
        {
            name:        'Lámpara de escritorio bambú',
            slug:        'lampara-escritorio-bambu',
            description: 'Lámpara de escritorio con estructura de bambú natural y pantalla de lino. Luz cálida 2700K, casquillo E27. Incluye cable de 1.5m y enchufe. Altura 45cm.',
            price:       7800,
            discount:    0,
            stock:       6,
            categoryId:  iluminacion.id,
            images:      ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80'],
        },
        {
            name:        'Portavelas colgante hierro',
            slug:        'portavelas-colgante-hierro',
            description: 'Portavelas colgante de hierro forjado con acabado negro mate. Set de 3 tamaños. Ideal para crear ambiente en espacios interiores y exteriores cubiertos.',
            price:       4100,
            discount:    10,
            stock:       9,
            categoryId:  iluminacion.id,
            images:      ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80'],
        },
        {
            name:        'Tabla de madera con mango',
            slug:        'tabla-madera-con-mango',
            description: 'Tabla de corte en madera de acacia con mango ergonómico. Tratada con aceite vegetal apto para alimentos. 35×20cm. Ideal como tabla de quesos y fiambres.',
            price:       2900,
            discount:    0,
            stock:       18,
            material:    Material.ALAMO,
            categoryId:  cocina.id,
            images:      ['https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&q=80'],
        },
        {
            name:        'Set bowls cerámica x4',
            slug:        'set-bowls-ceramica-x4',
            description: 'Set de 4 bowls de cerámica artesanal en tonos tierra. Aptos para microondas y lavavajillas. Diámetro 14cm. Cada uno ligeramente distinto, como toda pieza artesanal.',
            price:       5200,
            discount:    15,
            stock:       4,
            categoryId:  cocina.id,
            images:      ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80'],
        },
        {
            name:        'Porta especias pared x6',
            slug:        'porta-especias-pared-x6',
            description: 'Set de 6 frascos de vidrio con tapa hermética y soporte de pared en madera de pino. Incluye etiquetas de pizarra y tizas. Montaje con tornillos incluidos.',
            price:       4600,
            discount:    0,
            stock:       11,
            material:    Material.PINO,
            categoryId:  cocina.id,
            images:      ['https://images.unsplash.com/photo-1532186773960-85649e5cb70b?w=600&q=80'],
        },
        {
            name:        'Estante flotante pino',
            slug:        'estante-flotante-pino',
            description: 'Estante de pared en madera de pino macizo. Acabado natural con barniz satinado al agua. Incluye soportes y tornillos de montaje. 60×20cm, soporta hasta 15kg.',
            price:       5800,
            discount:    0,
            stock:       10,
            material:    Material.PINO,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'],
        },
        {
            name:        'Bandeja rectangular álamo',
            slug:        'bandeja-rectangular-alamo',
            description: 'Bandeja decorativa en madera de álamo con acabado natural. Ideal para organizar y decorar mesas de centro o aparadores. 40×25cm.',
            price:       3800,
            discount:    10,
            stock:       14,
            material:    Material.ALAMO,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'],
        },
        {
            name:        'Espejo redondo ratán',
            slug:        'espejo-redondo-ratan',
            description: 'Espejo circular con marco tejido en ratán natural. Diámetro 60cm. Aporta textura y calidez a paredes. Incluye accesorio de pared para colgar.',
            price:       8900,
            discount:    0,
            stock:       3,
            categoryId:  decoracion.id,
            images:      ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80'],
        },
    ]

    for (const { images, ...data } of productos) {
        const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
        if (existing) {
            await prisma.product.update({ where: { slug: data.slug }, data })
        } else {
            await prisma.product.create({
                data: {
                    ...data,
                    images: { create: images.map((url, i) => ({ url, order: i })) },
                },
            })
        }
        console.log(`  ✅ ${data.name}`)
    }

    // ── CONSULTAS DE PRUEBA (ÓRDENES) ──────────────────────
    // Limpiamos para que el re-seed no acumule consultas duplicadas.
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()

    const allProducts = await prisma.product.findMany({
        select: { id: true, price: true, discount: true },
    })

    const STATUSES = ['PENDING', 'PENDING', 'PENDING', 'PAID', 'PAID', 'DELIVERED', 'SHIPPED', 'CANCELLED'] as const
    const rnd = (max: number) => Math.floor(Math.random() * max)
    const finalPrice = (price: any, discount: number) => Number(price) * (1 - discount / 100)

    const NUM_ORDERS = 38
    for (let i = 0; i < NUM_ORDERS; i++) {
        // Fecha aleatoria dentro de los últimos 30 días.
        const daysAgo   = rnd(30)
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - rnd(86_400_000))

        // 1 a 4 ítems distintos.
        const count    = 1 + rnd(4)
        const shuffled = [...allProducts].sort(() => Math.random() - 0.5).slice(0, count)
        const items    = shuffled.map(p => ({
            productId: p.id,
            quantity:  1 + rnd(3),
            unitPrice: finalPrice(p.price, p.discount),
        }))
        const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)

        await prisma.order.create({
            data: {
                status:    STATUSES[rnd(STATUSES.length)],
                total,
                createdAt,
                items:     { create: items },
            },
        })
    }
    console.log(`✅ ${NUM_ORDERS} consultas de prueba creadas`)

    console.log('\n🎉 Seed completado exitosamente')
    console.log('─────────────────────────────────')
    console.log('Admin:     admin@jasihome.com')
    console.log('Password:  admin123')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
