import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build, type Plugin, type ResolvedConfig } from 'vite';

interface PrerenderModule {
    prerenderPages: (template: string) => { file: string; html: string }[];
}

const SSR_ENTRY = 'src/entry-server.tsx';
const SSR_OUT_DIR = 'dist-ssr';

/**
 * Después del build del navegador compila src/entry-server.tsx para Node y
 * escribe un HTML pre-renderizado por página fija (ver PRERENDER_PAGES).
 * Además guarda dist/spa.html: la plantilla sin contenido, para las rutas que
 * solo se resuelven en el navegador (carrito, admin) y como respaldo.
 */
export function prerender(): Plugin {
    let config: ResolvedConfig;

    return {
        name: 'jasihome:prerender',
        apply: 'build',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        async closeBundle() {
            // El build SSR anidado vuelve a cargar vite.config.ts con este plugin
            if (config.build.ssr) return;

            const outDir = resolve(config.root, config.build.outDir);
            const ssrOutDir = resolve(config.root, SSR_OUT_DIR);
            try {
                const result = await build({
                    root: config.root,
                    logLevel: 'warn',
                    build: { ssr: SSR_ENTRY, outDir: ssrOutDir, emptyOutDir: true },
                });
                const outputs = Array.isArray(result) ? result : 'output' in result ? [result] : [];
                const entry = outputs
                    .flatMap((output) => output.output)
                    .find((chunk) => chunk.type === 'chunk' && chunk.isEntry);
                if (!entry) throw new Error(`El build SSR de ${SSR_ENTRY} no generó un entry`);

                const { prerenderPages } = (await import(
                    pathToFileURL(resolve(ssrOutDir, entry.fileName)).href
                )) as PrerenderModule;

                const template = await readFile(resolve(outDir, 'index.html'), 'utf-8');
                await writeFile(resolve(outDir, 'spa.html'), template);

                const pages = prerenderPages(template);
                for (const { file, html } of pages) {
                    const target = resolve(outDir, file);
                    await mkdir(dirname(target), { recursive: true });
                    await writeFile(target, html);
                }
                config.logger.info(`✓ pre-render: ${pages.map((page) => page.file).join(', ')}`);
            } finally {
                await rm(ssrOutDir, { recursive: true, force: true });
            }
        },
    };
}
