# Prompt para Antigravity — Finalizar deploy de CURVE

> Pega todo lo que está debajo de la línea en el chat de Antigravity con el repo `curve-landing` abierto.
> Está escrito para que el agente trabaje autónomo: pide lo que falta, ejecuta, verifica.

---

Eres un ingeniero senior full-stack con obsesión por la calidad. Estoy en el proyecto **CURVE landing** en `/Users/miguelnunez/Desktop/curve-landing`. Stack: React 18 + Vite 5 + Tailwind 3 + GSAP, headless Shopify (dominio `toplinenatural.myshopify.com`), deploy en Vercel (repo GitHub `Traccket/curveburn`, branch `main`).

Ya hay un branch local llamado `mejoras-profesionales` con un refactor grande (SEO, a11y WAI-ARIA, tracking gated por consent, security headers, páginas legales Colombia, cookie banner, checkout hardening, CSP Report-Only, etc.). Falta:

1. Rellenar los placeholders con valores reales.
2. Validar que el build compila y no hay imports rotos.
3. Commit + push del branch para que Vercel genere preview.
4. Reportar el Preview URL.

## PASO 1 — Pídeme estos valores antes de tocar nada

Hazme UNA sola pregunta con todos estos campos en formato clave=valor. Si para algún campo te digo "skip", déjalo como placeholder y añádelo a un TODO al final:

- `META_PIXEL_ID` (ej. `1234567890123456`, 15–16 dígitos)
- `GA4_ID` (ej. `G-XXXXXXXXXX`)
- `WHATSAPP_NUMBER` (solo dígitos, sin `+57`, ej. `3001234567`)
- `RAZON_SOCIAL` (ej. `Topline Natural S.A.S.`)
- `NIT` (ej. `901.234.567-8`)
- `DIRECCION_COMERCIAL` (ej. `Calle 10 #20-30, Medellín, Colombia`)
- `EMAIL_SOPORTE` (ej. `soporte@curve.com.co`)
- `REGISTRO_INVIMA` (ej. `NSOA2024-0000000` — si no tienes, "skip")
- `USUARIO_INSTAGRAM` (sin `@`, ej. `curve.colombia`)
- `QUIZ_DISCOUNT_CODE` (default `QUIZ5OFF` — confirma que existe en Shopify Admin → Discounts; si no, dime el código real o "skip")

No avances hasta tener mi respuesta.

## PASO 2 — Aplica los reemplazos con precisión quirúrgica

Usa búsqueda exacta (no regex amplia). Verifica cada archivo antes y después con `git diff`:

**`index.html`**
- Cambia `window.__META_PIXEL_ID__ = 'TU_PIXEL_ID'` → valor real.
- Cambia `window.__GA4_ID__ = 'G-TU_GA4_ID'` → valor real.

**`src/components/FAQSection.jsx`**
- Línea con `const WHATSAPP_NUMBER = '[WHATSAPP]';` → poner el número real.

**`src/components/Footer.jsx`**
- Reemplazar `[WHATSAPP]`, `[RAZÓN SOCIAL]`, `[NIT]`, `[EMAIL_SOPORTE]`, `[N° REGISTRO INVIMA]`, `[USUARIO_INSTAGRAM]` con sus valores.

**`public/privacidad.html`, `public/terminos.html`, `public/devoluciones.html`**
- Reemplazar `[RAZÓN SOCIAL]`, `[NIT]`, `[DIRECCIÓN]`, `[EMAIL_SOPORTE]`, `[WHATSAPP]`, `[N° REGISTRO INVIMA]` — todas las ocurrencias.

**`src/components/QuizModal.jsx`**
- Si `QUIZ_DISCOUNT_CODE` cambió respecto a `QUIZ5OFF`, actualízalo en la línea `const QUIZ_DISCOUNT_CODE = 'QUIZ5OFF';`.

Si un valor llega como "skip", deja el placeholder intacto y añádelo a un archivo nuevo `PENDIENTES.md` en la raíz del repo, con el archivo y número de línea donde falta.

## PASO 3 — Verificación local

Corre en orden (sin saltos):

```bash
cd /Users/miguelnunez/Desktop/curve-landing
git status                              # que estemos en mejoras-profesionales y sin basura
git branch --show-current               # confirmar branch
npm install                             # por si acaso
npm run lint                            # debe pasar limpio (si hay warnings, repórtamelos pero no los arregles aún)
npm run build                           # debe generar dist/ sin errores
```

Si `npm run build` falla, PÁRATE. No sigas. Pégame el error completo y espera instrucciones.

Si `npm run lint` reporta solo warnings (no errors) sigue.

Adicionalmente, haz una pasada manual de grep para confirmar que no quedaron placeholders colgados (esto es red-team contra ti mismo):

```bash
grep -RniE "\[(WHATSAPP|NIT|EMAIL_SOPORTE|DIRECCIÓN|RAZÓN SOCIAL|N° REGISTRO INVIMA|USUARIO_INSTAGRAM|PLACEHOLDER)\]" src/ public/ index.html || echo "OK: sin placeholders colgados"
grep -RniE "(TU_PIXEL_ID|G-TU_GA4_ID)" index.html || echo "OK: tracking IDs configurados"
```

Cualquier match aquí que yo no marqué como "skip" es un bug. Arréglalo y vuelve a correr.

## PASO 4 — Commit + push

```bash
git add -A
git diff --cached --stat               # muéstramelo
git commit -m "chore: completar placeholders de producción (tracking, WhatsApp, datos legales)"
git push -u origin mejoras-profesionales
```

Si el push falla por credenciales, párate y dime el error exacto.

## PASO 5 — Verifica Vercel

Después del push:

1. Abre `https://vercel.com/dashboard` en mi navegador (o si tienes el Vercel CLI, corre `vercel ls curve-landing` o equivalente).
2. Identifica el Preview URL del deployment asociado al commit que acabas de pushar (el último de la branch `mejoras-profesionales`).
3. Verifica con `curl -I <PREVIEW_URL>` que responde `200` y que los headers `Strict-Transport-Security`, `X-Content-Type-Options`, `Content-Security-Policy-Report-Only` están presentes.
4. Verifica `curl -I <PREVIEW_URL>/privacidad.html`, `/terminos.html`, `/devoluciones.html` — todos deben dar `200`.
5. Verifica `curl -sI <PREVIEW_URL>/robots.txt` y `/sitemap.xml` — ambos `200` con Content-Type razonable.

## PASO 6 — Reporte final

Dame un resumen corto en este formato (nada más, sin relleno):

```
✅ Placeholders reemplazados: N archivos, M ocurrencias
✅ Build: OK (dist/ size: X KB)
✅ Lint: OK (warnings: N)
✅ Push: origin/mejoras-profesionales @ <sha-corto>
✅ Preview URL: https://...
✅ Headers de seguridad: presentes
✅ Páginas legales: 200 OK
⚠️ Pendientes: (lista si algo quedó en PENDIENTES.md, si no escribe "ninguno")
```

## Reglas estrictas

- **No toques `main`.** Trabaja únicamente en `mejoras-profesionales`.
- **No añadas dependencias nuevas.** Si piensas que hace falta una, pregúntame primero.
- **No edites archivos fuera de la lista del Paso 2** salvo el `PENDIENTES.md`.
- **No hagas fuerza bruta con `git push --force`.** Nunca.
- Si cualquier comando devuelve error no esperado, PÁRATE y repórtalo. No "intentes arreglar" cambiando de estrategia sin permiso.
- Si detectas que algún placeholder tiene un valor que parece inválido (ej. WhatsApp con letras, Pixel ID con menos de 15 dígitos, GA4 que no empieza por `G-`), dímelo antes de escribirlo.

Empieza por el Paso 1.
