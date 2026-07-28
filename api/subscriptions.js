/**
 * Crea una suscripción mensual: proxy hacia POST /api/v1/subscriptions de
 * Sendura, que tokeniza la fuente de pago en Wompi, ejecuta el primer cobro
 * y crea el pedido logístico con guía.
 *
 * El token de Sendura y el precio del plan viven SOLO en el servidor.
 * El navegador ya tokenizó la tarjeta directamente con Wompi (llave pública),
 * así que aquí solo llegan tokens — nunca números de tarjeta (PCI-DSS).
 */
import { CITIES, MAX_QTY, SUBSCRIPTION_PLAN } from './_shared.js';

// El primer cobro puede tardar (validación del emisor / 3DS): damos margen.
export const maxDuration = 60;

function fail(res, status, message) {
  return res.status(status).json({ status: 'error', message });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Método no permitido');
  }

  const token = process.env.SENDURA_API_TOKEN;
  const sku = SUBSCRIPTION_PLAN.sku();
  if (!token || !sku) {
    return fail(res, 503, 'Las suscripciones no están disponibles en este momento.');
  }

  const body = req.body || {};
  const cityInfo = CITIES[body.cityId];
  const name = String(body.customerName || '').trim();
  const phone = String(body.customerPhone || '').replace(/\D/g, '');
  const email = String(body.customerEmail || '').trim();
  const address = String(body.address || '').trim();
  const addressDetail = String(body.addressDetail || '').trim();
  const quantity = Math.floor(Number(body.quantity) || 0);
  const cardToken = String(body.wompi?.card_token || '');
  const acceptanceToken = String(body.wompi?.acceptance_token || '');

  if (!cityInfo) return fail(res, 422, 'Ciudad fuera de cobertura para entrega local.');
  if (name.length < 3) return fail(res, 422, 'Escribe tu nombre completo.');
  if (!/^3\d{9}$/.test(phone)) return fail(res, 422, 'El celular debe tener 10 dígitos y empezar por 3.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 422, 'El correo es obligatorio para la suscripción.');
  if (address.length < 5) return fail(res, 422, 'Escribe la dirección completa de entrega.');
  if (quantity < 1 || quantity > MAX_QTY) return fail(res, 422, `Cantidad inválida (máximo ${MAX_QTY}).`);
  if (!/^tok_/.test(cardToken)) return fail(res, 422, 'No recibimos la tarjeta tokenizada. Intenta de nuevo.');
  if (acceptanceToken.length < 10) return fail(res, 422, 'Falta la aceptación de términos del pago.');

  const unitPrice = SUBSCRIPTION_PLAN.unitPrice();
  const payload = {
    plan_code: SUBSCRIPTION_PLAN.planCode,
    sku,
    product_name: SUBSCRIPTION_PLAN.productName,
    quantity,
    unit_price: unitPrice,
    interval_days: SUBSCRIPTION_PLAN.intervalDays,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    shipping_address_1: address,
    ...(addressDetail ? { shipping_address_2: addressDetail } : {}),
    shipping_city: cityInfo.city,
    shipping_province: cityInfo.province,
    shipping_country: 'Colombia',
    wompi: { card_token: cardToken, acceptance_token: acceptanceToken, type: 'CARD' },
  };

  const apiUrl = (process.env.SENDURA_API_URL || 'https://sendura.edgasanc.com').replace(/\/$/, '');

  let senduraRes;
  let data;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    senduraRes = await fetch(`${apiUrl}/api/v1/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    data = await senduraRes.json().catch(() => ({}));
  } catch (err) {
    console.error('[subscriptions] error de red con Sendura:', err?.message);
    return fail(res, 502, 'No pudimos procesar la suscripción. Intenta de nuevo en un momento.');
  }

  if (senduraRes.status === 201) {
    return res.status(201).json({
      status: 'success',
      subscription: true,
      subscriptionId: data.subscription_id,
      orderNumber: data.first_order_number,
      guia: data.first_guia_number,
      nextChargeAt: data.next_charge_at,
      cancelUrl: data.cancel_url,
      total: unitPrice * quantity,
      paid: true,
    });
  }

  if (senduraRes.status === 202) {
    // Pago PENDING: Sendura creará el pedido cuando Wompi confirme (webhook).
    return res.status(202).json({
      status: 'pending',
      subscription: true,
      subscriptionId: data.subscription_id,
      total: unitPrice * quantity,
      message: data.message,
    });
  }

  console.error('[subscriptions] Sendura respondió:', senduraRes.status, data?.message);
  if (senduraRes.status === 422) {
    return fail(res, 422, data?.message || 'El pago no fue aprobado. Verifica los datos de tu tarjeta.');
  }
  // Sendura a veces propaga errores de validación de Wompi como 500
  if (/VALIDATION|DECLINED|REJECTED/i.test(data?.message || '')) {
    return fail(res, 422, 'El pago no fue aprobado. Verifica los datos de tu tarjeta e intenta de nuevo.');
  }
  return fail(res, 502, 'No pudimos procesar la suscripción. Intenta de nuevo en un momento.');
}
