import type { Product } from '../types';

type Material = NonNullable<Product['material']>;

export const MATERIAL_LABELS: Record<Material, string> = {
    PINO: 'Pino',
    ALAMO: 'Álamo',
};

export const getMaterialLabel = (material?: string | null): string | undefined =>
    material ? (MATERIAL_LABELS[material as Material] ?? material) : undefined;
