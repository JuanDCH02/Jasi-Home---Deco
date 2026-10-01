import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../utils/seo';

export interface PageMeta {
    /** Título de la página, sin el nombre del sitio (se agrega solo). */
    title: string;
    description: string;
    /** Ruta canónica, p. ej. "/productos". */
    path: string;
    image?: string;
    noIndex?: boolean;
}

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string): void => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.content = content;
};

const upsertCanonical = (href: string): void => {
    let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!element) {
        element = document.createElement('link');
        element.rel = 'canonical';
        document.head.appendChild(element);
    }
    element.href = href;
};

/**
 * Actualiza title, description, canonical, robots y Open Graph de la página.
 * Con `null` no toca nada (p. ej. mientras carga el producto).
 */
export function usePageMeta(meta: PageMeta | null): void {
    const title = meta?.title;
    const description = meta?.description;
    const path = meta?.path;
    const image = meta?.image ?? DEFAULT_OG_IMAGE;
    const noIndex = meta?.noIndex ?? false;

    useEffect(() => {
        if (title === undefined || description === undefined || path === undefined) return;

        const fullTitle = `${title} | ${SITE_NAME}`;
        const url = `${SITE_URL}${path}`;

        document.title = fullTitle;
        upsertMeta('name', 'description', description);
        upsertMeta('name', 'robots', noIndex ? 'noindex, follow' : 'index, follow');
        upsertCanonical(url);
        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:url', url);
        upsertMeta('property', 'og:image', image);
    }, [title, description, path, image, noIndex]);
}
