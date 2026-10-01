import { useEffect } from 'react';
import { resolvePageMeta, type PageMeta } from '../utils/seo';

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string | undefined): void => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (content === undefined) {
        element?.remove();
        return;
    }
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.content = content;
};

const upsertCanonical = (href: string | undefined): void => {
    let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (href === undefined) {
        element?.remove();
        return;
    }
    if (!element) {
        element = document.createElement('link');
        element.rel = 'canonical';
        document.head.appendChild(element);
    }
    element.href = href;
};

/**
 * Actualiza title, description, canonical, robots y Open Graph de la página
 * (lo mismo que el pre-render escribe en el HTML). Con `null` no toca nada,
 * p. ej. mientras carga el producto.
 */
export function usePageMeta(meta: PageMeta | null): void {
    const title = meta?.title;
    const description = meta?.description;
    const path = meta?.path;
    const image = meta?.image;
    const noIndex = meta?.noIndex;

    useEffect(() => {
        if (title === undefined || description === undefined) return;

        const resolved = resolvePageMeta({ title, description, path, image, noIndex });
        document.title = resolved.title;
        upsertMeta('name', 'description', resolved.description);
        upsertMeta('name', 'robots', resolved.robots);
        upsertCanonical(resolved.url);
        upsertMeta('property', 'og:title', resolved.title);
        upsertMeta('property', 'og:description', resolved.description);
        upsertMeta('property', 'og:url', resolved.url);
        upsertMeta('property', 'og:image', resolved.image);
        upsertMeta('property', 'og:image:width', resolved.imageSize?.width.toString());
        upsertMeta('property', 'og:image:height', resolved.imageSize?.height.toString());
    }, [title, description, path, image, noIndex]);
}
