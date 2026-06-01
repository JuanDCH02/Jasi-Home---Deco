const BASE_URL = (import.meta as { env: Record<string, string> }).env?.VITE_API_URL ?? 'http://localhost:3000';

// ─── Helpers ────────────────────────────────────────────────────────────────

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ─── Public ─────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  material?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.material) query.set('material', params.material);

  const res = await fetch(`${BASE_URL}/api/products?${query}`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function getProduct(slug: string) {
  const res = await fetch(`${BASE_URL}/api/products/${slug}`);
  if (!res.ok) throw new Error('Error al cargar el producto');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function sendContact(data: {
  name: string;
  email: string;
  message: string;
  phone?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al enviar el mensaje');
  return res.json();
}

// Registra la consulta de compra (carrito → orden). Best-effort: nunca lanza,
// para no interferir con la redirección a WhatsApp. `keepalive` permite que el
// pedido termine aunque la página navegue a otra pestaña.
export async function recordOrder(items: { productId: number; quantity: number }[]) {
  try {
    await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      keepalive: true,
    });
  } catch {
    /* silencioso a propósito */
  }
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json();
}

// ─── Admin Products ──────────────────────────────────────────────────────────

export async function adminGetAllProducts(token: string, search?: string) {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  const res = await fetch(`${BASE_URL}/api/products/admin/all?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`[${res.status}] ${body?.error ?? 'Error al cargar productos'}`);
  }
  return res.json();
}

export async function adminCreateProduct(token: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.fieldErrors ? JSON.stringify(err.error.fieldErrors) : 'Error al crear producto');
  }
  return res.json();
}

export async function adminUpdateProduct(token: string, id: number, data: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
  return res.json();
}

export async function adminToggleProduct(token: string, id: number, active: boolean) {
  return adminUpdateProduct(token, id, { active });
}

export async function adminDeleteProduct(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar producto');
  return res.json();
}

export async function adminUploadImage(token: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Error al subir imagen');
  const data = await res.json();
  return data.url as string;
}

// ─── Admin Categories ────────────────────────────────────────────────────────

export async function adminCreateCategory(token: string, name: string) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Error al crear categoría');
  return res.json();
}

export async function adminDeleteCategory(token: string, id: number) {
  const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar categoría');
  return res.json();
}

// ─── Admin Órdenes / Consultas ─────────────────────────────────────────────────

export async function adminGetDashboardStats(token: string) {
  const res = await fetch(`${BASE_URL}/api/orders/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar estadísticas');
  return res.json();
}

export async function adminGetOrders(token: string, params?: { status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  const res = await fetch(`${BASE_URL}/api/orders?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar consultas');
  return res.json();
}

export async function adminUpdateOrderStatus(token: string, id: number, status: string) {
  const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}
