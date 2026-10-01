import type { Category, Product, ProductImage } from '../types';
import { getProductPrices } from './pricing';

export const SITE_URL = 'https://www.jasihomedeco.com';
export const SITE_NAME = 'Jasihome Deco';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const META_DESCRIPTION_MAX_LENGTH = 155;

// ─── Metadatos de página ─────────────────────────────────────────────────────

export interface PageMeta {
    /** Título de la página, sin el nombre del sitio (se agrega solo). */
    title: string;
    description: string;
    /** Ruta canónica, p. ej. "/productos". Sin ruta (o con noIndex) no hay canonical. */
    path?: string;
    image?: string;
    noIndex?: boolean;
}

export interface ResolvedPageMeta {
    title: string;
    description: string;
    url?: string;
    image: string;
    /** Solo se conoce el tamaño de la imagen por defecto (public/og-image.jpg). */
    imageSize?: { width: number; height: number };
    robots: string;
}

/** Fuente única de los metadatos de las páginas fijas (navegador, pre-render y función edge). */
export const PAGE_META = {
    home: {
        title: 'Muebles a medida en Buenos Aires',
        description:
            'Fabricamos muebles de álamo y pino: mesas de luz, cómodas, racks de TV y mesas ratonas. 25% OFF en efectivo y envíos a CABA y GBA.',
        path: '/',
    },
    products: {
        title: 'Catálogo de muebles de madera',
        description:
            'Mesas de luz, cómodas, mesas ratonas, racks de TV y respaldos en álamo y pino, fabricados en Buenos Aires. Hacemos medidas especiales.',
        path: '/productos',
    },
    about: {
        title: 'Nuestro taller de muebles en Buenos Aires',
        description:
            'Emprendimiento familiar que diseña y fabrica muebles de álamo y pino a medida. Conocé nuestra historia y forma de trabajo.',
        path: '/sobre-nosotros',
    },
    contact: {
        title: 'Contacto y presupuestos a medida',
        description:
            'Pedí presupuesto para tu mueble a medida por WhatsApp o formulario. Lunes a sábado de 9 a 19 h. Envíos a CABA y GBA.',
        path: '/contacto',
    },
    faq: {
        title: 'Envíos, pagos y plazos de entrega',
        description:
            'Formas de pago (25% OFF en efectivo, 3 cuotas sin interés), zonas y costos de envío, y plazos de entrega de nuestros muebles.',
        path: '/preguntas-frecuentes',
    },
    cart: {
        title: 'Tu carrito',
        description: 'Revisá los muebles de tu carrito y hacé tu pedido por WhatsApp.',
        path: '/carrito',
        noIndex: true,
    },
    notFound: {
        title: 'Página no encontrada',
        description: 'La página que buscás no existe o fue movida.',
        noIndex: true,
    },
    productNotFound: {
        title: 'Producto no encontrado',
        description: 'El producto que buscás no existe o fue retirado.',
        noIndex: true,
    },
} satisfies Record<string, PageMeta>;

export const resolvePageMeta = ({
    title,
    description,
    path,
    image = DEFAULT_OG_IMAGE,
    noIndex = false,
}: PageMeta): ResolvedPageMeta => ({
    title: `${title} | ${SITE_NAME}`,
    description,
    url: path !== undefined && !noIndex ? `${SITE_URL}${path}` : undefined,
    image,
    imageSize: image === DEFAULT_OG_IMAGE ? { width: 1200, height: 630 } : undefined,
    robots: noIndex ? 'noindex, follow' : 'index, follow',
});

// ─── Productos ───────────────────────────────────────────────────────────────

/** Lo mínimo de un producto que necesitan los metadatos (lo cumple Product y la respuesta validada de la API). */
export type SeoProduct = Pick<
    Product,
    'id' | 'name' | 'slug' | 'description' | 'price' | 'discount' | 'stock' | 'material' | 'active'
> & {
    category?: Pick<Category, 'name'> | null;
    images: Pick<ProductImage, 'url'>[];
};

const normalizeText = (text: string): string =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Recorta un texto al largo de una meta description sin cortar palabras. */
export const truncateText = (text: string, maxLength = META_DESCRIPTION_MAX_LENGTH): string => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLength) return clean;
    const cut = clean.slice(0, maxLength - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:!¡-]+$/, '')}…`;
};

export const buildProductUrl = (slug: string): string => `${SITE_URL}/productos/${slug}`;

/** "Cómoda Aura" + "Álamo" → "Cómoda Aura de álamo" (no repite el material si ya está en el nombre). */
export const buildProductTitle = (name: string, materialLabel?: string): string => {
    const cleanName = name.replace(/\s+/g, ' ').trim();
    if (!materialLabel || normalizeText(cleanName).includes(normalizeText(materialLabel))) return cleanName;
    return `${cleanName} de ${materialLabel.toLowerCase()}`;
};

export const buildProductDescription = (product: SeoProduct, title: string): string =>
    truncateText(
        product.description?.trim() ||
            `${title}. Fabricado por ${SITE_NAME} en Buenos Aires, con envíos a CABA y GBA.`,
    );

export const PRODUCT_JSONLD_ID = 'product-jsonld';

export interface ProductSeo {
    /** Nombre descriptivo del producto, sin el nombre del sitio. */
    title: string;
    meta: PageMeta;
    jsonLd: ReturnType<typeof buildProductJsonLd>;
}

/** Metadatos y JSON-LD del detalle de producto (los usan la página y la función edge). */
export const buildProductSeo = (product: SeoProduct, materialLabel?: string): ProductSeo => {
    const title = buildProductTitle(product.name, materialLabel);
    const description = buildProductDescription(product, title);
    return {
        title,
        meta: {
            title,
            description,
            path: `/productos/${product.slug}`,
            image: product.images[0]?.url,
            noIndex: !product.active,
        },
        jsonLd: buildProductJsonLd(product, description, materialLabel),
    };
};

/** JSON-LD de producto + migas de pan, para resultados enriquecidos en Google. */
export const buildProductJsonLd = (product: SeoProduct, description: string, materialLabel?: string) => {
    const url = buildProductUrl(product.slug);
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: product.name,
                description: product.description?.trim() || description,
                url,
                sku: String(product.id),
                image: product.images.map((image) => image.url),
                brand: { '@type': 'Brand', name: SITE_NAME },
                category: product.category?.name,
                material: materialLabel,
                offers: {
                    '@type': 'Offer',
                    url,
                    priceCurrency: 'ARS',
                    // Precio destacado en la página: efectivo / transferencia
                    price: Math.round(getProductPrices(product).discountedPrice),
                    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    seller: { '@type': 'Organization', name: SITE_NAME },
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
                    { '@type': 'ListItem', position: 2, name: 'Productos', item: `${SITE_URL}/productos` },
                    { '@type': 'ListItem', position: 3, name: product.name, item: url },
                ],
            },
        ],
    };
};
