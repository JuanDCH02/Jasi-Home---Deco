import type { Product } from '../types';
import { formatPrice, getProductPrices } from '../utils/pricing';

interface PriceDisplayProps {
    product: Pick<Product, 'price' | 'discount'>;
}

export default function PriceDisplay({ product }: PriceDisplayProps) {
    const { originalPrice, discountedPrice, cardPrice } = getProductPrices(product);

    return (
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {/* Precio principal: efectivo / transferencia */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-brass">
                        Efectivo o transferencia
                    </span>
                    {product.discount > 0 && (
                        <span className="bg-clay/10 text-clay text-[0.7rem] font-semibold px-2 py-0.5 rounded-full">
                            −{product.discount}%
                        </span>
                    )}
                </div>
                <div className="flex items-baseline gap-3 mt-1.5">
                    <span className="font-display text-ink text-4xl leading-none">
                        ${formatPrice(discountedPrice)}
                    </span>
                    {product.discount > 0 && (
                        <span className="text-lg text-stone-400 line-through">
                            ${formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
            </div>

            {/* Precio secundario: tarjeta de crédito en cuotas */}
            <div className="px-5 py-3 border-t border-stone-200 bg-stone-50">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-stone-500">
                        Con tarjeta{' '}
                        <span className="text-stone-400">· 3 cuotas sin interés</span>
                    </span>
                    <span className="font-display text-ink text-xl leading-none">
                        ${formatPrice(cardPrice)}
                    </span>
                </div>
            </div>
        </div>
    );
}
