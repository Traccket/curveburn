import { useEffect, useState, useCallback } from 'react';
import {
  X, MapPin, Truck, Banknote, CheckCircle2, ChevronRight, Loader2, AlertTriangle,
  Minus, Plus,
} from 'lucide-react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';
import {
  BEGIN_CHECKOUT_EVENT, DEPARTMENTS, submitLocalOrder,
} from '../lib/localCheckout';
import { trackCTA, trackInitiateCheckout, trackPurchase } from '../lib/analytics';
import { useModal } from '../hooks/useModal';

const MAX_QTY = 5;

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  address: '',
  addressDetail: '',
  notes: '',
};

function findVariant(variantId) {
  return Object.entries(SHOPIFY_CONFIG.VARIANTS).find(([, v]) => v.id === variantId) || null;
}

const formatPrice = (n) => n.toLocaleString('es-CO').replace(/,/g, '.');

/**
 * Flujo de checkout con puerta de ciudad:
 *  1. "¿A qué ciudad va tu pedido?" — si es una ciudad con cobertura local,
 *     formulario de pago contra entrega que crea el pedido en Sendura
 *     (vía /api/orders). Si es otra ciudad, redirige a Shopify como siempre.
 *  2. Éxito: muestra número de orden y guía de la transportadora.
 *  3. Cualquier error del backend ofrece "continuar por Shopify" como plan B
 *     para no perder la venta.
 */
export default function CheckoutFlow() {
  // request = null (cerrado) | { variantId, quantity, options }
  const [request, setRequest] = useState(null);
  const [step, setStep] = useState('city'); // city | form | sending | success | error
  const [deptId, setDeptId] = useState('');
  const [cityLabel, setCityLabel] = useState('');
  const [cityId, setCityId] = useState(null); // id de ciudad con cobertura (o null)
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState(null); // { orderNumber, guia, total }
  const [serverError, setServerError] = useState(null); // { message, fallbackToShopify }

  useEffect(() => {
    const onBegin = (e) => {
      const { variantId, quantity, options } = e.detail || {};
      if (!findVariant(variantId)) return;
      setRequest({ variantId, quantity: quantity || 1, options: options || {} });
      setStep('city');
      setDeptId('');
      setCityLabel('');
      setCityId(null);
      setQty(quantity || 1);
      setForm(EMPTY_FORM);
      setFormError('');
      setResult(null);
      setServerError(null);
    };
    window.addEventListener(BEGIN_CHECKOUT_EVENT, onBegin);
    return () => window.removeEventListener(BEGIN_CHECKOUT_EVENT, onBegin);
  }, []);

  const close = useCallback(() => {
    // No permitir cerrar mientras se envía el pedido (evita dobles envíos
    // por reintento del usuario sin saber si el primero entró).
    setRequest((prev) => prev && step === 'sending' ? prev : null);
  }, [step]);

  const { containerRef, initialFocusRef } = useModal(!!request, close);

  if (!request) return null;

  const entry = findVariant(request.variantId);
  const [variantKey, variant] = entry;
  const hasQuizDiscount = !!request.options.quizDiscount;
  const unitPrice = hasQuizDiscount ? Math.round(variant.price * 0.95) : variant.price;
  const total = unitPrice * qty;

  const goToShopify = (source) => {
    trackCTA(`checkout_gate_shopify_${source}`);
    setRequest(null);
    handleCheckout(request.variantId, request.quantity, request.options);
  };

  const dept = DEPARTMENTS.find((d) => d.id === deptId) || null;
  const selectedCity = dept?.cities?.find((c) => c.label === cityLabel) || null;
  // Ruta resuelta: 'local' (contra entrega), 'shopify' (envío nacional) o null (falta elegir)
  const route = !dept
    ? null
    : dept.cities
      ? selectedCity
        ? selectedCity.coveredId ? 'local' : 'shopify'
        : null
      : 'shopify';

  const onSelectDept = (e) => {
    const id = e.target.value;
    setDeptId(id);
    const d = DEPARTMENTS.find((x) => x.id === id);
    // Si el departamento tiene una sola ciudad (Bogotá D.C.), preseleccionarla.
    setCityLabel(d?.cities?.length === 1 ? d.cities[0].label : '');
  };

  const continueFromLocation = () => {
    if (route === 'local') {
      trackCTA(`checkout_gate_city_${selectedCity.coveredId}`);
      setCityId(selectedCity.coveredId);
      setStep('form');
      // Abrir el formulario local ES iniciar el checkout a efectos de ads.
      trackInitiateCheckout({
        contentId: variant.id,
        value: total,
        currency: 'COP',
        label: `${variant.label} (contra entrega)`,
      });
    } else if (route === 'shopify') {
      goToShopify(dept.cities ? 'city_no_coverage' : 'dept_no_coverage');
    }
  };

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    if (form.customerName.trim().length < 3) return 'Escribe tu nombre completo.';
    if (!/^3\d{9}$/.test(form.customerPhone.replace(/\D/g, '')))
      return 'El celular debe tener 10 dígitos y empezar por 3.';
    if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim()))
      return 'El correo no es válido.';
    if (form.address.trim().length < 5) return 'Escribe la dirección completa de entrega.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    setStep('sending');

    const { ok, data } = await submitLocalOrder({
      variant: variantKey,
      cityId,
      quantity: qty,
      quizDiscount: hasQuizDiscount,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      address: form.address,
      addressDetail: form.addressDetail,
      notes: form.notes,
    });

    if (ok) {
      setResult(data);
      setStep('success');
      trackPurchase({
        contentId: variant.id,
        value: data.total ?? total,
        currency: 'COP',
        label: `${variant.label} (contra entrega)`,
        orderId: data.orderNumber,
      });
    } else {
      setServerError(data);
      setStep('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar compra"
    >
      <div
        className="absolute inset-0 bg-textPrimary/50 backdrop-blur-md"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-premium overflow-hidden animate-in zoom-in duration-300 max-h-[92vh] flex flex-col"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-curve-gradient" aria-hidden="true" />

        {step !== 'sending' && (
          <button
            ref={initialFocusRef}
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-gray-400 hover:text-textPrimary transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 md:p-8 pt-8 overflow-y-auto custom-scrollbar">

          {/* PASO 1: UBICACIÓN (departamento → ciudad) */}
          {step === 'city' && (
            <div>
              <div className="w-12 h-12 rounded-full bg-curvePink/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-curveAction" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-textPrimary leading-tight mb-2">
                ¿A dónde va tu pedido?
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                En varias ciudades entregamos con mensajero propio y{' '}
                <strong className="text-textPrimary">pagas al recibir</strong> 💵
              </p>

              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Departamento
              </label>
              <select
                value={deptId}
                onChange={onSelectDept}
                className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-curveAction transition-colors appearance-none"
              >
                <option value="" disabled>Selecciona tu departamento…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>

              {dept?.cities && dept.cities.length > 1 && (
                <>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 mt-4">
                    Ciudad / Municipio
                  </label>
                  <select
                    value={cityLabel}
                    onChange={(e) => setCityLabel(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-curveAction transition-colors appearance-none"
                  >
                    <option value="" disabled>Selecciona tu ciudad…</option>
                    {dept.cities.map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}{c.coveredId ? ' — 💵 pago contra entrega' : ''}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {route === 'local' && (
                <p className="mt-4 text-sm font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Banknote className="w-4 h-4 shrink-0" aria-hidden="true" />
                  En {cityLabel} pagas al recibir, con mensajero propio.
                </p>
              )}
              {route === 'shopify' && (
                <p className="mt-4 text-sm font-semibold text-curvePurple bg-curvePink/5 border border-curvePink/20 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Llegamos con envío nacional — pago online seguro.
                </p>
              )}

              <button
                type="button"
                onClick={continueFromLocation}
                disabled={!route}
                className="mt-5 w-full bg-curveAction text-white font-black py-4 rounded-full shadow-premium hover:brightness-110 active:scale-[0.98] transition-all text-base flex justify-center items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                Continuar <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* PASO 2: FORMULARIO */}
          {step === 'form' && (
            <form onSubmit={submit} noValidate>
              <h2 className="text-xl font-black text-textPrimary leading-tight mb-1">
                Datos de entrega en {cityLabel}
              </h2>
              <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                Pago contra entrega — solo pagas cuando recibes tu CURVE.
              </p>

              {/* Resumen del pedido */}
              <div className="bg-background border border-gray-100 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-textPrimary truncate">{variant.label}</p>
                    <p className="text-xs text-gray-400">
                      ${formatPrice(unitPrice)} c/u
                      {hasQuizDiscount && (
                        <span className="ml-1 text-green-600 font-bold">· 5% quiz aplicado</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Cantidad">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Quitar una unidad"
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction"
                    >
                      <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span className="font-black text-sm w-4 text-center" aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                      aria-label="Añadir una unidad"
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 mt-3 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Total al recibir
                  </span>
                  <span className="font-black text-lg text-curveAction">${formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={form.customerName}
                  onChange={setField('customerName')}
                  placeholder="Nombre completo *"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-curveAction transition-colors"
                />
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={setField('customerPhone')}
                  placeholder="Celular / WhatsApp (10 dígitos) *"
                  autoComplete="tel"
                  inputMode="numeric"
                  required
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-curveAction transition-colors"
                />
                <input
                  type="text"
                  value={form.address}
                  onChange={setField('address')}
                  placeholder="Dirección de entrega *"
                  autoComplete="street-address"
                  required
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-curveAction transition-colors"
                />
                <input
                  type="text"
                  value={form.addressDetail}
                  onChange={setField('addressDetail')}
                  placeholder="Apto, torre, barrio, indicaciones (opcional)"
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-curveAction transition-colors"
                />
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={setField('customerEmail')}
                  placeholder="Correo (opcional)"
                  autoComplete="email"
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-curveAction transition-colors"
                />
              </div>

              {formError && (
                <p role="alert" className="mt-3 text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {formError}
                </p>
              )}

              <button
                type="submit"
                className="mt-5 w-full bg-curveAction text-white font-black py-4 rounded-full shadow-premium hover:brightness-110 active:scale-[0.98] transition-all text-base flex justify-center items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
              >
                Confirmar pedido — ${formatPrice(total)}
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setStep('city')}
                className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded py-1"
              >
                ← Cambiar ciudad
              </button>
            </form>
          )}

          {/* PASO 3: ENVIANDO */}
          {step === 'sending' && (
            <div className="py-12 flex flex-col items-center text-center">
              <Loader2 className="w-10 h-10 text-curveAction animate-spin mb-4" aria-hidden="true" />
              <h2 className="font-black text-lg text-textPrimary mb-1">Creando tu pedido…</h2>
              <p className="text-sm text-gray-500">Estamos generando tu guía de envío.</p>
            </div>
          )}

          {/* PASO 4: ÉXITO */}
          {step === 'success' && result && (
            <div className="py-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-600" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-black text-textPrimary mb-2">¡Pedido confirmado! 🎉</h2>
              <p className="text-sm text-gray-600 mb-5">
                Tu CURVE va en camino a <strong>{cityLabel}</strong>. Pagas{' '}
                <strong className="text-curveAction">${formatPrice(result.total ?? total)}</strong>{' '}
                al recibirlo.
              </p>

              <div className="bg-background border border-gray-100 rounded-2xl p-4 text-left space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">N° de pedido</span>
                  <span className="font-mono font-bold text-textPrimary">{result.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Guía de envío</span>
                  <span className="font-mono font-bold text-textPrimary">{result.guia}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-5 flex items-center justify-center gap-1.5">
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                Te contactaremos al celular que dejaste para coordinar la entrega.
              </p>

              <button
                type="button"
                onClick={close}
                className="w-full bg-curveAction text-white font-black py-3.5 rounded-full shadow-premium hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
              >
                Listo
              </button>
            </div>
          )}

          {/* PASO 5: ERROR */}
          {step === 'error' && serverError && (
            <div className="py-4 text-center">
              <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-black text-textPrimary mb-2">No pudimos crear el pedido</h2>
              <p className="text-sm text-gray-600 mb-5">{serverError.message}</p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full bg-curveAction text-white font-black py-3.5 rounded-full shadow-premium hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
                >
                  Intentar de nuevo
                </button>
                {serverError.fallbackToShopify && (
                  <button
                    type="button"
                    onClick={() => goToShopify('error_fallback')}
                    className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-full hover:bg-gray-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  >
                    Completar compra pagando online
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
