/**
 * Punto de entrada único del checkout de la landing.
 *
 * En vez de redirigir directo a Shopify, `beginCheckout()` dispara un evento
 * global que abre <CheckoutFlow/> (montado en App). Ahí se pregunta la ciudad:
 *  - Ciudad con cobertura local → formulario contra-entrega → POST /api/orders
 *    (función serverless que crea el pedido en Sendura).
 *  - Otra ciudad → handleCheckout() de shopify.js (flujo original).
 */

export const BEGIN_CHECKOUT_EVENT = 'curve:begin-checkout';

// Ciudades con mensajero propio + pago contra entrega. La provincia la
// resuelve el servidor (api/orders.js); aquí solo va lo que ve el usuario.
export const COVERAGE_CITIES = [
  { id: 'bogota', label: 'Bogotá' },
  { id: 'soacha', label: 'Soacha' },
  { id: 'medellin', label: 'Medellín' },
  { id: 'envigado', label: 'Envigado' },
  { id: 'bello', label: 'Bello' },
  { id: 'la-estrella', label: 'La Estrella' },
  { id: 'itagui', label: 'Itagüí' },
];

/**
 * @param {string} variantId - ID de variante de Shopify (SHOPIFY_CONFIG.VARIANTS)
 * @param {number} quantity
 * @param {{ discount?: string, utmSource?: string, utmMedium?: string, utmCampaign?: string, quizDiscount?: boolean }} options
 */
export function beginCheckout(variantId, quantity = 1, options = {}) {
  window.dispatchEvent(
    new CustomEvent(BEGIN_CHECKOUT_EVENT, { detail: { variantId, quantity, options } }),
  );
}

/**
 * Envía el pedido local a nuestra función serverless.
 * Devuelve { ok, data } — nunca lanza, para que el modal siempre pueda
 * mostrar un estado de error con fallback a Shopify.
 */
export async function submitLocalOrder(payload) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.status === 201, data };
  } catch {
    return {
      ok: false,
      data: {
        message: 'No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo.',
        fallbackToShopify: true,
      },
    };
  }
}
