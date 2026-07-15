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
