# Especificación: "Sendura Checkout" — checkout embebible autoservicio para tiendas

**Versión 1.0 — Julio 2026**
**Para**: Edgar / equipo Sendura
**Contexto**: replicar como PRODUCTO lo que ya funciona en curveburn.app (contra
entrega + pago online Wompi + suscripciones con max_cycles), para que **cualquier
tienda cliente de Sendura lo active sola** desde su panel, sin programar.

---

## 1. Objetivo de producto

Una tienda cliente entra a su panel de Sendura → sección **"Checkout Online"** →
llena un formulario (productos, precios, métodos de pago, llaves de Wompi) →
recibe **un enlace de checkout hosteado** y **un snippet embebible** para pegar
en su página (propia, Shopify, Wix, WordPress, link-in-bio, etc.).

Sus clientes compran ahí y los pedidos caen a Sendura con guía, exactamente como
hoy le pasa a CURVE. El dinero de Wompi llega **directo a la cuenta Wompi de cada
tienda** (Sendura orquesta, no toca la plata).

**Alcance de producto: CUALQUIER tipo de producto y dos modos de logística.**
El checkout no está atado a un catálogo específico — cada tienda define sus
propios productos (ropa, comida, tecnología, lo que sea, con foto, precio y
cantidad). Y soporta los dos modos de operación de Sendura:

- **Bodega (fulfillment)**: el producto está en inventario de Sendura (SKU
  existente) — flujo actual de CURVE.
- **Recogida (pickup)**: el producto está en el local de la tienda; al crear el
  pedido, la logística asigna primero la **recogida en la dirección de la
  tienda** y luego la entrega al cliente final. Para estos productos el SKU de
  inventario Sendura no aplica (se usa una referencia propia de la tienda).

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
<!-- cualquier elemento con data-sendura-sku abre el checkout -->
<button data-sendura-sku="134765">Comprar ahora</button>
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
| `success_message`, `whatsapp` | opcionales para la pantalla final |
| `default_fulfillment` | `warehouse` \| `pickup` — modo por defecto de los productos |
| `pickup_address_1`, `pickup_address_2` | dirección de recogida (requerida si usa pickup) |
| `pickup_city`, `pickup_province` | deben estar dentro de la cobertura de Sendura |
| `pickup_contact_name`, `pickup_contact_phone` | a quién contacta el mensajero al recoger |

### `shop_checkout_products` (productos vendibles en el checkout — cualquier rubro)

| Campo | Notas |
|---|---|
| `shop_id` + `key` | `key` corta para el widget (ej. `camiseta-negra-m`) |
| `fulfillment` | `warehouse` \| `pickup` \| null (hereda `default_fulfillment`) |
| `sku` | **warehouse**: debe existir en inventario Sendura. **pickup**: referencia libre de la tienda (o autogenerada `PKP-{shop}-{key}`) |
| `name`, `image_url`, `description` | libres — sirve para cualquier tipo de producto |
| `price` | COP — **autoritativo** |
| `compare_at_price` | opcional (precio tachado) |
| `max_qty` | default 5 |
| `active` | bool |

**Pedidos de productos `pickup`**: al crearse, la orden queda marcada
`requires_pickup = true` y lleva la dirección de recogida de la tienda — el
módulo de asignación/optimización de ruta debe programar **recogida → entrega**
(o el flujo operativo que ya use Sendura para recogidas). La validación de SKU
contra inventario se OMITE para estos ítems.

### `shop_checkout_plans` (planes de suscripción)

| Campo | Notas |
|---|---|
| `shop_id` + `plan_code` | |
| `product_id` | FK a shop_checkout_products |
| `price_per_cycle` | COP |
| `interval_days` | default 30 |
| `max_cycles` | nullable = indefinido (ya implementado ✅) |
| `active` | bool |

> La cobertura de ciudades NO se configura por tienda: sale de la cobertura
> logística real de Sendura (la misma validación de provincia de siempre).

---

## 5. Endpoints públicos nuevos (auth: public_checkout_token)

### 5.1 `GET /api/v1/checkout/{public_token}/config`
Devuelve todo lo que el frontend del checkout necesita (cacheable 5 min):
branding, métodos habilitados, `wompi_public_key`, productos activos (key,
nombre, imagen, precio, max_qty), planes (código, precio, interval, max_cycles),
ciudades con cobertura (para el selector departamento→ciudad), `fallback_url`.

### 5.2 `POST /api/v1/checkout/{public_token}/orders`
Contra entrega. Body: `product_key`, `quantity`, datos del cliente + ciudad.
El servidor resuelve SKU/precio desde `shop_checkout_products` y crea la orden
con la lógica existente (`financial_status: pending`). Respuesta: orden + guía.

### 5.3 `POST /api/v1/checkout/{public_token}/wompi-session`
Pago online: genera referencia + firma de integridad (con el secreto de la
tienda) y devuelve la URL del Web Checkout de Wompi. Monto = precio del
servidor × qty.

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

- **Página**: `GET /checkout/{public_token}` (+ `?sku=` para preseleccionar y
  `?plan=` para abrir en modo suscripción). Mobile-first, con el branding de la
  tienda. Flujo idéntico al validado en CURVE:
  0. Sin `?sku`: **catálogo** — grilla con todos los productos activos de la
     tienda (foto, nombre, precio) para elegir. Con `?sku`: va directo al paso 1.
  1. Producto/plan + cantidad
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

1. Click en el botón → el widget **intercepta** (`preventDefault`) y muestra la
   puerta de ubicación (departamento → ciudad) en el modal.
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
Shopify (`form[action*="/cart/add"]`), intercepta el submit y lee el variant
seleccionado. Para mapear el producto, `shop_checkout_products` gana el campo
opcional `shopify_variant_id` (o se empareja por SKU si la tienda usa el mismo
SKU en ambos lados). Producto no mapeado o sin cobertura → el submit continúa
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
2. **Logística y productos**: primero "¿Dónde están tus productos?" —
   **En bodega Sendura** (elige SKUs de su inventario) o **En mi local, Sendura
   los recoge** (pide dirección de recogida + contacto, dentro de cobertura).
   Luego agrega productos: nombre, foto, precio, cantidad máx. — cualquier tipo
   de producto; se puede mezclar bodega y recogida por producto.
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

- [ ] Precios y SKUs SIEMPRE del servidor (nunca del navegador)
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
| **1** | Modelo de datos + endpoints públicos + checkout hosteado (enlace directo) + panel básico | Cualquier tienda vende con un link |
| **2** | widget.js embebible + branding + validador de llaves Wompi + guías por plataforma | Integración "pegar 2 líneas" |
| **3** | (Futuro) App de Shopify oficial, carrito multi-producto en un solo pedido, métricas de conversión del checkout, Nequi tokenizado en suscripciones | Escala |

La fase 1 reutiliza casi todo lo que ya existe (orders, subscriptions,
max_cycles, webhook) — el trabajo nuevo grande es el panel de configuración y
los endpoints públicos con token pubshop_.
