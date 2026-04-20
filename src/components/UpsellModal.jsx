import { X, ArrowRight } from 'lucide-react';
import { handleCheckout, SHOPIFY_CONFIG } from '../lib/shopify';

export default function UpsellModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-textPrimary/50 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-premium p-6 overflow-hidden animate-in zoom-in duration-300 border-[2px] border-curvePink">
        
        {/* Badge */}
        <div className="absolute top-0 right-0 bg-curvePink text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-bl-xl">
          OFERTA DESBLOQUEADA
        </div>

        <button onClick={onClose} className="absolute top-3 left-3 text-gray-400 hover:text-textPrimary transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-8 space-y-4">
          <h2 className="text-2xl font-black text-textPrimary leading-tight">
            El 80% de nuestras clientas prefieren el <span className="text-gradient">Duo Pack</span>
          </h2>
          <p className="text-sm text-gray-600">
            Un mes no siempre te alcanza para ver todo el potencial. Llévate el tratamiento completo y asegura resultados definitivos hoy.
          </p>
          
          <div className="bg-background p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 mt-4 text-left">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Duo Pack (2 Meses)</span>
              <span className="text-curvePink text-lg">$180.000 COP</span>
            </div>
            <div className="flex justify-between items-center text-xs text-green-600 line-through">
              <span>Precio Normal</span>
              <span>$220.000 COP</span>
            </div>
            
            <button 
              onClick={() => handleCheckout(SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS.id, 1)}
              className="mt-4 w-full bg-curve-gradient text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-premium-hover transform hover:scale-[1.02] transition-all"
            >
              Mejorar a Duo Pack <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => handleCheckout(SHOPIFY_CONFIG.VARIANTS.ONE_TIME.id, 1)}
            className="text-xs text-gray-500 hover:text-gray-900 underline mt-3 block w-full"
          >
            No, gracias. Continuar solo con 1 unidad.
          </button>
        </div>
      </div>
    </div>
  );
}
