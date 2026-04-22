import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { trackLead, trackCTA } from '../lib/analytics';

const DISMISS_KEY = 'curve_exit_dismissed';
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const shownRef = useRef(false);
  const closeBtnRef = useRef(null);

  // Helper: no mostrar si el usuario ya lo cerró en las últimas 24h
  const wasDismissedRecently = () => {
    try {
      const raw = window.localStorage?.getItem(DISMISS_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      return !Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS;
    } catch {
      return false;
    }
  };

  const markDismissed = () => {
    try {
      window.localStorage?.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage bloqueado en Safari privado — seguir igual */
    }
  };

  const show = (source) => {
    if (shownRef.current || wasDismissedRecently()) return;
    shownRef.current = true;
    setIsOpen(true);
    trackLead({ source: `exit_intent_${source}`, value: 0 });
  };

  useEffect(() => {
    // --- DESKTOP: mouseleave por la parte superior ---
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) show('desktop_mouse');
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // --- MOBILE: timeout + scroll rápido hacia arriba ---
    const isMobile =
      typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    let timeoutId;
    if (isMobile) {
      // Timer: 45 segundos en la página
      timeoutId = window.setTimeout(() => show('mobile_timer'), 45000);

      // Scroll hacia arriba rápido (señal de intención de salir)
      let lastY = window.scrollY;
      let lastT = Date.now();
      const onScroll = () => {
        const y = window.scrollY;
        const t = Date.now();
        const dy = lastY - y; // positivo = subiendo
        const dt = t - lastT;
        if (dy > 80 && dt < 200 && y < 400) {
          show('mobile_scroll_up');
        }
        lastY = y;
        lastT = t;
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('scroll', onScroll);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Bloquear scroll + ESC cuando abierto + focus trap mínimo
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtnRef.current?.focus(), 50);

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const close = () => {
    markDismissed();
    setIsOpen(false);
  };

  const acceptOffer = () => {
    trackCTA('exit_intent_accept');
    markDismissed();
    setIsOpen(false);
    document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-title"
    >
      <div
        className="absolute inset-0 bg-textPrimary/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-premium p-8 overflow-hidden animate-in zoom-in duration-300">
        <div
          className="absolute inset-x-0 top-0 h-2 bg-curve-gradient"
          aria-hidden="true"
        />

        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="Cerrar oferta"
          className="absolute top-4 right-4 text-gray-400 hover:text-textPrimary transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded-full p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 relative z-10">
          <div className="mx-auto w-16 h-16 bg-[#FFF2F8] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-curvePink animate-pulse" aria-hidden="true" />
          </div>

          <h2
            id="exit-title"
            className="text-3xl font-black text-textPrimary uppercase tracking-tight"
          >
            ¡Espera! ¿Te vas sin transformar tu cuerpo?
          </h2>
          <p className="text-gray-600">
            No pierdas la oportunidad de reactivar tu metabolismo con CURVE. Te regalamos{' '}
            <strong className="text-curvePurple">Envío Gratis Inmediato</strong> si confirmas tu
            compra ahora.
          </p>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={acceptOffer}
              className="w-full bg-curve-gradient text-white font-bold text-lg py-4 rounded-2xl shadow-premium-hover transition-all transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
            >
              Sí, quiero aprovechar la oferta
            </button>
            <button
              type="button"
              onClick={close}
              className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded px-2"
            >
              No, prefiero esperar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
