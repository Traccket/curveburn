import { X, ArrowRight } from 'lucide-react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';
import { trackCTA, trackAddToCart } from '../lib/analytics';
import { useModal } from '../hooks/useModal';

export default function UpsellModal({ isOpen, onClose }) {
  const { containerRef, initialFocusRef } = useModal(isOpen, onClose);

  if (!isOpen) return null;

  const subVariant = SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS;
  const oneTime = SHOPIFY_CONFIG.VARIANTS.ONE_TIME;

  const upgradeToSub = () => {
    trackCTA('upsell_accept_subscription');
    // El AddToCart original se disparó con la variante de compra única;
    // al aceptar el upsell re-disparamos con la variante real para que
    // Meta/GA4 atribuyan el checkout a la suscripción y no descuadre.
    trackAddToCart({
      contentId: subVariant.id,
      value: subVariant.price,
      currency: 'COP',
      label: `${subVariant.label} (upsell)`,
    });
    handleCheckout(subVariant.id, 1);
    onClose();
  };

  const declineUpsell = () => {
    trackCTA('upsell_decline');
    handleCheckout(oneTime.id, 1);
    onClose();
  };

  const formatPrice = (n) => n.toLocaleString('es-CO').replace(/,/g, '.');
  const savings = oneTime.price * 2 - subVariant.price * 2;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-title"
    >
      <div
        className="absolute inset-0 bg-textPrimary/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-premium p-6 overflow-hidden animate-in zoom-in duration-300 border-[2px] border-curvePink"
      >
        <div className="absolute top-0 right-0 bg-curvePink text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-bl-xl">
          OFERTA DESBLOQUEADA
        </div>

        <button
          ref={initialFocusRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar oferta"
          className="absolute top-3 left-3 text-gray-400 hover:text-textPrimary transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-8 space-y-4">
          <h2 id="upsell-title" className="text-2xl font-black text-textPrimary leading-tight">
            El 80% de nuestras clientas prefieren el{' '}
            <span className="text-gradient">plan de 2 meses</span>
          </h2>
          <p className="text-sm text-gray-600">
            Un mes solo no alcanza para estabilizar tu metabolismo. Lleva el ciclo completo y
            ahorra <strong>${formatPrice(savings)}</strong> con entrega automática.
          </p>

          <div className="bg-background p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 mt-4 text-left">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Plan 2 meses · {subVariant.label}</span>
              <span className="text-curvePink text-lg">${formatPrice(subVariant.price)}/mes</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Compra única</span>
              <span className="line-through">${formatPrice(oneTime.price)}/mes</span>
            </div>

            <button
              type="button"
              onClick={upgradeToSub}
              className="mt-4 w-full bg-curve-gradient text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-premium-hover transform hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
            >
              Cambiar a plan 2 meses <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={declineUpsell}
            className="text-xs text-gray-500 hover:text-gray-900 underline mt-3 block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded"
          >
            No, gracias. Continuar con una unidad.
          </button>
        </div>
      </div>
    </div>
  );
}
