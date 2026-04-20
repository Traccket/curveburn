import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Si el mouse sale por la parte superior del navegador (intentando cambiar de tab o cerrar)
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-textPrimary/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-premium p-8 overflow-hidden animate-in zoom-in duration-300">
        <div className="absolute inset-x-0 top-0 h-2 bg-curve-gradient"></div>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-textPrimary transition-colors z-20">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 relative z-10">
          <div className="mx-auto w-16 h-16 bg-[#FFF2F8] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-curvePink animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-black text-textPrimary uppercase tracking-tight">¡Espera! ¿Te vas sin transformar tu cuerpo?</h2>
          <p className="text-gray-600">
            No pierdas la oportunidad de reactivar tu metabolismo con CURVE. Te regalamos <strong className="text-curvePurple">Envío Gratis Inmediato</strong> si tu compra es confirmada ahora.
          </p>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button 
              onClick={() => {
                setIsOpen(false);
                document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-curve-gradient text-white font-bold text-lg py-4 rounded-2xl shadow-premium-hover transition-all transform hover:scale-[1.02]"
            >
              Sí, quiero aprovechar la oferta
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              No, prefiero perder esta oportunidad final
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
