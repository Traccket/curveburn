/**
 * Función serverless de Vercel: crea pedidos CONTRA ENTREGA en Sendura.
 *
 * El token de Sendura vive SOLO aquí (variable de entorno del servidor,
 * sin prefijo VITE_) — nunca se expone al navegador.
 *
 * Variables de entorno requeridas (Vercel → Settings → Environment Variables):
 *   SENDURA_API_TOKEN  → token de la tienda (panel Sendura → Tiendas/Shops)
 *   SENDURA_SKU        → SKU del producto en el inventario de Sendura
 *   SENDURA_SKU_PLAN   → (opcional) SKU para el plan 2 meses; default: SENDURA_SKU
 *   SENDURA_API_URL    → (opcional) default https://sendura.edgasanc.com
 */
import { validateOrderPayload, createSenduraOrder } from './_shared.js';

function fail(res, status, message, fallbackToShopify = false) {
  return res.status(status).json({ status: 'error', message, fallbackToShopify });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return fail(res, 405, 'Método no permitido');
  }

  if (!process.env.SENDURA_API_TOKEN) {
    // Config incompleta: el frontend ofrece completar la compra por Shopify.
    return fail(res, 503, 'El pago contra entrega no está disponible en este momento.', true);
  }

  const parsed = validateOrderPayload(req.body);
  if (parsed.error) return fail(res, 422, parsed.error);

  const result = await createSenduraOrder({ ...parsed, financialStatus: 'pending' });

  if (result.ok) {
    return res.status(201).json({
      status: 'success',
      orderNumber: result.data.order_number,
      guia: result.data.guia_number,
      total: parsed.total,
      paid: false,
    });
  }

  // 401 = token mal configurado; 422 = validación de negocio de Sendura.
  // En ambos casos ofrecemos Shopify como plan B para no perder la venta.
  console.error('[sendura] respuesta no exitosa:', result.status, result.data?.message);
  if (result.status === 422) {
    return fail(res, 422, result.data?.message || 'Sendura rechazó el pedido.', true);
  }
  return fail(res, 502, 'El pago contra entrega no está disponible en este momento.', true);
}
