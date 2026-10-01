// Función edge de Vercel: HTML del detalle de producto con metadatos, JSON-LD y
// contenido <noscript>, para buscadores y bots de redes que no ejecutan JS.
// También responde 404 reales (rutas inexistentes) y 301 para slugs anteriores.
// vercel.json reescribe /productos/:slug → /api/render?slug=:slug y el resto de
// rutas desconocidas → /api/render.
import { z } from 'zod';
import { getMaterialLabel } from '../src/utils/materials';
import { PAGE_META, PRODUCT_JSONLD_ID, buildProductSeo, type SeoProduct } from '../src/utils/seo';
import { injectIntoTemplate, renderHeadTags, renderProductNoscript } from '../src/utils/seoHtml';

export const config = { runtime: 'edge' };

// El runtime edge no permite evaluar código (new Function): Zod sin compilación JIT
z.config({ jitless: true });

/** Marca los pedidos de plantillas a la propia app: si faltara una, corta el bucle de rewrites. */
const INTERNAL_REQUEST_HEADER = 'x-jasihome-render';
const API_TIMEOUT_MS = 5000;

const TEMPLATES = {
    product: '/_pages/producto.html',
    notFound: '/404.html',
} as const;

const CACHE_CONTROL = {
    page: 'public, s-maxage=300, stale-while-revalidate=86400',
    redirect: 'public, s-maxage=3600',
    notFound: 'public, s-maxage=60',
    fallback: 'no-store',
} as const;

const productSchema = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullish().transform((value) => value ?? undefined),
    price: z.coerce.number(),
    discount: z.number(),
    stock: z.number(),
    material: z.enum(['ALAMO', 'PINO']).nullish().transform((value) => value ?? undefined),
    active: z.boolean(),
    category: z.object({ name: z.string() }).nullish(),
    images: z.array(z.object({ url: z.string() })),
}) satisfies z.ZodType<SeoProduct>;

type ProductLookup = { found: true; product: SeoProduct } | { found: false };

// Las plantillas cambian solo con cada deploy, y cada deploy tiene sus propias instancias
const templateCache = new Map<string, Promise<string>>();

const loadTemplate = (request: Request, path: string): Promise<string> => {
    const url = new URL(path, request.url).href;
    const cached = templateCache.get(url);
    if (cached) return cached;

    const template = fetch(url, {
        // La cookie permite leer la plantilla en previews con Vercel Authentication
        headers: { cookie: request.headers.get('cookie') ?? '', [INTERNAL_REQUEST_HEADER]: '1' },
    }).then((response) => {
        if (!response.ok) throw new Error(`Plantilla ${path}: HTTP ${response.status}`);
        return response.text();
    });
    templateCache.set(url, template);
    template.catch(() => templateCache.delete(url));
    return template;
};

const htmlResponse = (html: string, status: number, cacheControl: string): Response =>
    new Response(html, {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cacheControl },
    });

const fetchProduct = async (slug: string): Promise<ProductLookup> => {
    const apiUrl = z.string().url().parse(process.env.VITE_API_URL).replace(/\/$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
        const response = await fetch(`${apiUrl}/api/products/${encodeURIComponent(slug)}`, {
            signal: controller.signal,
        });
        if (response.status === 404) return { found: false };
        if (!response.ok) throw new Error(`API de productos: HTTP ${response.status}`);
        return { found: true, product: productSchema.parse(await response.json()) };
    } finally {
        clearTimeout(timeout);
    }
};

const renderProductPage = async (request: Request, slug: string): Promise<Response> => {
    const lookup = await fetchProduct(slug);
    if (!lookup.found) {
        const template = await loadTemplate(request, TEMPLATES.notFound);
        const html = injectIntoTemplate(template, { head: renderHeadTags(PAGE_META.productNotFound) });
        return htmlResponse(html, 404, CACHE_CONTROL.notFound);
    }

    const { product } = lookup;
    // Slug anterior (el producto fue renombrado): redirección permanente a la URL vigente
    if (product.slug !== slug) {
        return new Response(null, {
            status: 301,
            headers: { Location: `/productos/${encodeURIComponent(product.slug)}`, 'Cache-Control': CACHE_CONTROL.redirect },
        });
    }

    const materialLabel = getMaterialLabel(product.material);
    const seo = buildProductSeo(product, materialLabel);
    const template = await loadTemplate(request, TEMPLATES.product);
    const html = injectIntoTemplate(template, {
        head: renderHeadTags(seo.meta, { id: PRODUCT_JSONLD_ID, data: seo.jsonLd }),
        bodyEnd: renderProductNoscript(product, seo.title, materialLabel),
    });
    return htmlResponse(html, 200, CACHE_CONTROL.page);
};

export default async function handler(request: Request): Promise<Response> {
    if (request.headers.has(INTERNAL_REQUEST_HEADER)) return new Response('Not found', { status: 404 });

    const slug = new URL(request.url).searchParams.get('slug');
    try {
        if (!slug) {
            return htmlResponse(await loadTemplate(request, TEMPLATES.notFound), 404, CACHE_CONTROL.notFound);
        }
        return await renderProductPage(request, slug);
    } catch (error) {
        // Respaldo: sin metadatos del producto, la app resuelve la página en el navegador
        console.error('[render] Sirviendo la plantilla sin datos:', error);
        const template = await loadTemplate(request, slug ? TEMPLATES.product : TEMPLATES.notFound);
        return htmlResponse(template, slug ? 200 : 404, CACHE_CONTROL.fallback);
    }
}
