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

// Ciudades con mensajero propio + pago contra entrega. Los ids deben
// coincidir con CITIES en api/orders.js (el servidor resuelve la provincia).
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
 * Departamentos de Colombia para el selector del checkout.
 * Solo los departamentos con cobertura Sendura llevan lista de ciudades:
 * las ciudades con `coveredId` van a pago contra entrega; el resto (y todos
 * los demás departamentos) van a Shopify con envío nacional.
 */
export const DEPARTMENTS = [
  {
    id: 'bogota-dc',
    label: 'Bogotá, D.C.',
    cities: [{ label: 'Bogotá', coveredId: 'bogota' }],
  },
  {
    id: 'cundinamarca',
    label: 'Cundinamarca',
    cities: [
      { label: 'Soacha', coveredId: 'soacha' },
      { label: 'Chía' },
      { label: 'Zipaquirá' },
      { label: 'Facatativá' },
      { label: 'Fusagasugá' },
      { label: 'Mosquera' },
      { label: 'Madrid' },
      { label: 'Funza' },
      { label: 'Cajicá' },
      { label: 'Girardot' },
      { label: 'Cota' },
      { label: 'La Calera' },
      { label: 'Sibaté' },
      { label: 'Tocancipá' },
      { label: 'Sopó' },
      { label: 'Otro municipio' },
    ],
  },
  {
    id: 'antioquia',
    label: 'Antioquia',
    cities: [
      { label: 'Medellín', coveredId: 'medellin' },
      { label: 'Envigado', coveredId: 'envigado' },
      { label: 'Bello', coveredId: 'bello' },
      { label: 'Itagüí', coveredId: 'itagui' },
      { label: 'La Estrella', coveredId: 'la-estrella' },
      { label: 'Sabaneta' },
      { label: 'Caldas' },
      { label: 'Copacabana' },
      { label: 'Girardota' },
      { label: 'Rionegro' },
      { label: 'La Ceja' },
      { label: 'Marinilla' },
      { label: 'Apartadó' },
      { label: 'Otro municipio' },
    ],
  },
  // Sin cobertura local → pago online (Shopify) con envío nacional
  { id: 'amazonas', label: 'Amazonas' },
  { id: 'arauca', label: 'Arauca' },
  { id: 'atlantico', label: 'Atlántico' },
  { id: 'bolivar', label: 'Bolívar' },
  { id: 'boyaca', label: 'Boyacá' },
  { id: 'caldas-dpto', label: 'Caldas' },
  { id: 'caqueta', label: 'Caquetá' },
  { id: 'casanare', label: 'Casanare' },
  { id: 'cauca', label: 'Cauca' },
  { id: 'cesar', label: 'Cesar' },
  { id: 'choco', label: 'Chocó' },
  { id: 'cordoba', label: 'Córdoba' },
  { id: 'guainia', label: 'Guainía' },
  { id: 'guaviare', label: 'Guaviare' },
  { id: 'huila', label: 'Huila' },
  { id: 'la-guajira', label: 'La Guajira' },
  { id: 'magdalena', label: 'Magdalena' },
  { id: 'meta', label: 'Meta' },
  { id: 'narino', label: 'Nariño' },
  { id: 'norte-santander', label: 'Norte de Santander' },
  { id: 'putumayo', label: 'Putumayo' },
  { id: 'quindio', label: 'Quindío' },
  { id: 'risaralda', label: 'Risaralda' },
  { id: 'san-andres', label: 'San Andrés y Providencia' },
  { id: 'santander', label: 'Santander' },
  { id: 'sucre', label: 'Sucre' },
  { id: 'tolima', label: 'Tolima' },
  { id: 'valle', label: 'Valle del Cauca' },
  { id: 'vaupes', label: 'Vaupés' },
  { id: 'vichada', label: 'Vichada' },
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

const NETWORK_ERROR = {
  message: 'No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo.',
  fallbackToShopify: true,
};

async function post(url, payload) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { httpStatus: res.status, data };
  } catch {
    return { httpStatus: 0, data: NETWORK_ERROR };
  }
}

/**
 * Crea un pedido contra entrega en Sendura vía nuestra función serverless.
 * Devuelve { ok, data } — nunca lanza, para que el modal siempre pueda
 * mostrar un estado de error con fallback a Shopify.
 */
export async function submitLocalOrder(payload) {
  const { httpStatus, data } = await post('/api/orders', payload);
  return { ok: httpStatus === 201, data };
}

// ============================================================
// Pago online con Wompi (el pedido llega a Sendura como pagado)
// ============================================================

// Guarda el pedido pendiente mientras el cliente está en el checkout de
// Wompi (la página se abandona y se vuelve con ?wompi_return=1&id=...).
export const WOMPI_PENDING_KEY = 'curve_wompi_pending';

/**
 * Pide al servidor una sesión firmada de Wompi y redirige al checkout.
 * Antes de redirigir persiste el pedido en localStorage para retomarlo
 * al volver. Devuelve { ok, data } solo si algo falló (si va bien, navega).
 */
export async function startWompiPayment(orderPayload, meta = {}) {
  const { httpStatus, data } = await post('/api/wompi-session', orderPayload);
  if (httpStatus !== 200 || !data.checkoutUrl) {
    return { ok: false, data };
  }
  try {
    window.localStorage?.setItem(
      WOMPI_PENDING_KEY,
      JSON.stringify({ order: orderPayload, reference: data.reference, ...meta }),
    );
  } catch {
    return { ok: false, data: { message: 'Tu navegador bloquea el almacenamiento necesario para el pago online. Usa pago contra entrega.' } };
  }
  window.location.href = data.checkoutUrl;
  return { ok: true, data };
}

/** Lee y limpia el pedido pendiente de Wompi al volver del checkout. */
export function readWompiPending() {
  try {
    const raw = window.localStorage?.getItem(WOMPI_PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearWompiPending() {
  try {
    window.localStorage?.removeItem(WOMPI_PENDING_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Confirma la transacción con el servidor (que la verifica contra Wompi y
 * crea el pedido en Sendura). Devuelve { ok, pending, data }.
 */
export async function confirmWompiPayment({ transactionId, reference, order }) {
  const { httpStatus, data } = await post('/api/wompi-confirm', { transactionId, reference, order });
  return { ok: httpStatus === 201, pending: httpStatus === 202, data };
}

// ============================================================
// Suscripción mensual (cobro recurrente Sendura + Wompi)
// ============================================================

/**
 * Config pública del checkout: llave pública de Wompi, host (sandbox/prod)
 * y datos del plan de suscripción. null si no se pudo cargar.
 * Cacheada a nivel de módulo: el hero y el checkout comparten una sola
 * petición; si falla, el siguiente llamado reintenta.
 */
let _wompiCfgCache = null;
export async function getWompiConfig() {
  if (_wompiCfgCache) return _wompiCfgCache;
  try {
    const res = await fetch('/api/wompi-config');
    if (!res.ok) return null;
    const cfg = await res.json();
    _wompiCfgCache = cfg;
    return cfg;
  } catch {
    return null;
  }
}

/**
 * Acceptance token de términos de Wompi (requerido para crear la fuente
 * de pago). Se pide directo a Wompi con la llave pública.
 */
export async function getWompiAcceptance(cfg) {
  try {
    const res = await fetch(`${cfg.wompiBase}/v1/merchants/${cfg.publicKey}`);
    const json = await res.json();
    return json?.data?.presigned_acceptance?.acceptance_token || null;
  } catch {
    return null;
  }
}

/**
 * Tokeniza la tarjeta DIRECTAMENTE navegador → Wompi (llave pública).
 * Los datos de la tarjeta nunca tocan nuestros servidores (PCI-DSS).
 * Devuelve { ok, token } o { ok: false, message }.
 */
export async function tokenizeWompiCard(cfg, card) {
  try {
    const res = await fetch(`${cfg.wompiBase}/v1/tokens/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.publicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(card),
    });
    const json = await res.json().catch(() => ({}));
    if (json?.status === 'CREATED' && json?.data?.id) {
      return { ok: true, token: json.data.id };
    }
    const messages = json?.error?.messages
      ? Object.values(json.error.messages).flat().join(' ')
      : null;
    return { ok: false, message: messages || 'No pudimos validar la tarjeta. Revisa los datos.' };
  } catch {
    return { ok: false, message: 'No pudimos conectar con la pasarela de pago. Revisa tu internet.' };
  }
}

/**
 * Crea la suscripción vía nuestra función serverless (que llama a Sendura).
 * Devuelve { ok, pending, data }.
 */
export async function submitSubscription(payload) {
  const { httpStatus, data } = await post('/api/subscriptions', payload);
  return { ok: httpStatus === 201, pending: httpStatus === 202, data };
}
