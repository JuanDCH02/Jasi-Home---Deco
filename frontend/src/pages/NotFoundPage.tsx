import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PAGE_META } from '../utils/seo';

export default function NotFoundPage() {
    usePageMeta(PAGE_META.notFound);

    return (
        <div className="min-h-screen bg-bone pt-32 pb-20 px-6 flex items-center justify-center">
            <div className="text-center">
                <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-3">Error 404</p>
                <h1 className="text-4xl md:text-5xl font-display font-light text-ink tracking-tight mb-4">
                    Página no encontrada
                </h1>
                <p className="text-stone-500 mb-9 max-w-sm mx-auto">
                    La página que buscás no existe o fue movida.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        to="/productos"
                        className="bg-ink text-bone px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-brass hover:text-ink transition-all duration-300"
                    >
                        Ver productos
                    </Link>
                    <Link
                        to="/"
                        className="border border-ink/30 text-ink px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-ink hover:text-bone transition-all duration-300"
                    >
                        Ir al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
