/**
 * Analytics centralizados — Meta Pixel + GA4 + dataLayer
 *
 * Todas las funciones son no-op seguras si:
 *   - El usuario no ha aceptado cookies (CONSENT_KEY !== 'granted')
 *   - Los scripts de tracking aún no se han cargado
 *   - Se está corriendo en SSR / sin window
 *
 * Esto cumple Ley 1581 Colombia (habeas data) + GDPR best practices.
 */

export const CONSENT_KEY = 'curve_consent';
export const CONSENT_GRANTED = 'granted';
export const CONSENT_DENIED = 'denied';

function hasConsent() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage?.getItem(CONSENT_KEY) === CONSENT_GRANTED;
  } catch {
    return false;
  }
}

function safeCall(fn) {
  try {
    fn();
  } catch (err) {
    // Silencioso en producción; logea solo en dev
    if (import.meta?.env?.DEV) {
      console.warn('[analytics] error:', err);
    }
  }
}

/**
 * Meta Pixel — solo si hay consentimiento y fbq existe.
 */
function fbq(eventName, payload = {}) {
  if (!hasConsent()) return;
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  safeCall(() => window.fbq('track', eventName, payload));
}

/**
 * GA4 — solo si hay consentimiento y gtag existe.
 */
function gtag(eventName, payload = {}) {
  if (!hasConsent()) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  safeCall(() => window.gtag('event', eventName, payload));
}

/**
 * dataLayer (GTM compat) — útil incluso sin gtag directo.
 * También respeta consentimiento: si algún día se conecta GTM, los tags
 * no deben recibir eventos de usuarios que no aceptaron cookies.
 */
function pushDataLayer(payload) {
  if (!hasConsent()) return;
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  safeCall(() => window.dataLayer.push(payload));
}

// ============================================================
// EVENTOS PÚBLICOS
// ============================================================

/**
 * Vista del producto principal. Disparar al montar HeroSection.
 */
export function trackViewContent({ contentId, value, currency = 'COP' } = {}) {
  fbq('ViewContent', {
    content_ids: [contentId],
    content_type: 'product',
    value,
    currency,
  });
  gtag('view_item', {
    currency,
    value,
    items: [{ item_id: contentId, quantity: 1, price: value }],
  });
  pushDataLayer({ event: 'view_item', content_id: contentId, value, currency });
}

/**
 * Click en "Añadir al carrito". Disparar ANTES del redirect a Shopify.
 */
export function trackAddToCart({ contentId, value, currency = 'COP', label } = {}) {
  fbq('AddToCart', {
    content_ids: [contentId],
    content_type: 'product',
    content_name: label,
    value,
    currency,
  });
  gtag('add_to_cart', {
    currency,
    value,
    items: [{ item_id: contentId, item_name: label, quantity: 1, price: value }],
  });
  pushDataLayer({ event: 'add_to_cart', content_id: contentId, value, currency, label });
}

/**
 * Redirect a checkout de Shopify. Es el evento MÁS valioso para optimizar ads.
 */
export function trackInitiateCheckout({ contentId, value, currency = 'COP', label } = {}) {
  fbq('InitiateCheckout', {
    content_ids: [contentId],
    content_type: 'product',
    content_name: label,
    value,
    currency,
    num_items: 1,
  });
  gtag('begin_checkout', {
    currency,
    value,
    items: [{ item_id: contentId, item_name: label, quantity: 1, price: value }],
  });
  pushDataLayer({ event: 'begin_checkout', content_id: contentId, value, currency, label });
}

/**
 * Compra confirmada (pedido contra-entrega creado en Sendura).
 * Es el evento de mayor valor: conversión real, no solo intención.
 */
export function trackPurchase({ contentId, value, currency = 'COP', label, orderId } = {}) {
  fbq('Purchase', {
    content_ids: [contentId],
    content_type: 'product',
    content_name: label,
    value,
    currency,
  });
  gtag('purchase', {
    transaction_id: orderId,
    currency,
    value,
    items: [{ item_id: contentId, item_name: label, price: value }],
  });
  pushDataLayer({ event: 'purchase', content_id: contentId, value, currency, order_id: orderId });
}

/**
 * Lead capturado (quiz completado, exit intent capturado, etc.).
 */
export function trackLead({ source, value = 0 } = {}) {
  fbq('Lead', { content_name: source, value, currency: 'COP' });
  gtag('generate_lead', { method: source, value });
  pushDataLayer({ event: 'generate_lead', source });
}

/**
 * CTA clicks genéricos (para entender qué botones mueven la aguja).
 */
export function trackCTA(label) {
  gtag('cta_click', { cta_label: label });
  pushDataLayer({ event: 'cta_click', cta_label: label });
}
