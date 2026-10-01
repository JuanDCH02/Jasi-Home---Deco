import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';

/** Árbol de la app sin el router: lo comparten el navegador (main.tsx) y el pre-render (entry-server.tsx). */
export default function Root() {
    return (
        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>
    );
}
