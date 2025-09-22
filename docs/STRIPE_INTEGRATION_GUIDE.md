# 🚀 Guía Completa de Integración Stripe + Neon

## 📖 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración Inicial](#configuración-inicial)
4. [Base de Datos](#base-de-datos)
5. [Backend (Netlify Functions)](#backend-netlify-functions)
6. [Frontend (Vue.js)](#frontend-vuejs)
7. [Webhooks](#webhooks)
8. [Testing](#testing)
9. [Producción](#producción)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Esta guía te llevará paso a paso para integrar **Stripe** como pasarela de pago en tu aplicación Vue.js, conectada con una base de datos **Neon PostgreSQL** y desplegada en **Netlify**.

### ✨ Características Implementadas

- ✅ Carrito de compras persistente
- ✅ Checkout con Stripe
- ✅ Gestión de inventario
- ✅ Webhooks de Stripe
- ✅ Órdenes y facturación
- ✅ Verificación de pagos
- ✅ Manejo de errores robusto
- ✅ Responsive design

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Vue.js App    │────│ Netlify Functions│────│   Neon DB       │
│   (Frontend)    │    │   (Backend)      │    │ (PostgreSQL)    │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │                 │
         └──────────────│   Stripe API    │
                        │                 │
                        └─────────────────┘
```

### 🔄 Flujo de Pago

1. **Cliente** agrega productos al carrito
2. **Frontend** envía datos a Netlify Function
3. **Backend** crea sesión de checkout en Stripe
4. **Cliente** es redirigido a Stripe Checkout
5. **Stripe** procesa el pago
6. **Webhook** confirma el pago
7. **Backend** actualiza la base de datos
8. **Cliente** es redirigido a página de éxito

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install stripe @stripe/stripe-js
```

### 2. Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxxxx.neon.tech/database

# Application
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
VITE_APP_URL=http://localhost:8888
```

### 3. Configurar en Netlify

```toml
# netlify.toml
[build.environment]
  STRIPE_SECRET_KEY = "sk_test_..."
  STRIPE_WEBHOOK_SECRET = "whsec_..."
  DATABASE_URL = "postgresql://..."
```

---

## 🗄️ Base de Datos

### Ejecutar el Schema

```sql
-- Ejecuta el archivo database/schema.sql en tu Neon database
psql $DATABASE_URL -f database/schema.sql
```

### Tablas Principales

#### `products`
Almacena la información de productos:
```sql
- id (SERIAL PRIMARY KEY)
- sku (VARCHAR UNIQUE)
- name (VARCHAR)
- price (DECIMAL)
- stock (INTEGER)
- stripe_price_id (VARCHAR) -- Opcional para productos recurrentes
```

#### `customers`
Información de clientes:
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- stripe_customer_id (VARCHAR)
- name (VARCHAR)
```

#### `orders`
Órdenes de compra:
```sql
- id (SERIAL PRIMARY KEY)
- order_number (VARCHAR UNIQUE)
- stripe_payment_intent_id (VARCHAR)
- stripe_session_id (VARCHAR)
- status (VARCHAR)
- payment_status (VARCHAR)
- total_amount (DECIMAL)
```

#### `order_items`
Productos en cada orden:
```sql
- id (SERIAL PRIMARY KEY)
- order_id (INTEGER REFERENCES orders)
- product_id (INTEGER REFERENCES products)
- quantity (INTEGER)
- unit_price (DECIMAL)
- total_price (DECIMAL)
```

---

## 🔧 Backend (Netlify Functions)

### 1. create-checkout-session.js

**Propósito**: Crear sesión de checkout en Stripe

**Flujo**:
1. Valida productos y stock
2. Crea/busca cliente en Stripe
3. Configura line items
4. Crea sesión de checkout
5. Retorna URL de checkout

**Endpoints**: `POST /.netlify/functions/create-checkout-session`

### 2. stripe-webhook.js

**Propósito**: Procesar eventos de Stripe

**Eventos Manejados**:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.payment_succeeded`

**Flujo**:
1. Verifica firma del webhook
2. Previene duplicados
3. Procesa según tipo de evento
4. Actualiza base de datos
5. Marca como procesado

### 3. verify-payment.js

**Propósito**: Verificar estado de pagos

**Métodos de Verificación**:
- Por Session ID
- Por Payment Intent ID
- Por Order ID interno

---

## 💻 Frontend (Vue.js)

### 1. useStripe Composable

**Funcionalidades**:
- Gestión del carrito
- Integración con Stripe.js
- Persistencia en localStorage
- Formateo de precios
- Manejo de errores

**Métodos Principales**:
```javascript
// Carrito
addToCart(product, quantity)
removeFromCart(productId)
updateCartQuantity(productId, quantity)
clearCart()

// Pagos
redirectToCheckout(customerInfo)
processPayment(paymentMethodId, customerInfo)
verifyPayment(sessionId)

// Utilidades
formatPrice(amount, currency)
getCartItemCount()
```

### 2. ShoppingCart Component

**Características**:
- Lista de productos en el carrito
- Control de cantidades
- Cálculo de totales (subtotal, impuestos, envío)
- Modal de información del cliente
- Integración con Stripe Checkout

### 3. PaymentSuccess Page

**Funcionalidades**:
- Verificación automática del pago
- Mostrar detalles de la orden
- Estados de carga y error
- Descarga de factura
- Pasos siguientes

---

## 🔗 Webhooks

### Configuración en Stripe

1. Ve a **Dashboard > Developers > Webhooks**
2. Crea un nuevo endpoint: `https://tu-dominio.netlify.app/.netlify/functions/stripe-webhook`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el **webhook secret**

### Eventos Importantes

#### checkout.session.completed
```javascript
// Se ejecuta cuando el checkout se completa exitosamente
// Crea la orden en la base de datos
// Actualiza el stock
// Envía confirmación por email
```

#### payment_intent.succeeded
```javascript
// Confirma que el pago fue exitoso
// Actualiza el estado de la orden a 'processing'
```

#### payment_intent.payment_failed
```javascript
// Maneja pagos fallidos
// Restaura el stock
// Marca la orden como cancelada
```

---

## 🧪 Testing

### Testing Local

1. **Usar Stripe CLI** para webhooks:
```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

2. **Test Cards** de Stripe:
```
4242424242424242 - Visa exitosa
4000000000000002 - Tarjeta declinada
4000002500003155 - Require autenticación (3D Secure)
```

### Testing de Funciones

```bash
# Test de productos
curl -X POST http://localhost:8888/.netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"quantity":2}],"customerEmail":"test@example.com"}'

# Test de verificación
curl http://localhost:8888/.netlify/functions/verify-payment?session_id=cs_test_xxxxx
```

### Test de Base de Datos

```sql
-- Verificar productos
SELECT * FROM products WHERE active = true;

-- Verificar órdenes
SELECT o.*, c.email FROM orders o JOIN customers c ON o.customer_id = c.id;

-- Verificar stock
SELECT name, stock FROM products WHERE stock < 10;
```

---

## 🚀 Producción

### 1. Configuración de Stripe

**Cambiar a claves de producción**:
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx...
STRIPE_SECRET_KEY=sk_live_xxxxx...
```

**Configurar webhooks** en producción con la URL real.

### 2. Variables de Entorno en Netlify

```
Site Settings > Environment Variables
```

Añade todas las variables del archivo `.env`.

### 3. Dominio y SSL

- Configura dominio personalizado
- SSL se configura automáticamente en Netlify
- Actualiza URLs en variables de entorno

### 4. Monitoreo

**Logs de Stripe**: Dashboard > Developers > Logs
**Logs de Netlify**: Site > Functions > Function logs
**Base de Datos**: Neon Console > Logs

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Webhook No Funciona

**Síntomas**: Los pagos no se confirman en la DB
**Soluciones**:
- Verifica la URL del webhook
- Confirma el webhook secret
- Revisa los logs de Netlify Functions
- Usa Stripe CLI para testing local

#### 2. Productos No Se Encuentran

**Síntomas**: Error "Algunos productos no están disponibles"
**Soluciones**:
- Verifica que los productos existen en la DB
- Confirma que `active = true`
- Revisa los IDs de productos en el carrito

#### 3. Stock Insuficiente

**Síntomas**: Error de stock en checkout
**Soluciones**:
- Verifica stock actual en la DB
- Implementa reserva temporal de stock
- Añade validación en el frontend

#### 4. Sesión de Checkout Falla

**Síntomas**: Error al crear checkout session
**Soluciones**:
- Verifica las claves de Stripe
- Confirma formato de line_items
- Revisa las variables de entorno

### Debug Avanzado

#### Logs de Stripe
```javascript
// En stripe-webhook.js
console.log('Stripe event:', JSON.stringify(stripeEvent, null, 2));
```

#### Logs de Base de Datos
```javascript
// En cualquier función
console.log('DB Query result:', result);
```

#### Verificar Estado
```sql
-- Verificar eventos no procesados
SELECT * FROM stripe_events WHERE processed = false;

-- Verificar órdenes problemáticas
SELECT * FROM orders WHERE payment_status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
```

---

## 📊 Métricas y Analytics

### KPIs Importantes

1. **Tasa de Conversión**: Checkouts iniciados vs completados
2. **Tiempo de Respuesta**: API response times
3. **Errores de Pago**: Failed payments ratio
4. **Stock Outs**: Productos sin stock

### Queries Útiles

```sql
-- Ventas del día
SELECT COUNT(*), SUM(total_amount) 
FROM orders 
WHERE payment_status = 'succeeded' 
AND created_at >= CURRENT_DATE;

-- Productos más vendidos
SELECT p.name, SUM(oi.quantity) as sold
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.payment_status = 'succeeded'
GROUP BY p.name
ORDER BY sold DESC
LIMIT 10;

-- Clientes frecuentes
SELECT c.email, COUNT(o.id) as orders
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.payment_status = 'succeeded'
GROUP BY c.email
ORDER BY orders DESC
LIMIT 10;
```

---

## 🔐 Seguridad

### Mejores Prácticas

1. **Nunca** expongas claves secretas en el frontend
2. **Siempre** verifica firmas de webhooks
3. **Valida** datos en el servidor
4. **Usa HTTPS** en producción
5. **Limita** rate limiting en APIs

### Validaciones Importantes

```javascript
// Validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validar cantidad
const quantity = Math.max(1, Math.min(99, parseInt(qty)));

// Validar precio (usar siempre precio de DB)
const dbPrice = await getProductPrice(productId);
```

---

## 🔄 Actualizaciones y Mantenimiento

### Tareas Regulares

1. **Limpiar eventos antiguos**:
```sql
DELETE FROM stripe_events 
WHERE processed = true 
AND created_at < NOW() - INTERVAL '90 days';
```

2. **Revisar órdenes pendientes**:
```sql
SELECT * FROM orders 
WHERE payment_status = 'pending' 
AND created_at < NOW() - INTERVAL '1 hour';
```

3. **Actualizar stock**:
```sql
-- Alertas de stock bajo
SELECT name, stock FROM products WHERE stock < 5 AND active = true;
```

### Backups

- **Neon**: Backups automáticos
- **Stripe**: Exporta datos regularmente
- **Código**: Git con tags de versión

---

## 📞 Soporte

### Recursos Útiles

- [Documentación de Stripe](https://stripe.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Vue.js Guide](https://vuejs.org/guide/)

### Contacto

Para problemas específicos de esta implementación:
- GitHub Issues
- Email: soporte@hackeed.com
- Discord: [Enlace al servidor]

---

## 🎉 ¡Listo!

Con esta guía tienes una implementación completa de Stripe + Neon. La integración incluye:

✅ **Carrito de compras** funcional
✅ **Pagos seguros** con Stripe
✅ **Base de datos** robusta con Neon
✅ **Webhooks** para confirmación automática
✅ **UI/UX** moderna y responsive
✅ **Manejo de errores** completo
✅ **Testing** y debugging tools
✅ **Documentación** detallada

**¡Felicidades por completar la integración!** 🚀

---

*Última actualización: Enero 2024*
*Versión: 1.0.0*