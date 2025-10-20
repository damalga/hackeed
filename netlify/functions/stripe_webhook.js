import { neon } from '@netlify/neon';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const sql = neon(process.env.DATABASE_URL);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Firma inválida:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      // Traemos los line items con el Product expandido para leer metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });

      // Procesar cada line item individualmente
      for (const li of lineItems.data) {
        const prod = li.price?.product;
        const productId = prod?.metadata?.product_id;
        const variantOptionId = prod?.metadata?.variant_option_id;
        const qty = li.quantity || 0;

        if (!productId) {
          console.warn('⚠️ line_item sin product_id en metadata. Nombre:', prod?.name);
          continue;
        }

        // Si el producto tiene variante, actualizar el stock de la variante específica
        if (variantOptionId) {
          console.log(`📦 Procesando producto con variante: ${productId}, variante: ${variantOptionId}, qty: ${qty}`);

          // Obtener el producto actual con sus variantes
          const [product] = await sql`
            SELECT variants
            FROM products
            WHERE id = ${productId}
          `;

          if (!product) {
            console.error(`❌ Producto ${productId} no encontrado`);
            continue;
          }

          // Parsear variantes
          let variants = product.variants;
          if (typeof variants === 'string') {
            variants = JSON.parse(variants);
          }

          if (!variants || !variants.options) {
            console.error(`❌ Producto ${productId} no tiene variantes válidas`);
            continue;
          }

          // Buscar y actualizar la opción específica
          let optionFound = false;
          variants.options = variants.options.map(option => {
            if (option.id === variantOptionId || option.name === variantOptionId) {
              optionFound = true;
              const newStock = Math.max((option.stock || 0) - qty, 0);
              console.log(`  ➡️ Variante "${option.name}": stock ${option.stock} → ${newStock}`);
              return {
                ...option,
                stock: newStock,
                inStock: newStock > 0
              };
            }
            return option;
          });

          if (!optionFound) {
            console.error(`❌ Variante ${variantOptionId} no encontrada en producto ${productId}`);
            continue;
          }

          // Actualizar el producto con las variantes modificadas
          await sql`
            UPDATE products
            SET variants = ${JSON.stringify(variants)}
            WHERE id = ${productId}
          `;

          console.log(`✅ Stock de variante actualizado: producto ${productId}, variante ${variantOptionId}, -${qty}`);

        } else {
          // Producto sin variantes: actualizar stock general
          await sql`
            UPDATE products
            SET stock = GREATEST(stock - ${qty}, 0)
            WHERE id = ${productId}
          `;
          console.log(`✅ Stock general actualizado: ${productId} -${qty}`);
        }
      }
    } else {
      // Otros eventos no los necesitamos ahora
      // console.log('Evento ignorado:', stripeEvent.type);
    }

    // Idempotencia básica: registra el evento y evita reprocesar
    await sql`
      INSERT INTO stripe_events (stripe_event_id, event_type, data, processed)
      VALUES (${stripeEvent.id}, ${stripeEvent.type}, ${JSON.stringify(stripeEvent.data)}, true)
      ON CONFLICT (stripe_event_id) DO NOTHING
    `;

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('❌ Error procesando webhook:', err);
    return { statusCode: 500, body: 'Webhook handler failed' };
  }
}
