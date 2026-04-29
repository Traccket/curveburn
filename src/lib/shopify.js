// ============================================================
// Headless Shopify Configuration
// ============================================================
export const SHOPIFY_CONFIG = {
  DOMAIN: 'toplinenatural.myshopify.com',
  VARIANTS: {
    ONE_TIME: {
      id: '48063268585713',
      price: 110000,
      label: 'Compra Única',
      permalink: 'https://toplinenatural.myshopify.com/cart/48063268585713:1',
    },
    PLAN_2_MONTHS: {
      id: '48063271076081',
      price: 89000,
      label: 'Plan 2 meses',
      // Selling plan ID del Shopify Subscription Plan "Plan 2 meses CURVE".
      // Sin este ID, Shopify trata la variante como compra única en vez de suscripción.
      sellingPlanId: '5465538801',
      permalink: 'https://toplinenatural.myshopify.com/cart/48063271076081:1?selling_plan=5465538801',
    },
  },
};

import { trackInitiateCheckout } from './analytics';

/**
 * Construye el permalink de Shopify con soporte para códigos de descuento
 * y atribución UTM opcional.
 *
 * Formato: https://{domain}/cart/{variant_id}:{qty}?discount={code}&utm_source={src}
 * Ref: https://help.shopify.com/en/manual/products/details/checkout-permalink
 */
export function buildCheckoutUrl(variantId, quantity = 1, options = {}) {
  if (!variantId) {
    throw new Error('[shopify] variantId requerido para construir checkout URL');
  }
  // Validar que variantId es numérico (Shopify variant IDs siempre lo son).
  // Previene inyección de paths/queries y errores de checkout silenciosos.
  const variantIdStr = String(variantId).trim();
  if (!/^\d+$/.test(variantIdStr)) {
    throw new Error(`[shopify] variantId debe ser numérico, recibido: ${variantIdStr}`);
  }
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const base = `https://${SHOPIFY_CONFIG.DOMAIN}/cart/${variantIdStr}:${qty}`;

  const params = new URLSearchParams();
  if (options.discount) params.append('discount', options.discount);
  if (options.utmSource) params.append('utm_source', options.utmSource);
  if (options.utmMedium) params.append('utm_medium', options.utmMedium);
  if (options.utmCampaign) params.append('utm_campaign', options.utmCampaign);

  // Selling plan (suscripción): si la variante tiene sellingPlanId configurado,
  // se añade automáticamente para que Shopify la trate como suscripción recurrente
  // en vez de compra única. Pasar `options.sellingPlanId = null` lo desactiva.
  let sellingPlanId = options.sellingPlanId;
  if (sellingPlanId === undefined) {
    sellingPlanId = findVariantById(variantIdStr)?.sellingPlanId;
  }
  if (sellingPlanId) {
    params.append('selling_plan', String(sellingPlanId));
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Busca el objeto de variante completo (con price y label) desde un id.
 * Útil para disparar eventos de tracking con datos correctos.
 */
function findVariantById(variantId) {
  return Object.values(SHOPIFY_CONFIG.VARIANTS).find((v) => v.id === variantId) || null;
}

// Guard module-level para prevenir double-submit. Un usuario que hace doble click
// rápido en el botón podría disparar dos redirects, dos eventos de tracking
// duplicados y en algunos navegadores (Safari iOS) comportamiento errático.
let _isRedirecting = false;

/**
 * Redirige al checkout de Shopify. Dispara el evento InitiateCheckout
 * ANTES del redirect (crítico para la atribución de Meta Ads).
 *
 * @param {string} variantId
 * @param {number} quantity
 * @param {{ discount?: string, utmSource?: string, utmMedium?: string, utmCampaign?: string, skipTracking?: boolean }} options
 * @returns {boolean} true si el redirect fue iniciado, false si fue ignorado (double-click / variantId inválido)
 */
export function handleCheckout(variantId, quantity = 1, options = {}) {
  if (_isRedirecting) {
    // Double-click o trigger duplicado: ignorar silenciosamente
    return false;
  }

  if (!variantId) {
    console.error('[shopify] variantId requerido para checkout');
    return false;
  }

  let url;
  try {
    url = buildCheckoutUrl(variantId, quantity, options);
  } catch (err) {
    console.error('[shopify]', err.message);
    return false;
  }

  // A partir de aquí: hemos validado la URL y estamos comprometidos con el redirect.
  _isRedirecting = true;

  const variant = findVariantById(variantId);

  // Dispara tracking antes del redirect
  if (!options.skipTracking && variant) {
    try {
      trackInitiateCheckout({
        contentId: variantId,
        value: variant.price,
        currency: 'COP',
        label: variant.label,
      });
    } catch (_) {
      // Nunca bloquear el checkout por un error de tracking
    }
  }

  // Pequeño delay para que los pixels alcancen a hacer el network request
  // antes de que el navegador abandone la página. Limitado a 250ms para
  // evitar que el usuario perciba la página como "colgada".
  const REDIRECT_DELAY_MS = 150;
  setTimeout(() => {
    window.location.href = url;
  }, REDIRECT_DELAY_MS);

  // Fallback: si por alguna razón el navegador no dispara el redirect en 2s,
  // liberamos el guard para que el usuario pueda reintentar.
  setTimeout(() => {
    _isRedirecting = false;
  }, 2000);

  return true;
}
