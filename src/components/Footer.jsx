import { Instagram, MessageCircle, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { trackCTA } from '../lib/analytics';
import { COOKIE_SETTINGS_EVENT } from './CookieBanner';
import {
  BUSINESS,
  WHATSAPP_HREF,
  INSTAGRAM_HREF,
  EMAIL_IS_CONFIGURED,
} from '../config/business';

/**
 * Footer profesional con links legales obligatorios en Colombia
 * (Ley 1480 Estatuto del Consumidor + Ley 1581 Habeas Data).
 *
 * Los datos vienen de src/config/business.js (variables de entorno).
 * Los enlaces sin configurar se ocultan automáticamente para no
 * publicar links rotos (ej. wa.me/57[WHATSAPP]).
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-gray-200 mt-10"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Marca + descripción */}
        <div className="md:col-span-2">
          <img src="/logo.webp" alt="CURVE" width="200" height="200" loading="lazy" className="h-10 w-auto mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-md">
            CURVE es una fórmula termogénica premium desarrollada para mujeres que buscan
            transformar su metabolismo de forma inteligente, limpia y sin efecto rebote.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
              INVIMA: <strong className="ml-1 text-gray-700">{BUSINESS.invima}</strong>
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {INSTAGRAM_HREF && (
              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
                onClick={() => trackCTA('footer_instagram')}
                className="w-9 h-9 rounded-full bg-curvePink/10 text-curveAction flex items-center justify-center hover:bg-curvePink/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {WHATSAPP_HREF && (
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contáctanos por WhatsApp"
                onClick={() => trackCTA('footer_whatsapp')}
                className="w-9 h-9 rounded-full bg-curvePink/10 text-curveAction flex items-center justify-center hover:bg-curvePink/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {EMAIL_IS_CONFIGURED && (
              <a
                href={`mailto:${BUSINESS.supportEmail}`}
                aria-label="Envíanos un correo"
                onClick={() => trackCTA('footer_email')}
                className="w-9 h-9 rounded-full bg-curvePink/10 text-curveAction flex items-center justify-center hover:bg-curvePink/20 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase text-textPrimary mb-4">
            Producto
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="#comprar" className="hover:text-curveAction transition-colors">
                Comprar
              </a>
            </li>
            <li>
              <a href="#beneficios" className="hover:text-curveAction transition-colors">
                Beneficios
              </a>
            </li>
            <li>
              <a href="#blog" className="hover:text-curveAction transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-curveAction transition-colors">
                Preguntas frecuentes
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xs font-black tracking-widest uppercase text-textPrimary mb-4">
            Legal
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a
                href="/privacidad.html"
                className="hover:text-curveAction transition-colors"
                rel="nofollow"
              >
                Política de privacidad
              </a>
            </li>
            <li>
              <a
                href="/terminos.html"
                className="hover:text-curveAction transition-colors"
                rel="nofollow"
              >
                Términos y condiciones
              </a>
            </li>
            <li>
              <a
                href="/devoluciones.html"
                className="hover:text-curveAction transition-colors"
                rel="nofollow"
              >
                Política de devoluciones
              </a>
            </li>
            {EMAIL_IS_CONFIGURED && (
              <li>
                <a
                  href={`mailto:${BUSINESS.supportEmail}`}
                  className="hover:text-curveAction transition-colors"
                >
                  Contacto
                </a>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
                className="hover:text-curveAction transition-colors"
              >
                Preferencias de cookies
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © {year} <strong className="text-gray-700">{BUSINESS.legalName}</strong> · NIT{' '}
            {BUSINESS.nit} · Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" aria-hidden="true" /> Hecho con amor en Colombia
          </p>
        </div>
        <p className="max-w-7xl mx-auto mt-4 text-[11px] text-gray-400 leading-relaxed">
          Este producto es un suplemento dietario. No es un medicamento y no sustituye una
          alimentación balanceada. Los resultados pueden variar entre personas. Consulta a un
          profesional de la salud antes de iniciar cualquier régimen, especialmente si estás
          embarazada, lactando o tienes condiciones médicas preexistentes.
        </p>
      </div>
    </footer>
  );
}
