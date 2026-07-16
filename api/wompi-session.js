/**
 * Prepara una sesión de pago del Web Checkout de Wompi.
 *
 * El monto se calcula en el SERVIDOR (catálogo autoritativo) y se firma con
 * el secreto de integridad — así nadie puede pagar un valor distinto al real.
 *
 * Variables de entorno (Vercel):
 *   WOMPI_PUBLIC_KEY        → llave pública de producción (pub_prod_...)
 *   WOMPI_INTEGRITY_SECRET  → "Secreto de integridad" (Wompi → Desarrolladores)
 */
import crypto from 'node:crypto';
import { validateOrderPayload } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!publicKey || !integritySecret) {
    return res.status(503).json({
      status: 'error',
      message: 'El pago online no está disponible en este momento.',
    });
  }

  const parsed = validateOrderPayload(req.body);
  if (parsed.error) {
    return res.status(422).json({ status: 'error', message: parsed.error });
  }

  const amountInCents = parsed.total * 100;
  const currency = 'COP';
  const reference = `CURVE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  // Firma de integridad requerida por Wompi: sha256(referencia+monto+moneda+secreto)
  const signature = crypto
    .createHash('sha256')
    .update(`${reference}${amountInCents}${currency}${integritySecret}`)
    .digest('hex');

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers.host}`;
  const redirectUrl = `${origin}/?wompi_return=1`;

  const params = new URLSearchParams({
    'public-key': publicKey,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': signature,
    'redirect-url': redirectUrl,
    'customer-data:full-name': parsed.customer.name,
    'customer-data:phone-number': parsed.customer.phone,
    ...(parsed.customer.email ? { 'customer-data:email': parsed.customer.email } : {}),
  });

  return res.status(200).json({
    status: 'success',
    reference,
    total: parsed.total,
    checkoutUrl: `https://checkout.wompi.co/p/?${params.toString()}`,
  });
}
