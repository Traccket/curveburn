import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { CONSENT_KEY, CONSENT_GRANTED, CONSENT_DENIED } from '../lib/analytics';

/**
 * Banner de consentimiento para Pixel + GA4.
 * Ley 1581 de Colombia (Habeas Data) + GDPR.
 *
 * Flujo:
 *  1. Si el usuario ya aceptó → carga Pixel + GA4 inmediatamente.
 *  2. Si nunca ha decidido → muestra el banner después de 1.5s.
 *  3. Si rechaza → no carga nada y guarda preferencia.
 *
 * Cargar los scripts se hace dinámicamente para NO afectar LCP cuando
 * el usuario aún no ha consentido.
 */

function loadMetaPixel(pixelId) {
  if (!pixelId || pixelId === 'TU_PIXEL_ID') return;
  if (window.fbq) return; // ya cargado

  // Snippet oficial de Meta (versión compacta)
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

function loadGA4(ga4Id) {
  if (!ga4Id || ga4Id === 'G-TU_GA4_ID') return;
  if (window.gtag) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ga4Id, { anonymize_ip: true });
}

/**
 * Detecta si las IDs de tracking están aún con el valor placeholder.
 * En desarrollo loguea una advertencia destacada para que sea obvio
 * antes de hacer deploy. En producción permanece silencioso (nunca
 * logueamos valores reales).
 */
function warnIfPlaceholderIds() {
  // eslint-disable-next-line no-undef
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  if (!isDev) return;

  const pixel = window.__META_PIXEL_ID__;
  const ga4 = window.__GA4_ID__;
  const pixelIsPlaceholder = !pixel || pixel === 'TU_PIXEL_ID';
  const ga4IsPlaceholder = !ga4 || ga4 === 'G-TU_GA4_ID';

  if (pixelIsPlaceholder || ga4IsPlaceholder) {
    // Estilo vistoso para que el dev no lo ignore.
    const style = 'background:#a675a2;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700;';
    console.warn(
      '%c[CURVE]%c Tracking IDs sin configurar. ' +
        (pixelIsPlaceholder ? 'Meta Pixel ' : '') +
        (pixelIsPlaceholder && ga4IsPlaceholder ? 'y ' : '') +
        (ga4IsPlaceholder ? 'GA4 ' : '') +
        'se deshabilitaron. Edita window.__META_PIXEL_ID__ y window.__GA4_ID__ en index.html antes de deploy a producción.',
      style,
      '',
    );
  }
}

function loadTrackingScripts() {
  warnIfPlaceholderIds();
  loadMetaPixel(window.__META_PIXEL_ID__);
  loadGA4(window.__GA4_ID__);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let current = null;
    try {
      current = window.localStorage?.getItem(CONSENT_KEY);
    } catch {
      /* storage bloqueado */
    }

    if (current === CONSENT_GRANTED) {
      // Usuario ya aceptó en visitas anteriores → carga scripts
      loadTrackingScripts();
      return;
    }

    if (current === CONSENT_DENIED) {
      // Usuario rechazó → respetamos, no mostramos banner de nuevo
      return;
    }

    // Primera visita → mostrar banner con un pequeño delay
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    try {
      window.localStorage?.setItem(CONSENT_KEY, CONSENT_GRANTED);
    } catch {
      /* storage bloqueado */
    }
    loadTrackingScripts();
    setVisible(false);
  };

  const decline = () => {
    try {
      window.localStorage?.setItem(CONSENT_KEY, CONSENT_DENIED);
    } catch {
      /* storage bloqueado */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-[90] bg-white rounded-2xl shadow-premium border border-gray-100 p-5 animate-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-curvePink/10 flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5 text-curveAction" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-textPrimary mb-1">Usamos cookies</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Utilizamos cookies propias y de terceros (Meta, Google) para analizar el tráfico y
            personalizar tu experiencia. Al aceptar, nos ayudas a mostrarte mejor contenido.{' '}
            <a
              href="/privacidad.html"
              className="text-curveAction underline hover:no-underline"
            >
              Más información
            </a>
            .
          </p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={accept}
              className="bg-curveAction text-white text-xs font-bold px-4 py-2 rounded-full hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
            >
              Aceptar todo
            </button>
            <button
              type="button"
              onClick={decline}
              className="bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Rechazar
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={decline}
          aria-label="Cerrar aviso"
          className="text-gray-400 hover:text-textPrimary transition-colors shrink-0 p-1 -mt-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
