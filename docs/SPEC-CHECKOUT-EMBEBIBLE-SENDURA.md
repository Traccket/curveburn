# Especificación: "Sendura Checkout" — checkout embebible autoservicio para tiendas

**Versión 1.0 — Julio 2026**
**Para**: Edgar / equipo Sendura
**Contexto**: replicar como PRODUCTO lo que ya funciona en curveburn.app (contra
entrega + pago online Wompi + suscripciones con max_cycles), para que **cualquier
tienda cliente de Sendura lo active sola** desde su panel, sin programar.

---

## 1. Objetivo de producto

Una tienda cliente entra a su panel de Sendura → sección **"Checkout Online"** →
llena un formulario corto (métodos de pago, llaves de Wompi, dirección de
recogida) → recibe **un generador de enlaces de cobro** y **un snippet
embebible** para pegar en su página (propia, Shopify, Wix, WordPress,
link-in-bio, etc.). Sin registrar productos ni fotos.

Sus clientes compran ahí y los pedidos caen a Sendura con guía, exactamente como
hoy le pasa a CURVE. El dinero de Wompi llega **directo a la cuenta Wompi de cada
tienda** (Sendura orquesta, no toca la plata).

**Principio clave: SIN catálogo — Sendura no gestiona productos.**
La tienda NO registra productos, fotos ni descripciones en Sendura (nosotros
solo recogemos y entregamos paquetes). El **nombre y el precio viajan en el
enlace o en el botón que la propia tienda genera**: es un "enlace de cobro con
entrega incluida". Sirve para cualquier tipo de producto sin que Sendura sepa
ni le importe qué hay en el paquete (dentro de lo legal).

Dos modos de logística:

- **Recogida (pickup)** — el modo principal: el paquete está en el local de la
  tienda; al crear el pedido, la logística asigna primero la **recogida en la
  dirección de la tienda** y luego la entrega al cliente final.
- **Bodega (fulfillment)**: para tiendas que sí guardan inventario en Sendura
  (como CURVE) — el enlace/botón lleva además el SKU del inventario.

---

## 2. Arquitectura general

```
Página de la tienda (cualquier plataforma)
   │  botón "Comprar" →
   ▼
CHECKOUT HOSTEADO EN SENDURA          ←— configurado en el panel por la tienda
https://sendura.edgasanc.com/checkout/{public_token}
   │
   ├─ Contra entrega  → POST orden (financial_status: pending)
   ├─ Wompi online    → Web Checkout Wompi (llaves de la tienda) → verificación → orden paid
   └─ Suscripción     → tokenización tarjeta → POST subscription (max_cycles, etc.)
   ▼
Panel Sendura de la tienda: pedidos + guías + suscripciones (igual que hoy)
```

Dos modos de integración para el comercio (misma página por debajo):
- **Enlace directo**: `https://sendura.edgasanc.com/checkout/{public_token}?sku=XXX`
  — para botones, links de Instagram/WhatsApp, Shopify (botón con URL), etc.
- **Widget embebible**: snippet que abre el checkout en un modal (iframe) sobre
  la página del comercio:

```html
<script async src="https://sendura.edgasanc.com/widget.js"
        data-checkout="pubshop_a1b2c3..."></script>
<!-- el botón lleva nombre y precio — sin catálogo en Sendura -->
<button data-sendura-name="Camiseta negra talla M"
        data-sendura-price="45000">Comprar ahora</button>
```

---

## 3. Pieza clave de seguridad: token PÚBLICO por tienda

El token actual `snd_...` es **secreto** (da acceso total a la API). El checkout
corre en el navegador del cliente final, así que necesita un identificador que
se pueda exponer sin riesgo:

- Nueva credencial por tienda: **`public_checkout_token`** (`pubshop_` + 32 hex).
- Solo permite: leer la config pública del checkout y crear pedidos/suscripciones
  **cuyos precios y SKUs se resuelven SIEMPRE del lado del servidor** desde la
  configuración guardada de esa tienda (el navegador solo manda claves de
  producto y datos del cliente — nunca precios).
- Revocable/regenerable desde el panel.
- Rate limiting por token + por IP (es un endpoint público).

---

## 4. Modelo de datos nuevo

### `shop_checkout_settings` (1:1 con shops)

| Campo | Notas |
|---|---|
| `shop_id` | FK |
| `public_checkout_token` | único, indexado |
| `enabled` | bool |
| `brand_name`, `brand_logo_url`, `brand_color` | branding del checkout |
| `cod_enabled` | bool — pago contra entrega |
| `wompi_enabled` | bool — pago online |
| `wompi_public_key` | pública (se expone) |
| `wompi_integrity_secret` | **cifrado** (encrypt cast) |
| `wompi_private_key` | **cifrado** — para cobros de suscripción |
| `wompi_events_secret` | **cifrado** — validar webhook |
| `subscriptions_enabled` | bool |
| `fallback_url` | URL a la que enviar clientes FUERA de cobertura (ej. su Shopify). Nullable → mensaje "aún no llegamos a tu zona" |
| `success_message` | opcional para la pantalla final |
| `whatsapp` | número de soporte de la tienda (solo dígitos) — ver sección 11 |
| `default_fulfillment` | `warehouse` \| `pickup` — modo por defecto de los productos |
| `pickup_address_1`, `pickup_address_2` | dirección de recogida (requerida si usa pickup) |
| `pickup_city`, `pickup_province` | deben estar dentro de la cobertura de Sendura |
| `pickup_contact_name`, `pickup_contact_phone` | a quién contacta el mensajero al recoger |

### SIN tabla de productos — el ítem viaja en la petición

No hay catálogo en Sendura. El pedido llega con el ítem descrito por la tienda:

```json
"item": { "name": "Camiseta negra talla M", "price": 45000, "quantity": 1, "sku": null }
```

- `name` y `price` los define la tienda **en su enlace o botón** (ella los
  genera desde su panel — ver sección 7). `sku` solo aplica en modo bodega.
- **Guardas del servidor**: `price` entre un mínimo y máximo configurables
  (ej. $5.000 – $5.000.000), `quantity` 1–10, `name` 3–120 caracteres.
- **Nota de confianza**: en modo recogida, la tienda entrega el paquete y ve el
  monto del pedido en su panel ANTES de despachar — si un cliente malicioso
  alterara el precio del enlace, la tienda simplemente no entrega. El panel
  debe mostrar el monto de forma prominente en cada pedido.

**Pedidos `pickup`**: la orden queda marcada `requires_pickup = true` con la
dirección de recogida de la tienda — el módulo de asignación/ruta programa
**recogida → entrega** (o el flujo operativo que ya use Sendura). La validación
de SKU contra inventario se OMITE. En modo bodega (SKU presente) se valida
inventario como siempre.

### `shop_checkout_plans` (planes de suscripción — única config con precio fijo)

Los planes SÍ se configuran en el panel (sin fotos — solo nombre, precio y
frecuencia), porque los cobros recurrentes ocurren sin que la tienda intervenga
en cada ciclo: el precio debe ser autoritativo del servidor.

| Campo | Notas |
|---|---|
| `shop_id` + `plan_code` | |
| `item_name` | qué se entrega cada ciclo (texto, para la remisión) |
| `price_per_cycle` | COP — autoritativo |
| `interval_days` | default 30 |
| `max_cycles` | nullable = indefinido (ya implementado ✅) |
| `sku` | opcional — solo tiendas en modo bodega |
| `active` | bool |

> La cobertura de ciudades NO se configura por tienda: sale de la cobertura
> logística real de Sendura (la misma validación de provincia de siempre).

---

## 5. Endpoints públicos nuevos (auth: public_checkout_token)

### 5.1 `GET /api/v1/checkout/{public_token}/config`
Devuelve lo que el frontend necesita (cacheable 5 min): branding, métodos
habilitados, `wompi_public_key`, límites de ítem (precio min/max, qty max),
planes de suscripción activos, ciudades con cobertura (selector
departamento→ciudad) y `fallback_url`.

### 5.2 `POST /api/v1/checkout/{public_token}/orders`
Contra entrega. Body: `item { name, price, quantity, sku? }` + datos del
cliente + ciudad. El servidor valida las guardas del ítem (sección 4) y crea la
orden con la lógica existente (`financial_status: pending`, `requires_pickup`
según el modo de la tienda). Respuesta: orden + guía.

### 5.3 `POST /api/v1/checkout/{public_token}/wompi-session`
Pago online: mismas guardas del ítem; genera referencia + firma de integridad
(con el secreto de la tienda) y devuelve la URL del Web Checkout de Wompi.
Monto = `item.price × quantity` validado por el servidor.

### 5.4 `POST /api/v1/checkout/{public_token}/wompi-confirm`
Verifica la transacción contra la API de Wompi (referencia + monto) y crea la
orden como `paid`. (Mismo patrón que ya usamos en CURVE.)

### 5.5 `POST /api/v1/checkout/{public_token}/subscriptions`
Igual al endpoint de suscripciones actual, pero resolviendo plan/precio de
`shop_checkout_plans` y usando las llaves Wompi de la tienda.

> Reutilizar toda la lógica interna existente de orders/subscriptions — estos
> endpoints son "puertas públicas" con el precio resuelto en servidor.

---

## 6. Checkout hosteado + widget (frontend)

- **Página**: `GET /checkout/{public_token}?nombre=Camiseta+negra&precio=45000`
  (+ `&sku=` en modo bodega, o `?plan=CODIGO` para suscripción). El ítem viene
  en la URL — que la tienda genera desde su panel — no de un catálogo.
  Mobile-first, con el branding de la tienda. Flujo idéntico al validado en
  CURVE:
  1. Resumen del ítem (nombre + precio del enlace) + cantidad
  2. Departamento → ciudad (cobertura Sendura)
     - Con cobertura → formulario (contra entrega / pagar ahora / suscripción)
     - Sin cobertura → redirigir a `fallback_url` o mensaje amable
  3. Confirmación con pedido + guía (+ enlace de cancelación si es suscripción)
- **widget.js**: script liviano (~3 KB) que escucha clicks en
  `[data-sendura-sku]` / `[data-sendura-plan]` y abre la página hosteada en un
  iframe modal (con postMessage para cerrar/altura). El enlace directo es el
  fallback universal.

**Comportamiento clave del widget — "botón inteligente" (requisito de negocio):**
el widget se instala SOBRE el botón de compra que la tienda ya tiene (ej. el
"Add to cart"/"Comprar" de Shopify) y decide según la ubicación del cliente:

1. Click en el botón → el widget **intercepta** (`preventDefault`), toma el
   ítem de los atributos `data-sendura-name`/`data-sendura-price` del botón, y
   muestra la puerta de ubicación (departamento → ciudad) en el modal.
2. **Ciudad CON cobertura Sendura** → continúa en nuestro checkout (contra
   entrega / online / suscripción) y el pedido cae a Sendura.
3. **Ciudad SIN cobertura** → el widget cierra el modal y **deja que el botón
   original siga su curso normal**: re-dispara la acción interceptada (submit
   del form de "add to cart" de Shopify, o el `href` original del botón). El
   cliente paga por el checkout de siempre de la tienda (Shopify u otro) y ese
   pedido NO pasa por Sendura.
4. La ciudad elegida se recuerda (localStorage) para no volver a preguntar en
   la misma visita; con un enlace "cambiar ciudad" dentro del modal.

`fallback_url` pasa a ser un **override opcional** (para tiendas que prefieren
mandar fuera-de-cobertura a una URL específica). Si está vacío, el default del
widget es "continuar con el flujo original del botón". En el checkout hosteado
por enlace directo (sin widget, ej. link de Instagram) no hay "flujo original",
así que ahí aplica `fallback_url` o el mensaje amable.

**Modo auto-Shopify del widget** (integración sin tocar botones): si el script
lleva `data-shopify="auto"`, widget.js detecta los formularios de compra de
Shopify (`form[action*="/cart/add"]`) y toma **nombre y precio directamente de
la página del producto** (Shopify expone el producto y variante seleccionada en
`ShopifyAnalytics.meta` / el JSON del product form — sin catálogo en Sendura).
Si no logra leer el ítem con confianza, o no hay cobertura → el submit continúa
a Shopify normalmente. Así la instrucción para Shopify es UNA sola: pegar el
script en el tema.
- La tienda CURVE puede migrar a este widget cuando esté listo (retirando el
  código a medida de curve-landing) — o quedarse como está.

**Oferta**: el frontend del checkout (página + widget.js) lo puede construir la
tienda CURVE (ya tenemos todo el flujo hecho y probado en React) contra los
endpoints de la sección 5 — coordinar contrato y listo.

---

## 7. Panel autoservicio (sección "Checkout Online")

Wizard de 4 pasos + pantalla de estado:

1. **Métodos de pago**: toggles contra entrega / pago online / suscripciones.
   Si activa online o suscripciones → campos de llaves Wompi con instrucciones
   visuales de dónde sacarlas (Wompi → Desarrollo → Programadores) y el botón
   "copiar URL de eventos" (`https://sendura.edgasanc.com/api/webhooks/wompi`)
   con instrucción de pegarla en su panel de Wompi. **Validar las llaves al
   guardar** (llamada de prueba a Wompi) y mostrar ✔/✖.
2. **Logística**: "¿Dónde están tus productos?" — **En bodega Sendura**
   (modo inventario) o **En mi local, Sendura los recoge** (pide dirección de
   recogida + contacto, dentro de cobertura). SIN registro de productos:
   Sendura no gestiona catálogos — el ítem viaja en cada enlace/botón.
3. **Planes** (opcional): producto + precio/ciclo + cada cuántos días +
   ¿termina solo? (max_cycles) — con texto claro: "ej. 2 = plan de 2 meses".
4. **Personalización**: logo, color, URL de respaldo fuera de cobertura,
   WhatsApp de soporte.

**Pantalla final**: enlace hosteado + snippet para copiar + botón "Probar mi
checkout" + guía por plataforma (página propia / Shopify / Wix / link-in-bio).
Para Shopify: pegar el script del widget en el tema (Custom Liquid /
theme.liquid) y marcar el botón de compra existente con `data-sendura-sku` —
el botón queda "inteligente": zonas con cobertura van a Sendura y el resto
sigue al checkout normal de Shopify, sin duplicar botones ni romper nada.

Además, el panel incluye la herramienta **"Generar enlace de cobro"**: la
tienda escribe *qué es* y *cuánto cuesta* → obtiene al instante
`/checkout/{token}?nombre=...&precio=...` listo para pegar en chats de
WhatsApp, historias y bio de Instagram — el canal principal de muchas tiendas
(ver sección 11). Como un link de pago de Wompi, pero **con la entrega
incluida**.

---

## 11. WhatsApp — canal de venta, soporte y notificaciones

### 11.1 Vender por WhatsApp (Fase 1 — sale gratis con el enlace hosteado)

Muchas tiendas venden por chat sin página web. Su flujo con Sendura Checkout:
generan un **enlace de cobro** en el panel ("Generar enlace de cobro": qué es +
cuánto cuesta) y lo mandan por el chat → el cliente lo abre en su celular,
llena datos en 1 minuto y elige contra entrega o pago online → el pedido cae al
panel con guía, sin digitación manual. El checkout hosteado debe ser
**impecable en móvil** (este canal es ~100% celular) y tener metadatos Open
Graph (logo/nombre de la tienda + nombre y precio del ítem del enlace) para que
se vea bien como preview en WhatsApp e Instagram.

### 11.2 Botón de soporte en la confirmación (Fase 1 — campo `whatsapp`)

Si la tienda configuró su número, la pantalla de éxito muestra
"¿Dudas con tu pedido? Escríbenos" →
`https://wa.me/57{whatsapp}?text=Hola!%20Consulta%20sobre%20mi%20pedido%20{order_number}`
— el mensaje llega pre-escrito con el número de pedido (menos fricción de
soporte para la tienda, menos ansiedad para el cliente).

### 11.3 Notificaciones automáticas por WhatsApp (Fase 3 — diferencial killer)

Sendura escribe automáticamente al cliente final en los hitos del pedido:
"pedido confirmado 🎉 (guía X)", "tu paquete sale hoy", "tu mensajero está
cerca", y para suscripciones "mañana se realiza tu cobro/entrega mensual".
Requiere **WhatsApp Business API** (Meta) — número verificado, plantillas
aprobadas y costo por conversación — por eso es Fase 3. Diseño sugerido:
tabla `notification_templates` por evento, envío desde los mismos jobs que hoy
cambian estados de pedido, y toggle por tienda (con su propio remitente o el
número de Sendura como servicio). Es el argumento comercial más fuerte frente a
transportadoras tradicionales: "Sendura avisa solo a tus clientes".

---

## 8. Webhook multi-tienda

La URL global `https://sendura.edgasanc.com/api/webhooks/wompi` la configura
**cada tienda en SU cuenta de Wompi**. Para enrutar el evento a la tienda
correcta:

- Prefijar las referencias con el shop: `S{shop_id}-ORD-...` / `S{shop_id}-SUB-...`
- Al recibir el evento: parsear referencia → tienda → **validar el checksum con
  el events_secret de ESA tienda** (y rechazar 401 si no valida — pendiente
  también para el webhook actual).

---

## 9. Seguridad — checklist

- [ ] Ítems con guardas del servidor (precio min/max, qty max, name saneado); montos visibles y prominentes en el panel para que la tienda verifique antes de despachar
- [ ] Precios de SUSCRIPCIONES siempre del servidor (shop_checkout_plans) — los cobros recurrentes no pasan por la tienda
- [ ] Llaves privadas/secretos cifrados en BD, nunca en respuestas ni logs
- [ ] Rate limiting en endpoints públicos (por token y por IP)
- [ ] Webhook: checksum por tienda, 401 si no valida
- [ ] Referencias idempotentes por tienda (S{shop_id}-...)
- [ ] CORS: los endpoints públicos aceptan cualquier origen (el widget vive en
      dominios de los comercios) — la seguridad está en el diseño, no en CORS
- [ ] Panel: solo el dueño de la tienda ve/edita su config

---

## 10. Fases sugeridas

| Fase | Alcance | Resultado |
|---|---|---|
| **1** | Modelo de datos + endpoints públicos + checkout hosteado (enlace directo, móvil-primero, con OG preview) + panel básico + "Generar enlace de cobro" + WhatsApp de soporte en confirmación | Cualquier tienda cobra y entrega con un link (incluido WhatsApp/Instagram) — sin catálogos |
| **2** | widget.js embebible + branding + validador de llaves Wompi + guías por plataforma | Integración "pegar 2 líneas" |
| **3** | (Futuro) Notificaciones automáticas por WhatsApp Business API, app de Shopify oficial, carrito multi-producto, métricas de conversión, Nequi tokenizado en suscripciones | Escala y diferencial |

La fase 1 reutiliza casi todo lo que ya existe (orders, subscriptions,
max_cycles, webhook) — el trabajo nuevo grande es el panel de configuración y
los endpoints públicos con token pubshop_.
