import { X } from 'lucide-react';
import { useModal } from '../hooks/useModal';

export default function ProtocolModal({ isOpen, onClose, protocol }) {
  const { containerRef, initialFocusRef } = useModal(isOpen && !!protocol, onClose);

  if (!isOpen || !protocol) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div
        ref={containerRef}
        className="relative bg-background w-full max-w-lg rounded-[32px] p-8 md:p-10 shadow-premium overflow-hidden animate-[fadeInUp_0.3s_ease-out]"
      >
        <button
          ref={initialFocusRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar protocolo"
          className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction"
        >
          <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        <span className="text-curvePink font-mono text-sm tracking-widest uppercase mb-4 block">
          Protocolo 0{protocol.id}
        </span>

        <h3
          id="protocol-title"
          className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] mb-2 leading-tight"
        >
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
