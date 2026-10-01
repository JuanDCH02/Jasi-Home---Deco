// Entry del pre-render: lo compila vite-plugin-prerender en el build y escribe
// un HTML estático por página fija. No se incluye en el bundle del navegador.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Root from './Root';
import { PAGE_META, type PageMeta } from './utils/seo';
import { injectIntoTemplate, renderHeadTags } from './utils/seoHtml';

interface PrerenderPage {
    /** Ruta que se renderiza. */
    path: string;
    /** Archivo de salida, relativo a dist/ (vercel.json reescribe la URL pública a este archivo). */
    file: string;
    /** null = conserva los metadatos por defecto de index.html. */
    meta: PageMeta | null;
}

const PRERENDER_PAGES: PrerenderPage[] = [
    { path: '/', file: 'index.html', meta: PAGE_META.home },
    { path: '/productos', file: '_pages/productos.html', meta: PAGE_META.products },
    { path: '/sobre-nosotros', file: '_pages/sobre-nosotros.html', meta: PAGE_META.about },
    { path: '/contacto', file: '_pages/contacto.html', meta: PAGE_META.contact },
    { path: '/preguntas-frecuentes', file: '_pages/preguntas-frecuentes.html', meta: PAGE_META.faq },
    // Esqueleto del detalle: la función api/render le agrega los datos de cada producto
    { path: '/productos/_plantilla', file: '_pages/producto.html', meta: null },
    { path: '/_404', file: '404.html', meta: PAGE_META.notFound },
];

const render = (path: string): string =>
    renderToString(
        <StaticRouter location={path}>
            <Root />
        </StaticRouter>,
    );

export interface PrerenderedFile {
    file: string;
    html: string;
}

/** Recibe el index.html del build del navegador y devuelve los HTML a escribir. */
export function prerenderPages(template: string): PrerenderedFile[] {
    return PRERENDER_PAGES.map(({ path, file, meta }) => ({
        file,
        html: injectIntoTemplate(template, {
            head: meta ? renderHeadTags(meta) : undefined,
            root: render(path),
        }),
    }));
}
