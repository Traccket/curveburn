import { useState, useEffect } from 'react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';

export default function StickyAddToCart() {
  const [isVisible, setIsVisible] = useState(false);

  // We assume the Sticky CTA promotes the best seller / 2-month plan
  const ctaVariantId = SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS.id;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 400); // Aparece más rapido
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onCheckout = () => {
    handleCheckout(ctaVariantId, 1);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-500 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="bg-curveAction text-white w-full flex items-center justify-between px-6 py-4 shadow-[0_-15px_30px_rgba(209,122,171,0.2)]">
        
        {/* Left Side: Product Info */}
        <div className="flex flex-col text-left">
          <span className="font-display font-bold text-xl md:text-2xl leading-none">Quemador PREMIUM</span>
          <span className="text-xs md:text-sm font-semibold opacity-90 mt-1">x 60 CÁPSULAS</span>
        </div>

        {/* Right Side: CTA Action */}
        <div className="flex flex-col items-end">
          <button 
            onClick={onCheckout}
            className="bg-white text-curveAction font-black text-xs md:text-sm py-2 px-4 md:py-3 md:px-6 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            + ENVÍO GRATIS <span>→</span>
          </button>
          <span className="text-[10px] opacity-80 mt-1 uppercase tracking-wider font-semibold">
            Válido por tiempo limitado
          </span>
        </div>

      </div>
    </div>
  );
}
