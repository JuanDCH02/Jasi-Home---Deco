import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const SITE_URL = z.string().url().default('https://www.jasihomedeco.com')
    .parse(process.env.SITE_URL)
    .replace(/\/$/, '')

const STATIC_PATHS = ['/', '/productos', '/sobre-nosotros', '/contacto', '/preguntas-frecuentes']

const XML_ENTITIES: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }
const escapeXml = (value: string): string => value.replace(/[<>&'"]/g, (char) => XML_ENTITIES[char])

// Sitemap público (Vercel lo expone en https://www.jasihomedeco.com/sitemap.xml)
export const getSitemap = async (_req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where:   { active: true },
            select:  { slug: true, updatedAt: true, images: { select: { url: true }, orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        })

        const staticUrls = STATIC_PATHS.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`)
        const productUrls = products.map((product) => [
            '  <url>',
            `    <loc>${SITE_URL}/productos/${escapeXml(product.slug)}</loc>`,
            `    <lastmod>${product.updatedAt.toISOString()}</lastmod>`,
            ...product.images.map((image) => `    <image:image><image:loc>${escapeXml(image.url)}</image:loc></image:image>`),
            '  </url>',
        ].join('\n'))

        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
            ...staticUrls,
            ...productUrls,
            '</urlset>',
        ].join('\n')

        res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml)
    } catch (error) {
        console.error('Error al generar el sitemap:', error)
        res.status(500).type('text/plain').send('Error al generar el sitemap')
    }
}
