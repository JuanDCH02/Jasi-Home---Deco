import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Root from './Root';

// createRoot (no hydrateRoot): reemplaza el HTML pre-renderizado, que solo está
// para quienes no ejecutan JS. Así el carrito guardado no genera desajustes.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>
);
