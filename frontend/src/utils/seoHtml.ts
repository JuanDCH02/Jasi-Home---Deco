// Generación de HTML para el pre-render (build) y la función edge de productos.
// Sin dependencias de React ni del DOM: corre en Node y en el runtime edge.
import { optimizeImageUrl } from './cloudinary';
import { formatPrice, getProductPrices } from './pricing';
import { resolvePageMeta, type PageMeta, type SeoProduct } from './seo';

/** Marcadores de index.html que delimitan los metadatos propios de cada página. */
const HEAD_START = '<!--seo-head-->';
const HEAD_END = '<!--/seo-head-->';
/** Marcador dentro de <div id="root"> donde va el HTML pre-renderizado. */
const ROOT_MARKER = '<!--app-->';

const HTML_ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);

// Escapa "<" para que ningún texto (p. ej. una descripción) pueda cerrar el <script>
const serializeJsonLd = (data: object): string => JSON.stringify(data).replace(/</g, '\\u003c');

export interface JsonLdBlock {
    id: string;
    data: object;
}

/** Etiquetas del <head> de una página; mismo resultado que aplica usePageMeta en el navegador. */
export const renderHeadTags = (meta: PageMeta, jsonLd?: JsonLdBlock): string => {
    const { title, description, url, image, imageSize, robots } = resolvePageMeta(meta);
    return [
        `<title>${escapeHtml(title)}</title>`,
        `<meta name="description" content="${escapeHtml(description)}" />`,
        `<meta name="robots" content="${robots}" />`,
        url && `<link rel="canonical" href="${escapeHtml(url)}" />`,
        `<meta property="og:title" content="${escapeHtml(title)}" />`,
        `<meta property="og:description" content="${escapeHtml(description)}" />`,
        url && `<meta property="og:url" content="${escapeHtml(url)}" />`,
        `<meta property="og:image" content="${escapeHtml(image)}" />`,
        imageSize && `<meta property="og:image:width" content="${imageSize.width}" />`,
        imageSize && `<meta property="og:image:height" content="${imageSize.height}" />`,
        jsonLd && `<script type="application/ld+json" id="${jsonLd.id}">${serializeJsonLd(jsonLd.data)}</script>`,
    ]
        .filter(Boolean)
        .join('\n    ');
};

interface TemplateParts {
    /** Reemplaza los metadatos entre los marcadores seo-head. */
    head?: string;
    /** HTML pre-renderizado de la app, dentro de <div id="root">. */
    root?: string;
    /** HTML extra al final del <body> (p. ej. <noscript>). */
    bodyEnd?: string;
}

export const injectIntoTemplate = (template: string, { head, root, bodyEnd }: TemplateParts): string => {
    let html = template;

    if (head !== undefined) {
        const start = html.indexOf(HEAD_START);
        const end = html.indexOf(HEAD_END);
        if (start === -1 || end === -1) throw new Error('La plantilla no tiene los marcadores <!--seo-head-->');
        html = `${html.slice(0, start + HEAD_START.length)}\n    ${head}\n    ${html.slice(end)}`;
    }
    if (root !== undefined) {
        if (!html.includes(ROOT_MARKER)) throw new Error('La plantilla no tiene el marcador <!--app-->');
        html = html.replace(ROOT_MARKER, () => root);
    }
    if (bodyEnd !== undefined) {
        html = html.replace('</body>', () => `${bodyEnd}\n  </body>`);
    }
    return html;
};

/**
 * Contenido del producto para quien no ejecuta JavaScript (bots de redes, IA,
 * buscadores sin render). Con JS activo el navegador no lo muestra.
 */
export const renderProductNoscript = (product: SeoProduct, title: string, materialLabel?: string): string => {
    const image = product.images[0]?.url;
    const price = formatPrice(getProductPrices(product).discountedPrice);
    const details = [
        `Precio: $${price} en efectivo o transferencia`,
        materialLabel && `Material: ${materialLabel}`,
        product.stock > 0 ? 'En stock' : 'Sin stock',
    ].filter(Boolean);
    const description = product.description?.trim();

    return [
        '<noscript>',
        '  <article>',
        `    <nav><a href="/">Inicio</a> › <a href="/productos">Productos</a> › ${escapeHtml(product.name)}</nav>`,
        `    <h1>${escapeHtml(title)}</h1>`,
        image &&
            `    <img src="${escapeHtml(optimizeImageUrl(image, 800))}" alt="${escapeHtml(title)}" width="800" height="800" />`,
        description && `    <p>${escapeHtml(description).replace(/\n+/g, '<br />')}</p>`,
        `    <p>${details.map((detail) => escapeHtml(String(detail))).join(' · ')}</p>`,
        '    <p><a href="/productos">Ver más muebles</a> · <a href="/contacto">Consultar o pedir presupuesto</a></p>',
        '  </article>',
        '</noscript>',
    ]
        .filter(Boolean)
        .join('\n');
};
