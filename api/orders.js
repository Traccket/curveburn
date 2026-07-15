/**
 * Función serverless de Vercel: crea pedidos contra-entrega en Sendura.
 *
 * El token de Sendura vive SOLO aquí (variable de entorno del servidor,
 * sin prefijo VITE_) — nunca se expone al navegador. El cliente envía la
 * clave de variante y la ciudad; el precio, nombre y SKU se resuelven en
 * este catálogo autoritativo para impedir manipulación desde el frontend.
 *
 * Variables de entorno requeridas (Vercel → Settings → Environment Variables):
 *   SENDURA_API_TOKEN  → token de la tienda (panel Sendura → Tiendas/Shops)
 *   SENDURA_SKU        → SKU del producto en el inventario de Sendura
 *   SENDURA_SKU_PLAN   → (opcional) SKU para el plan 2 meses; default: SENDURA_SKU
 *   SENDURA_API_URL    → (opcional) default https://sendura.edgasanc.com
 */

const CATALOG = {
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

// Cobertura de entrega local con pago contra entrega. La provincia se
// resuelve aquí (no viene del cliente) porque Sendura valida cobertura
// por provincia.
const CITIES = {
  bogota: { city: 'Bogotá', province: 'Bogotá, D.C.' },
  soacha: { city: 'Soacha', province: 'Cundinamarca' },
  medellin: { city: 'Medellín', province: 'Antioquia' },
  envigado: { city: 'Envigado', province: 'Antioquia' },
  bello: { city: 'Bello', province: 'Antioquia' },
  'la-estrella': { city: 'La Estrella', province: 'Antioquia' },
  itagui: { city: 'Itagüí', province: 'Antioquia' },
};

const QUIZ_DISCOUNT_RATE = 0.05;

function fail(res, status, message, fallbackToShopify = false) {
  return res.status(status).json({ status: 'error', message, fallbackToShopify });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Método no permitido');
  }

  const token = process.env.SENDURA_API_TOKEN;
  if (!token) {
    // Config incompleta: el frontend ofrece completar la compra por Shopify.
    return fail(res, 503, 'El pago contra entrega no está disponible en este momento.', true);
  }

  const body = req.body || {};
  const variant = CATALOG[body.variant];
  const cityInfo = CITIES[body.cityId];

  const name = String(body.customerName || '').trim();
  const phone = String(body.customerPhone || '').replace(/\D/g, '');
  const email = String(body.customerEmail || '').trim();
  const address = String(body.address || '').trim();
  const addressDetail = String(body.addressDetail || '').trim();
  const notes = String(body.notes || '').trim();
  const quantity = Math.floor(Number(body.quantity) || 0);

  if (!variant) return fail(res, 422, 'Producto inválido.');
  if (!cityInfo) return fail(res, 422, 'Ciudad fuera de cobertura para entrega local.');
  if (name.length < 3) return fail(res, 422, 'Escribe tu nombre completo.');
  if (!/^3\d{9}$/.test(phone)) return fail(res, 422, 'El celular debe tener 10 dígitos y empezar por 3.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 422, 'El correo no es válido.');
  if (address.length < 5) return fail(res, 422, 'Escribe la dirección completa de entrega.');
  if (quantity < 1 || quantity > 5) return fail(res, 422, 'Cantidad inválida (máximo 5 unidades).');

  const sku = variant.sku();
  if (!sku) {
    return fail(res, 503, 'El pago contra entrega no está disponible en este momento.', true);
  }

  const unitPrice = body.quizDiscount
    ? Math.round(variant.price * (1 - QUIZ_DISCOUNT_RATE))
    : variant.price;

  const payload = {
    customer_name: name,
    customer_phone: phone,
    ...(email ? { customer_email: email } : {}),
    shipping_address_1: address,
    ...(addressDetail ? { shipping_address_2: addressDetail } : {}),
    shipping_city: cityInfo.city,
    shipping_province: cityInfo.province,
    shipping_country: 'Colombia',
    ...(notes ? { notes } : {}),
    total_price: unitPrice * quantity,
    financial_status: 'pending',
    items: [
      {
        sku,
        name: variant.name,
        quantity,
        price: unitPrice,
      },
    ],
  };

  const apiUrl = (process.env.SENDURA_API_URL || 'https://sendura.edgasanc.com').replace(/\/$/, '');

  let senduraRes;
  let senduraData;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    senduraRes = await fetch(`${apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    senduraData = await senduraRes.json().catch(() => ({}));
  } catch (err) {
    console.error('[sendura] error de red:', err?.message);
    return fail(res, 502, 'No pudimos conectar con la transportadora. Intenta de nuevo.', true);
  }

  if (senduraRes.status === 201) {
    return res.status(201).json({
      status: 'success',
      orderNumber: senduraData.order_number,
      guia: senduraData.guia_number,
      total: unitPrice * quantity,
    });
  }

  // 401 = token mal configurado; 422 = validación de negocio de Sendura.
  // En ambos casos ofrecemos Shopify como plan B para no perder la venta.
  console.error('[sendura] respuesta no exitosa:', senduraRes.status, senduraData?.message);
  if (senduraRes.status === 422) {
    return fail(res, 422, senduraData?.message || 'Sendura rechazó el pedido.', true);
  }
  return fail(res, 502, 'El pago contra entrega no está disponible en este momento.', true);
}
