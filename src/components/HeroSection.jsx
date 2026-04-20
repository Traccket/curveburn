import { useState } from 'react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';
import { ShieldCheck, CheckCircle2, ShoppingCart } from 'lucide-react';
import UpsellModal from './UpsellModal';

export default function HeroSection() {
  // We no longer necessarily need UpsellModal if they buy standard, but keeping it per architecture
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  
  const [isSubscription, setIsSubscription] = useState(true);

  // Real values calculated from Shopify Config
  const formatPrice = (amount) => amount.toLocaleString('es-CO').replace(/,/g, '.');
  const selectedVariant = isSubscription ? SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS : SHOPIFY_CONFIG.VARIANTS.ONE_TIME;
  
  const priceOneTime = formatPrice(SHOPIFY_CONFIG.VARIANTS.ONE_TIME.price); // "110.000"
  const priceSub = formatPrice(SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS.price); // "89.000"
  const displayedPrice = formatPrice(selectedVariant.price);

  const handleAddToCart = () => {
    // We pass the exact selected configuration variant to the Shopify checkout dynamically!
    handleCheckout(selectedVariant.id, 1);
  };

  return (
    <>
      <section id="comprar" className="relative z-10 pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Logo / Visual Area */}
        <div className="w-full md:w-1/2 flex justify-center items-center order-1 relative min-h-[400px]">
          {/* Intense Glow Background integrated naturally */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-curvePink/20 via-curvePurple/10 to-transparent blur-[100px] rounded-full mix-blend-multiply pointer-events-none z-0"></div>
          
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
             
             {/* Static Product Image with Soft Curved Edges */}
             <div className="relative w-[80%] md:w-[90%] max-w-[450px] transition-transform duration-500 hover:scale-[1.02] rounded-[3rem] overflow-hidden shadow-[0_30px_50px_rgba(166,117,162,0.15)] ring-1 ring-black/5 bg-white">
                <img 
                  src="/producto.png" 
                  alt="CURVE Producto Oficial" 
                  className="w-full h-auto object-cover" 
                />
             </div>

          </div>
        </div>

        {/* Texts & Main Call to Action (The Checkout Panel) */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left order-2">
          
          <h1 className="text-4xl lg:text-[3.2rem] leading-[1.1] font-black tracking-tight text-textPrimary mb-4">
            Reescribe tu <span className="text-gradient drop-shadow-sm">Metabolismo.</span>
          </h1>
          
          <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
            Convierte tu tejido adiposo en energía pura. Resultados comprobados en miles de chicas. 100% Sin Efecto Rebote.
          </p>

          {/* CHECKOUT WIDGET CONTAINER */}
          <div className="w-full max-w-lg space-y-4">
            
            {/* Note: Quantity tabs removed by request. Fixed at 1 unit. */}

            {/* Radio 1: Compra Única */}
            <div 
              onClick={() => setIsSubscription(false)}
              className={`cursor-pointer rounded-2xl border-2 transition-all p-4 ${!isSubscription ? 'border-curveAction bg-[#fff4f8]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isSubscription ? 'border-curveAction' : 'border-gray-300'}`}>
                    {!isSubscription && <div className="w-2.5 h-2.5 bg-curveAction rounded-full"></div>}
                  </div>
                  <span className="font-bold text-gray-800">Compra Única</span>
                </div>
                <span className="font-black text-lg">${priceOneTime}</span>
              </div>
              <p className="text-xs text-gray-400 pl-8">Sin Beneficios</p>
            </div>

            {/* Radio 2: Suscripción */}
            <div 
              onClick={() => setIsSubscription(true)}
              className={`cursor-pointer rounded-2xl border-2 transition-all p-4 ${isSubscription ? 'border-curveAction bg-[#fff4f8]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSubscription ? 'border-curveAction' : 'border-gray-300'}`}>
                    {isSubscription && <div className="w-2.5 h-2.5 bg-curveAction rounded-full"></div>}
                  </div>
                  <span className="font-bold text-gray-800">Suscripción (Plan 2 Meses)</span>
                </div>
                <span className="font-black text-lg text-curveAction">${priceSub}</span>
              </div>
              
              <div className="pl-8 space-y-2 opacity-90 transition-all">
                <p className="text-xs text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-curveAction" /> Envío gratis incluido</p>
                <p className="text-xs text-gray-600 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-curveAction" /> Ciclo completo de 2 meses asegurado</p>
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-curveAction mt-0.5 shrink-0" /> 
                  <span><strong>Entrega Automática:</strong> El cobro de tu segunda unidad se realiza 5 días antes para asegurar que te llegue a tiempo sin romper tu rutina.</span>
                </p>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              className="w-full bg-curveAction text-white font-black py-4 rounded-full shadow-premium hover:brightness-110 active:scale-[0.98] transition-all text-lg flex justify-center items-center gap-3 mt-4"
            >
              Añadir al carrito <span className="bg-white/20 px-3 py-1 rounded-full text-sm tracking-wide">${displayedPrice}</span> <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Trust Badges Minimal */}
            <div className="flex items-center justify-center gap-4 mt-6 opacity-70 text-xs text-gray-600 pt-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Pago Contra Entrega</span>
              •
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> 100% Seguro</span>
            </div>

          </div>
        </div>

      </section>

      {/* Renders Upsell Modal if state is true */}
      <UpsellModal isOpen={isUpsellOpen} onClose={() => setIsUpsellOpen(false)} />
    </>
  );
}
