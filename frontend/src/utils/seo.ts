import type { Product } from '../types';
import { getProductPrices } from './pricing';

export const SITE_URL = 'https://www.jasihomedeco.com';
export const SITE_NAME = 'Jasihome Deco';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const META_DESCRIPTION_MAX_LENGTH = 155;

const normalizeText = (text: string): string =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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

export const buildProductDescription = (product: Product, title: string): string =>
    truncateText(
        product.description?.trim() ||
            `${title}. Fabricado por ${SITE_NAME} en Buenos Aires, con envíos a CABA y GBA.`,
    );

/** JSON-LD de producto + migas de pan, para resultados enriquecidos en Google. */
export const buildProductJsonLd = (product: Product, description: string, materialLabel?: string) => {
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
