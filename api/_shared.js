/**
 * Código compartido entre las funciones serverless del checkout.
 * (Los archivos que empiezan con "_" no se exponen como endpoints en Vercel.)
 *
 * Catálogo y cobertura AUTORITATIVOS: el cliente solo envía claves; precio,
 * SKU y provincia se resuelven aquí para impedir manipulación desde el front.
 */

export const CATALOG = {
  ONE_TIME: {
    name: 'CURVE Quemador de Grasa Premium (60 cápsulas)',
    price: 110000,
    sku: () => process.env.SENDURA_SKU,
  },
  PLAN_2_MONTHS: {
    name: 'CURVE — Plan 2 meses (2x60 cápsulas)',
    price: 89000,
    sku: () => process.env.SENDURA_SKU_PLAN || process.env.SENDURA_SKU,
  },
};

export const CITIES = {
  bogota: { city: 'Bogotá', province: 'Bogotá, D.C.' },
  soacha: { city: 'Soacha', province: 'Cundinamarca' },
  medellin: { city: 'Medellín', province: 'Antioquia' },
  envigado: { city: 'Envigado', province: 'Antioquia' },
  bello: { city: 'Bello', province: 'Antioquia' },
  'la-estrella': { city: 'La Estrella', province: 'Antioquia' },
  itagui: { city: 'Itagüí', province: 'Antioquia' },
};

export const QUIZ_DISCOUNT_RATE = 0.05;
export const MAX_QTY = 5;

/**
 * Plan de suscripción mensual (cobro recurrente vía Sendura + Wompi).
 * El precio es AUTORITATIVO aquí (env SENDURA_SUB_PRICE): el frontend lo
 * lee de /api/wompi-config, así lo que se muestra y lo que se cobra
 * siempre coinciden.
 */
export const SUBSCRIPTION_PLAN = {
  planCode: 'CURVE-MENSUAL',
  productName: CATALOG.ONE_TIME.name,
  intervalDays: 30,
  unitPrice: () => parseInt(process.env.SENDURA_SUB_PRICE || '99000', 10),
  sku: () => process.env.SENDURA_SUB_SKU || process.env.SENDURA_SKU,
};

export function unitPriceFor(variant, quizDiscount) {
  return quizDiscount ? Math.round(variant.price * (1 - QUIZ_DISCOUNT_RATE)) : variant.price;
}

/**
 * Valida el payload común de un pedido local. Devuelve { error } o
 * { variant, cityInfo, quantity, unitPrice, total, customer }.
 */
export function validateOrderPayload(body = {}) {
  const variant = CATALOG[body.variant];
  const cityInfo = CITIES[body.cityId];

  const name = String(body.customerName || '').trim();
  const phone = String(body.customerPhone || '').replace(/\D/g, '');
  const email = String(body.customerEmail || '').trim();
  const address = String(body.address || '').trim();
  const addressDetail = String(body.addressDetail || '').trim();
  const notes = String(body.notes || '').trim();
  const quantity = Math.floor(Number(body.quantity) || 0);

  if (!variant) return { error: 'Producto inválido.' };
  if (!cityInfo) return { error: 'Ciudad fuera de cobertura para entrega local.' };
  if (name.length < 3) return { error: 'Escribe tu nombre completo.' };
  if (!/^3\d{9}$/.test(phone)) return { error: 'El celular debe tener 10 dígitos y empezar por 3.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'El correo no es válido.' };
  if (address.length < 5) return { error: 'Escribe la dirección completa de entrega.' };
  if (quantity < 1 || quantity > MAX_QTY) return { error: `Cantidad inválida (máximo ${MAX_QTY} unidades).` };

  const unitPrice = unitPriceFor(variant, !!body.quizDiscount);
  return {
    variant,
    cityInfo,
    quantity,
    unitPrice,
    total: unitPrice * quantity,
    customer: { name, phone, email, address, addressDetail, notes },
  };
}

/**
 * Crea el pedido en Sendura. Devuelve { ok, status, data }.
 * financialStatus: 'pending' (contra entrega) | 'paid' (pagado online).
 */
export async function createSenduraOrder({ variant, cityInfo, quantity, unitPrice, customer, financialStatus, extraNotes }) {
  const token = process.env.SENDURA_API_TOKEN;
  const sku = variant.sku();
  if (!token || !sku) {
    return { ok: false, status: 503, data: { message: 'Configuración de Sendura incompleta.' } };
  }

  const notes = [customer.notes, extraNotes].filter(Boolean).join(' · ');

  const payload = {
    customer_name: customer.name,
    customer_phone: customer.phone,
    ...(customer.email ? { customer_email: customer.email } : {}),
    shipping_address_1: customer.address,
    ...(customer.addressDetail ? { shipping_address_2: customer.addressDetail } : {}),
    shipping_city: cityInfo.city,
    shipping_province: cityInfo.province,
    shipping_country: 'Colombia',
    ...(notes ? { notes } : {}),
    total_price: unitPrice * quantity,
    financial_status: financialStatus,
    items: [{ sku, name: variant.name, quantity, price: unitPrice }],
  };

  const apiUrl = (process.env.SENDURA_API_URL || 'https://sendura.edgasanc.com').replace(/\/$/, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));
    return { ok: res.status === 201, status: res.status, data };
  } catch (err) {
    console.error('[sendura] error de red:', err?.message);
    return { ok: false, status: 502, data: { message: 'No pudimos conectar con la transportadora.' } };
  }
}
