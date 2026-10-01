import { useEffect } from 'react';

/**
 * Inserta datos estructurados (JSON-LD) en el <head> mientras el componente
 * está montado. Con `null` no inserta nada.
 */
export function useJsonLd(id: string, data: object | null): void {
    const json = data ? JSON.stringify(data) : null;

    useEffect(() => {
        if (!json) return;

        document.getElementById(id)?.remove();
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = json;
        document.head.appendChild(script);

        return () => script.remove();
    }, [id, json]);
}
