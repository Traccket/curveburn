/**
 * Verifica una transacción de Wompi y, si está APROBADA, crea el pedido en
 * Sendura marcado como pagado.
 *
 * Seguridad: no confiamos en lo que diga el navegador — consultamos la
 * transacción directamente a la API de Wompi y comparamos referencia y monto
 * contra el recálculo del catálogo del servidor.
 */
import { validateOrderPayload, createSenduraOrder } from './_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'error', message: 'Método no permitido' });
  }

  const { transactionId, reference } = req.body || {};
  if (!transactionId || !/^[\w-]+$/.test(String(transactionId))) {
    return res.status(422).json({ status: 'error', message: 'Transacción inválida.' });
  }

  const parsed = validateOrderPayload(req.body?.order);
  if (parsed.error) {
    return res.status(422).json({ status: 'error', message: parsed.error });
  }

  // Consultar la transacción a Wompi (endpoint público de solo lectura)
  let tx;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const wompiRes = await fetch(
      `https://production.wompi.co/v1/transactions/${encodeURIComponent(transactionId)}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
    const json = await wompiRes.json().catch(() => ({}));
    tx = json?.data;
  } catch (err) {
    console.error('[wompi] error de red:', err?.message);
    return res.status(502).json({ status: 'error', message: 'No pudimos verificar el pago. Intenta de nuevo.' });
  }

  if (!tx) {
    return res.status(422).json({ status: 'error', message: 'No encontramos la transacción de pago.' });
  }

  // La referencia y el monto deben coincidir con lo que firmó el servidor
  if (reference && tx.reference !== reference) {
    return res.status(422).json({ status: 'error', message: 'La referencia del pago no coincide.' });
  }
  if (tx.amount_in_cents !== parsed.total * 100 || tx.currency !== 'COP') {
    return res.status(422).json({ status: 'error', message: 'El monto pagado no coincide con el pedido.' });
  }

  if (tx.status === 'PENDING') {
    // El cliente hace polling hasta que Wompi resuelva (PSE puede tardar)
    return res.status(202).json({ status: 'pending' });
  }

  if (tx.status !== 'APPROVED') {
    return res.status(422).json({
      status: 'error',
      declined: true,
      message: 'El pago no fue aprobado. Puedes intentar de nuevo o elegir pago contra entrega.',
    });
  }

  // Pago aprobado → crear el pedido en Sendura como PAGADO
  const result = await createSenduraOrder({
    ...parsed,
    financialStatus: 'paid',
    extraNotes: `💳 PAGADO ONLINE vía Wompi · Ref ${tx.reference} · Tx ${tx.id}`,
  });

  if (result.ok) {
    return res.status(201).json({
      status: 'success',
      orderNumber: result.data.order_number,
      guia: result.data.guia_number,
      total: parsed.total,
      paid: true,
    });
  }

  // ⚠️ Pago cobrado pero Sendura falló: registrar todo en logs para
  // crear el pedido manualmente. Al cliente se le informa con la referencia.
  console.error('[wompi-confirm] PAGO APROBADO PERO SENDURA FALLÓ:', {
    txId: tx.id,
    reference: tx.reference,
    amount: tx.amount_in_cents,
    senduraStatus: result.status,
    senduraMessage: result.data?.message,
    customer: parsed.customer,
  });
  return res.status(502).json({
    status: 'error',
    paidButNotRegistered: true,
    message: `Tu pago fue aprobado (ref ${tx.reference}) pero hubo un problema registrando el envío. Escríbenos con esa referencia y lo resolvemos de inmediato — tu dinero está seguro.`,
  });
}
