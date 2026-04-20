import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function ProtocolModal({ isOpen, onClose, protocol }) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !protocol) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-background w-full max-w-lg rounded-[32px] p-8 md:p-10 shadow-premium overflow-hidden animate-[fadeInUp_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600"/>
        </button>

        <span className="text-curvePink font-mono text-sm tracking-widest uppercase mb-4 block">
          Protocolo 0{protocol.id}
        </span>
        
        <h3 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] mb-2 leading-tight">
          {protocol.title}
        </h3>
        <h4 className="text-lg font-medium text-curvePurple mb-6">
          {protocol.subtitle}
        </h4>

        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed text-lg">
            {protocol.body}
          </p>
          
          <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-curvePink opacity-20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <p className="font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">💡</span> Tip Pro:
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {protocol.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
