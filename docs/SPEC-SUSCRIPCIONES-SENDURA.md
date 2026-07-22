# Especificación técnica: Módulo de suscripciones en Sendura (cobros recurrentes con Wompi)

**Versión 1.0 — Julio 2026**
**Para**: equipo de desarrollo de Sendura (sendura.edgasanc.com)
**De**: tienda CURVE (curveburn.app)

---

## 1. Objetivo

Permitir que una tienda venda **planes de suscripción** (ej. "1 frasco cada 30 días"):
el cliente autoriza su medio de pago **una sola vez** en la landing de la tienda, y
Sendura se encarga de **cobrar automáticamente cada ciclo** vía Wompi y **crear el
pedido logístico** (que ya sabe hacer) en cada cobro exitoso.

Sendura ya tiene: base de datos, autenticación por token de tienda, creación de
pedidos con guía, y panel. Lo nuevo es: almacenar suscripciones, un cron de cobros,
y la integración con la API de Wompi usando la **llave privada** del comercio.

**Principio de seguridad**: Sendura **nunca** ve ni guarda números de tarjeta.
Solo guarda el `payment_source_id` (token) que emite Wompi. Eso mantiene el
cumplimiento PCI en el lado de Wompi.

---

## 2. Arquitectura general

```
LANDING (curveburn.app)                SENDURA (backend + BD + cron)              WOMPI
─────────────────────                  ─────────────────────────────              ─────
1. Cliente elige plan
2. Tokeniza tarjeta/Nequi  ──────────────────────────────────────────────►  POST /v1/tokens/cards
   (llave PÚBLICA, en el navegador)                                         (o /v1/tokens/nequi)
3. POST /api/v1/subscriptions  ──────►  4. Crea payment_source  ──────────►  POST /v1/payment_sources
   (token de tienda snd_...)               (llave PRIVADA, servidor)
                                        5. Primer cobro  ─────────────────►  POST /v1/transactions
                                        6. Si APPROVED:
                                           - crea pedido/guía (lógica actual)
                                           - guarda suscripción
                                             next_charge_at = hoy + 30d
                                        7. Responde a la landing

   CRON DIARIO (Sendura):
   - busca suscripciones con next_charge_at <= hoy y status=active
   - cobra con payment_source_id  ────────────────────────────────────────►  POST /v1/transactions
   - APPROVED → crea pedido + avanza next_charge_at
   - DECLINED → política de reintentos (sección 7)
```

---

## 3. Modelo de datos (sugerido)

### Tabla `subscriptions`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | PK | |
| `shop_id` | FK | La tienda dueña (mismo esquema multi-tienda de orders) |
| `status` | enum | `active` \| `past_due` \| `cancelled` \| `paused` |
| `plan_code` | string | Ej. `CURVE-MENSUAL`. Definido por la tienda |
| `sku` | string | SKU a despachar en cada ciclo (debe existir en inventario) |
| `product_name` | string | Para la remisión |
| `quantity` | int | Unidades por ciclo |
| `unit_price` | int | COP por unidad, **fijado al crear la suscripción** |
| `interval_days` | int | Default 30 |
| `next_charge_at` | date | Próximo cobro que el cron debe ejecutar |
| `retry_count` | int | Reintentos del ciclo actual (reset a 0 tras cobro exitoso) |
| `customer_name` | string | |
| `customer_phone` | string | |
| `customer_email` | string | Requerido por Wompi para payment sources |
| `shipping_address_1` | string | |
| `shipping_address_2` | string | nullable |
| `shipping_city` | string | |
| `shipping_province` | string | Validar cobertura igual que orders |
| `wompi_payment_source_id` | string | **Único dato de pago que se guarda** |
| `wompi_payment_method_type` | string | `CARD` \| `NEQUI` (informativo) |
| `cancel_token` | string | Aleatorio (32+ chars), para el enlace público de cancelación |
| `cancelled_at` / `cancel_reason` | | nullable |
| `created_at` / `updated_at` | | |

### Tabla `subscription_charges` (historial de cobros)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | PK | |
| `subscription_id` | FK | |
| `reference` | string, **única** | Formato idempotente: `SUB-{subscription_id}-{YYYYMM}-{attempt}` |
| `wompi_transaction_id` | string | nullable hasta tener respuesta |
| `amount_in_cents` | int | |
| `status` | enum | `pending` \| `approved` \| `declined` \| `error` |
| `attempt_number` | int | 1..N dentro del ciclo |
| `order_id` | FK nullable | El pedido creado si el cobro aprobó |
| `error_message` | text nullable | |
| `created_at` | | |

> La **referencia única e idempotente** es la protección contra dobles cobros:
> antes de cobrar, verificar que no exista ya un charge `approved` para ese
> `subscription_id` + período.

---

## 4. Endpoints nuevos en la API de Sendura

Misma autenticación existente (`Authorization: Bearer snd_...` o `X-Shop-Token`).

### 4.1 `POST /api/v1/subscriptions` — crear suscripción + primer cobro

Body que enviará la landing:

```json
{
  "plan_code": "CURVE-MENSUAL",
  "sku": "134765",
  "product_name": "CURVE Quemador Premium (60 cápsulas)",
  "quantity": 1,
  "unit_price": 99000,
  "interval_days": 30,
  "customer_name": "María Pérez",
  "customer_phone": "3001234567",
  "customer_email": "maria@example.com",
  "shipping_address_1": "Calle 100 # 15-20",
  "shipping_address_2": "Apto 301",
  "shipping_city": "Bogotá",
  "shipping_province": "Bogotá, D.C.",
  "shipping_country": "Colombia",
  "wompi": {
    "card_token": "tok_prod_xxx",
    "acceptance_token": "eyJhbGciOi..."
  }
}
```

Proceso del servidor:

1. Validar campos + cobertura de provincia + SKU (igual que orders).
2. **Crear payment source en Wompi** (llave privada):
   `POST https://production.wompi.co/v1/payment_sources`
   con `{ type: "CARD", token, customer_email, acceptance_token }`.
   Guardar el `id` devuelto → `wompi_payment_source_id`.
3. **Primer cobro**: `POST /v1/transactions` con
   `{ amount_in_cents, currency: "COP", customer_email, reference: "SUB-{id}-{YYYYMM}-1", payment_source_id, payment_method: { installments: 1 }, signature }`.
   (La firma de integridad también aplica a transacciones por API — ver docs.)
4. Esperar resolución (polling corto al `GET /v1/transactions/{id}` o webhook).
5. Si **APPROVED**: crear el pedido con la lógica existente
   (`financial_status: paid`, nota `"🔁 Suscripción {plan_code} · cobro 1 · Wompi {tx_id}"`),
   guardar suscripción con `next_charge_at = hoy + interval_days`, responder:

```json
{
  "status": "success",
  "subscription_id": 42,
  "first_order_number": "#ORD-9001",
  "first_guia_number": "830123456789",
  "next_charge_at": "2026-08-13",
  "cancel_url": "https://sendura.edgasanc.com/s/cancel/{cancel_token}"
}
```

6. Si **DECLINED/ERROR**: **no** guardar la suscripción como activa; responder 422
   con mensaje claro (la landing le permite reintentar con otro medio de pago).

### 4.2 `POST /api/v1/subscriptions/{id}/cancel` — cancelar (token de tienda)

Marca `status = cancelled`, `cancelled_at = now`. No borra el historial.

### 4.3 `GET|POST /s/cancel/{cancel_token}` — autocancelación del cliente

Página pública simple: muestra el plan y un botón "Cancelar mi suscripción".
Requisito del Estatuto del Consumidor: cancelar debe ser tan fácil como suscribirse.

### 4.4 `GET /api/v1/subscriptions/{id}` — estado (para soporte)

### 4.5 (Recomendado) `POST /webhooks/wompi` — eventos de Wompi

Recibe `transaction.updated`. **Verificar el checksum** con el "secreto de
eventos" de Wompi (SHA-256 de las propiedades firmadas — ver
docs.wompi.co → Eventos). Útil para resolver transacciones `PENDING` sin polling.

---

## 5. Cron de cobros (diario, ej. 6:00 AM)

Pseudocódigo:

```
subs = SELECT * FROM subscriptions
       WHERE status = 'active' AND next_charge_at <= today()

para cada sub:
    periodo = formato(today(), 'YYYYMM')
    si existe charge approved para (sub.id, periodo): continuar  # idempotencia

    attempt = sub.retry_count + 1
    reference = "SUB-{sub.id}-{periodo}-{attempt}"
    crear subscription_charge(status=pending, reference, attempt)

    tx = wompi.crear_transaccion(payment_source_id, amount, reference)
    resolver(tx)  # polling o webhook

    si APPROVED:
        pedido = crear_pedido(sub)          # lógica existente, financial_status=paid
        charge.update(approved, tx.id, pedido.id)
        sub.update(next_charge_at += interval_days, retry_count = 0)
        notificar_cliente(pedido)           # opcional: email/WhatsApp

    si DECLINED o ERROR:
        charge.update(declined/error, mensaje)
        aplicar_politica_reintentos(sub)    # sección 7
```

---

## 6. Integración con Wompi — referencia rápida

Documentación oficial: **docs.wompi.co** (verificar payloads exactos ahí).

| Qué | Endpoint | Llave |
|---|---|---|
| Tokenizar tarjeta (navegador, lo hace la landing) | `POST /v1/tokens/cards` | pública |
| Tokenizar Nequi (push a la app del cliente) | `POST /v1/tokens/nequi` | pública |
| Acceptance token (términos, lo obtiene la landing) | `GET /v1/merchants/{public_key}` | pública |
| Crear fuente de pago | `POST /v1/payment_sources` | **privada** |
| Cobrar | `POST /v1/transactions` (con `payment_source_id`) | **privada** |
| Consultar transacción | `GET /v1/transactions/{id}` | — |

- **Ambientes**: `production.wompi.co` (llaves `prv_prod_`/`pub_prod_`) y
  `sandbox.wompi.co` (llaves `_test_`). Desarrollar TODO contra sandbox primero.
- **3-D Secure**: el primer cobro de una tarjeta puede requerir autenticación del
  titular. Por eso el primer cobro se hace en el flujo de alta (cliente presente,
  sección 4.1); los siguientes van como pago recurrente sobre la fuente ya
  autenticada (protocolo 3RI — ver docs.wompi.co → "Fuentes de pago 3DS").
- **Config del servidor Sendura** (por tienda o global):
  `WOMPI_PRIVATE_KEY`, `WOMPI_EVENTS_SECRET`, ambiente.
  La llave privada la entrega la tienda por canal seguro (NUNCA por chat/email plano).

---

## 7. Política de reintentos y morosidad (dunning)

| Evento | Acción |
|---|---|
| Cobro DECLINED, intento 1 | Reintentar en **2 días** (`next_charge_at = hoy+2`, `retry_count=1`). Notificar al cliente ("no pudimos procesar tu pago"). |
| DECLINED, intento 2 | Reintentar en **3 días**. Notificar de nuevo. |
| DECLINED, intento 3 | `status = past_due`. Notificar: "tu suscripción quedó pausada, actualiza tu método de pago". No más cobros automáticos. |
| Cliente cancela | `status = cancelled`. No cobrar nunca más. Confirmar por el mismo canal. |
| Transacción PENDING > 24h | Consultar a Wompi; si sigue pendiente, tratar como declined del intento. |

Reglas duras:
- **Jamás** cobrar dos veces el mismo período (referencia idempotente).
- **Jamás** cobrar una suscripción `cancelled` o `past_due`.
- Registrar todo intento en `subscription_charges` (auditoría ante disputas).

---

## 8. Checklist de aceptación (QA)

Con llaves **sandbox** de Wompi:

- [ ] Alta con tarjeta de prueba aprobada → payment source creado, 1er cobro APPROVED, pedido creado con guía, `next_charge_at` = +30 días.
- [ ] Alta con tarjeta de prueba rechazada → 422, sin suscripción activa, sin pedido.
- [ ] Cron con `next_charge_at` vencida → cobra, crea pedido nuevo, avanza fecha.
- [ ] Correr el cron **dos veces** el mismo día → un solo cobro (idempotencia).
- [ ] DECLINED en renovación → reintentos 2d/3d → `past_due` tras 3 fallos.
- [ ] Cancelación por enlace público → no vuelve a cobrar.
- [ ] Webhook con checksum inválido → rechazado (401/403).
- [ ] La llave privada no aparece en ningún log ni respuesta.

---

## 9. Contrato con la landing (resumen)

La landing de CURVE ya está preparada para consumir:

- `POST /api/v1/subscriptions` (sección 4.1) — con el mismo token de tienda `snd_` actual.
- El campo `cancel_url` de la respuesta se le muestra al cliente en el correo/pantalla de confirmación.

Cualquier duda del payload → contactar a la tienda. Se recomienda desplegar
primero en sandbox y hacer una prueba end-to-end conjunta antes de producción.
