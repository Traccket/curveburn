/**
 * Datos de negocio centralizados.
 *
 * Todos los valores se leen de variables de entorno de Vite (prefijo VITE_)
 * con fallback a placeholders. Configura los valores reales en .env.local
 * (desarrollo) o en Vercel → Settings → Environment Variables (producción).
 * Ver .env.example para la lista completa.
 *
 * Los componentes detectan automáticamente los placeholders y ocultan o
 * deshabilitan los enlaces correspondientes para no publicar links rotos.
 */
const env = import.meta.env;

export const BUSINESS = {
  legalName: env.VITE_LEGAL_NAME || '[RAZÓN SOCIAL]',
  nit: env.VITE_NIT || '[NIT]',
  invima: env.VITE_INVIMA || '[N° REGISTRO INVIMA]',
  supportEmail: env.VITE_SUPPORT_EMAIL || '',
  // Solo dígitos, sin +57 (se antepone automáticamente en el href)
  whatsapp: env.VITE_WHATSAPP_NUMBER || '',
  instagramUser: env.VITE_INSTAGRAM_USER || '',
};

export const WHATSAPP_IS_CONFIGURED = /^\d{8,15}$/.test(BUSINESS.whatsapp);
export const WHATSAPP_HREF = WHATSAPP_IS_CONFIGURED
  ? `https://wa.me/57${BUSINESS.whatsapp}`
  : undefined;

export const INSTAGRAM_IS_CONFIGURED = /^[A-Za-z0-9._]{1,30}$/.test(BUSINESS.instagramUser);
export const INSTAGRAM_HREF = INSTAGRAM_IS_CONFIGURED
  ? `https://instagram.com/${BUSINESS.instagramUser}`
  : undefined;

export const EMAIL_IS_CONFIGURED = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(BUSINESS.supportEmail);

// Código de descuento del quiz. Debe existir en Shopify Admin → Discounts.
export const QUIZ_DISCOUNT_CODE = env.VITE_QUIZ_DISCOUNT_CODE || 'QUIZ5OFF';
