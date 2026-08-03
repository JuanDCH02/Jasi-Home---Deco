import type { Product } from '../types';

/** Recargo aplicado al pagar con tarjeta de crédito en cuotas. */
export const CARD_SURCHARGE = 1.25;

/** Formatea un número como precio en pesos argentinos (sin decimales). */
export const formatPrice = (n: number): string =>
    n.toLocaleString('es-AR', { maximumFractionDigits: 0 });

export interface ProductPrices {
    /** Precio de lista, sin descuento aplicado. */
    originalPrice: number;
    /** Precio con descuento (efectivo / transferencia). */
    discountedPrice: number;
    /** Precio final pagando con tarjeta en cuotas. */
    cardPrice: number;
}

/** Calcula los distintos precios de un producto a partir de su precio y descuento. */
export const getProductPrices = (
    product: Pick<Product, 'price' | 'discount'>,
): ProductPrices => {
    const originalPrice = Number(product.price);
    const discountedPrice =
        product.discount > 0
            ? originalPrice * (1 - product.discount / 100)
            : originalPrice;

    return {
        originalPrice,
        discountedPrice,
        cardPrice: discountedPrice * CARD_SURCHARGE / 3,
    };
};
