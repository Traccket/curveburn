/**
 * Configuración pública para el frontend del checkout:
 *  - Llave pública de Wompi + host (sandbox si es pub_test_) para tokenizar
 *    tarjetas directamente desde el navegador (los datos de la tarjeta
 *    NUNCA pasan por nuestros servidores).
 *  - Datos del plan de suscripción (precio autoritativo del servidor).
 *
 * Aquí solo se expone información pública — nada de llaves privadas.
 */
import { SUBSCRIPTION_PLAN } from './_shared.js';

export default function handler(req, res) {
  const publicKey = process.env.WOMPI_PUBLIC_KEY || null;
  const wompiBase = publicKey && publicKey.startsWith('pub_test_')
    ? 'https://sandbox.wompi.co'
    : 'https://production.wompi.co';

  const subscriptionReady = !!(publicKey && process.env.SENDURA_API_TOKEN && SUBSCRIPTION_PLAN.sku());

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
  return res.status(200).json({
    publicKey,
    wompiBase,
    subscription: subscriptionReady
      ? {
          planCode: SUBSCRIPTION_PLAN.planCode,
          price: SUBSCRIPTION_PLAN.unitPrice(),
          intervalDays: SUBSCRIPTION_PLAN.intervalDays,
          maxCycles: SUBSCRIPTION_PLAN.maxCycles,
        }
      : null,
  });
}
