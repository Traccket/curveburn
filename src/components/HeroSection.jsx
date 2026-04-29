import { useEffect, useState } from 'react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';
import { trackAddToCart, trackViewContent } from '../lib/analytics';
import { ShieldCheck, CheckCircle2, ShoppingCart, Truck } from 'lucide-react';
import UpsellModal from './UpsellModal';
import StarRating from './StarRating';
import GuaranteeBadge from './GuaranteeBadge';

export default function HeroSection() {
  const SUBS_ENABLED = SHOPIFY_CONFIG.SUBSCRIPTIONS_ENABLED;
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  // Si las suscripciones están desactivadas (Wompi pendiente), forzamos compra única.
  const [isSubscription, setIsSubscription] = useState(SUBS_ENABLED);

  const formatPrice = (amount) => amount.toLocaleString('es-CO').replace(/,/g, '.');
  const selectedVariant = isSubscription && SUBS_ENABLED
    ? SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS
    : SHOPIFY_CONFIG.VARIANTS.ONE_TIME;

  const priceOneTime = formatPrice(SHOPIFY_CONFIG.VARIANTS.ONE_TIME.price);
  const priceSub = formatPrice(SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS.price);
  const displayedPrice = formatPrice(selectedVariant.price);

  // Dispara ViewContent al montar (para audiencias de Meta)
  useEffect(() => {
    trackViewContent({
      contentId: selectedVariant.id,
      value: selectedVariant.price,
      currency: 'COP',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (isSub) => setIsSubscription(isSub);

  /**
   * Manejo de teclado WAI-ARIA para radiogroup:
   *  - Space/Enter: selecciona el radio enfocado (valor pasado por argumento).
   *  - ArrowLeft/ArrowUp: mueve la selección al radio anterior.
   *  - ArrowRight/ArrowDown: mueve la selección al siguiente radio.
   *
   * En nuestro caso solo hay dos opciones (ONE_TIME / SUBSCRIPTION), así que
   * las flechas alternan entre ambas independientemente del valor actual del
   * botón enfocado.
   * Referencia: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
   */
  const handleRadioKey = (e, isSub) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(isSub);
      return;
    }
    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowDown'
    ) {
      e.preventDefault();
      setIsSubscription((prev) => !prev);
    }
  };

  const handleAddToCart = () => {
    // Dispara AddToCart inmediatamente
    trackAddToCart({
      contentId: selectedVariant.id,
      value: selectedVariant.price,
      currency: 'COP',
      label: selectedVariant.label,
    });

    // Si el usuario eligió Compra Única: mostramos upsell primero.
    // Si ya eligió Suscripción: va directo a checkout.
    // Si las suscripciones están desactivadas: saltamos upsell y vamos directo
    // a checkout (no tiene sentido upsellear a un plan inexistente).
    if (!isSubscription && SUBS_ENABLED) {
      setIsUpsellOpen(true);
    } else {
      handleCheckout(selectedVariant.id, 1);
    }
  };

  return (
    <>
      <section
        id="comprar"
        aria-label="Comprar CURVE"
        className="relative z-10 pt-28 md:pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16"
      >
        {/* Imagen del producto */}
        <div className="w-full md:w-1/2 flex justify-center items-center order-1 relative min-h-[360px]">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-curvePink/20 via-curvePurple/10 to-transparent blur-[100px] rounded-full mix-blend-multiply pointer-events-none z-0"
          ></div>

          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <div className="relative w-[80%] md:w-[90%] max-w-[450px] transition-transform duration-500 hover:scale-[1.02] rounded-[3rem] overflow-hidden shadow-[0_30px_50px_rgba(166,117,162,0.15)] ring-1 ring-black/5 bg-white">
              <img
                src="/producto.png"
                alt="CURVE · Fórmula termogénica premium de 60 cápsulas"
                width="900"
                height="900"
                fetchpriority="high"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Copy + Checkout */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left order-2">
          {/* Social proof arriba del H1 — impacto alto en conversión */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StarRating rating={4.8} count={2047} size="md" />
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
              En stock
            </span>
          </div>

          <h1 className="text-4xl lg:text-[3.2rem] leading-[1.05] font-black tracking-tight text-textPrimary mb-4">
            Reescribe tu <span className="text-gradient drop-shadow-sm">Metabolismo.</span>
          </h1>

          <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed max-w-lg">
            Convierte tu tejido adiposo en energía pura. Termogénesis inteligente, control de
            ansiedad y quema sostenida — <strong>sin efecto rebote</strong>.
          </p>

          {/* CHECKOUT WIDGET */}
          <div className="w-full max-w-lg space-y-4" role="region" aria-label="Opciones de compra">
            {/* Radiogroup accesible */}
            <div
              role="radiogroup"
              aria-label="Selecciona tu plan de compra"
              className="space-y-3"
            >
              {/* Radio 1: Compra Única */}
              <button
                type="button"
                role="radio"
                aria-checked={!isSubscription}
                tabIndex={!isSubscription ? 0 : -1}
                onClick={() => handleSelect(false)}
                onKeyDown={(e) => handleRadioKey(e, false)}
                className={`w-full text-left cursor-pointer rounded-2xl border-2 transition-all p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction focus-visible:ring-offset-2 ${
                  !isSubscription
                    ? 'border-curveAction bg-[#fff4f8]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isSubscription ? 'border-curveAction' : 'border-gray-300'
                      }`}
                    >
                      {!isSubscription && (
                        <span className="w-2.5 h-2.5 bg-curveAction rounded-full"></span>
                      )}
                    </span>
                    <span className="font-bold text-gray-800">Compra Única</span>
                  </div>
                  <span className="font-black text-lg">${priceOneTime}</span>
                </div>
                <p className="text-xs text-gray-400 pl-8">Sin beneficios de suscripción</p>
              </button>

              {/* Radio 2: Suscripción — solo visible si SUBS_ENABLED.
                  Cuando está desactivado (Wompi pendiente) no renderizamos el botón
                  para evitar que los clientes lleguen a un checkout sin métodos de pago. */}
              {SUBS_ENABLED && (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSubscription}
                  tabIndex={isSubscription ? 0 : -1}
                  onClick={() => handleSelect(true)}
                  onKeyDown={(e) => handleRadioKey(e, true)}
                  className={`w-full text-left cursor-pointer rounded-2xl border-2 transition-all p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction focus-visible:ring-offset-2 relative ${
                    isSubscription
                      ? 'border-curveAction bg-[#fff4f8]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="absolute -top-2.5 right-4 bg-curveAction text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    Más popular
                  </span>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSubscription ? 'border-curveAction' : 'border-gray-300'
                        }`}
                      >
                        {isSubscription && (
                          <span className="w-2.5 h-2.5 bg-curveAction rounded-full"></span>
                        )}
                      </span>
                      <span className="font-bold text-gray-800">Suscripción · Plan 2 meses</span>
                    </div>
                    <span className="font-black text-lg text-curveAction">${priceSub}</span>
                  </div>

                  <div className="pl-8 space-y-2 opacity-90">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-curveAction" aria-hidden="true" />{' '}
                      Envío gratis incluido
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-curveAction" aria-hidden="true" />{' '}
                      Ciclo completo de 2 meses asegurado
                    </p>
                    <p className="text-xs text-gray-600 flex items-start gap-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-curveAction mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        <strong>Entrega automática:</strong> cobramos tu 2ª unidad 5 días antes para
                        que nunca rompas tu rutina.
                      </span>
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* CTA principal */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-curveAction text-white font-black py-4 rounded-full shadow-premium hover:brightness-110 active:scale-[0.98] transition-all text-lg flex justify-center items-center gap-3 mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
              aria-label={`Añadir al carrito: ${selectedVariant.label} por $${displayedPrice} pesos`}
            >
              Añadir al carrito{' '}
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm tracking-wide">
                ${displayedPrice}
              </span>
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Trust row + garantía */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-5 text-xs text-gray-600">
              <GuaranteeBadge />
              <span className="flex items-center gap-1 opacity-80">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Pago contra entrega
              </span>
              <span className="flex items-center gap-1 opacity-80">
                <Truck className="w-3.5 h-3.5" aria-hidden="true" /> Envío nacional
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Upsell cuando eligen Compra Única — solo si SUBS_ENABLED (de lo contrario
          no tiene sentido mostrar un upsell hacia un plan que no se puede pagar) */}
      {SUBS_ENABLED && (
        <UpsellModal isOpen={isUpsellOpen} onClose={() => setIsUpsellOpen(false)} />
      )}
    </>
  );
}
