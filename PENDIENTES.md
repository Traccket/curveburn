# Pendientes antes del lanzamiento

Los datos de negocio ahora se configuran con **variables de entorno** (ver
`.env.example`). En desarrollo copia `.env.example` a `.env.local`; en
producción configúralas en **Vercel → Settings → Environment Variables**.
Mientras falten, la landing deshabilita u oculta automáticamente los enlaces
y el tracking afectados (no publica links rotos).

## 1. Variables de entorno (un solo lugar)

| Variable | Qué es | Dónde conseguirla |
|---|---|---|
| `VITE_META_PIXEL_ID` | Meta Pixel (~16 dígitos) | Meta Events Manager |
| `VITE_GA4_ID` | GA4 (`G-XXXXXXXXXX`) | Google Analytics → Admin → Data Streams |
| `VITE_LEGAL_NAME` | Razón social | Cámara de Comercio |
| `VITE_NIT` | NIT | RUT |
| `VITE_INVIMA` | N° registro sanitario | INVIMA |
| `VITE_SUPPORT_EMAIL` | Email de soporte | — |
| `VITE_WHATSAPP_NUMBER` | Solo dígitos, sin +57 | — |
| `VITE_INSTAGRAM_USER` | Usuario sin @ | — |
| `VITE_QUIZ_DISCOUNT_CODE` | Default `QUIZ5OFF` | Crear en Shopify Admin → Discounts |

## 2. Páginas legales (editar HTML a mano)

`public/privacidad.html`, `public/terminos.html` y `public/devoluciones.html`
son HTML estático y **no** leen variables de entorno. Reemplazar ahí:
`[FECHA DD/MM/AAAA]`, `[RAZÓN SOCIAL]`, `[NIT]`, `[DIRECCIÓN]`,
`[EMAIL_SOPORTE]`, `[WHATSAPP]`, `[N° REGISTRO INVIMA]`.
Son requisito legal (Ley 1581 Habeas Data + Ley 1480 Estatuto del Consumidor).

## 2.5 Checkout contra-entrega (Sendura)

Variables del **servidor** en Vercel (sin prefijo `VITE_`, marcar Production
y Preview):

| Variable | Qué es |
|---|---|
| `SENDURA_API_TOKEN` | Token de la tienda (panel Sendura → Tiendas/Shops). Token regenerado y validado OK el 2026-07-06. |
| `SENDURA_SKU` | `134765` (confirmar que está activo en Inventarios de Sendura) |
| `SENDURA_SKU_PLAN` | (Opcional) SKU del plan 2 meses si es distinto |

Mientras falten, el checkout local muestra error con botón de respaldo
"pagar online" (Shopify), así no se pierde ninguna venta.

## 3. Verificaciones en Shopify Admin

- El código `QUIZ5OFF` (o el valor de `VITE_QUIZ_DISCOUNT_CODE`) debe existir
  en Discounts, o el checkout del quiz llegará sin descuento.
- El selling plan `5465538801` ("Plan 2 meses CURVE") debe seguir activo antes
  de poner `SUBSCRIPTIONS_ENABLED: true` en `src/lib/shopify.js`.

## 4. Al validar la CSP en producción

`vercel.json` tiene la CSP en modo `Content-Security-Policy-Report-Only`.
Después de configurar los pixel IDs reales y verificar en la consola del
navegador que no hay violaciones, renombrar el header a
`Content-Security-Policy` para que bloquee de verdad.
