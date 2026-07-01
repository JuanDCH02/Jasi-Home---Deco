import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resetea el scroll al tope cada vez que cambia la ruta. React Router conserva
 * la posición previa al navegar, lo que hace que las páginas nuevas aparezcan
 * desplazadas hacia el medio.
 */
export default function ScrollToTop(): null {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
}
