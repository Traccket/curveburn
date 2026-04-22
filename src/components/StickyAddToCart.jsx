import { useEffect, useState } from 'react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';
import { trackAddToCart } from '../lib/analytics';

export default function StickyAddToCart() {
  const [isVisible, setIsVisible] = useState(false);

  const variant = SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS;

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 400);
        raf = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onCheckout = () => {
    trackAddToCart({
      contentId: variant.id,
      value: variant.price,
      currency: 'COP',
      label: `sticky_${variant.label}`,
    });
    handleCheckout(variant.id, 1);
  };

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed bottom-0 left-0 w-full z-40 transition-transform duration-500 transform md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-curveAction text-white w-full flex items-center justify-between px-5 py-3 shadow-[0_-15px_30px_rgba(209,122,171,0.2)] gap-3">
        <div className="flex flex-col text-left min-w-0">
          <span className="font-display font-bold text-lg leading-none truncate">
            CURVE Premium
          </span>
          <span className="text-[10px] font-semibold opacity-90 mt-1 uppercase tracking-wider">
            60 cápsulas · Envío gratis
          </span>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="shrink-0 bg-white text-curveAction font-black text-xs py-2.5 px-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-curveAction"
          aria-label="Añadir al carrito desde barra móvil"
        >
          Comprar ahora <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
