export interface ProductImage {
  id: number;
  url: string;
  order: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount: number;
  stock: number;
  material?: 'ALAMO' | 'PINO';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category: Category;
  images: ProductImage[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Órdenes / Consultas ──────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  productId: number;
  product?: Product;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  kpis: {
    totalConsultas: number;
    consultasMes: number;
    consultasMesPrev: number;
    ingresosConfirmados: number;
    ingresosEstimados: number;
    ticketPromedio: number;
  };
  porEstado: Record<OrderStatus, number>;
  consultasPorDia: { date: string; count: number; total: number }[];
  topProductos: { id: number; name: string; image: string | null; cantidad: number; ingresos: number }[];
  ingresosPorCategoria: { id: number; name: string; ingresos: number; cantidad: number }[];
  productosActivos: number;
  productosInactivos: number;
  stockBajo: number;
  totalCategorias: number;
  stockBajoLista: { id: number; name: string; stock: number; image: string | null }[];
}
