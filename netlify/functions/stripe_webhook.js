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

      // Agrupar cantidades por product_id (por si se repite)
      const qtyByProduct = new Map();
      for (const li of lineItems.data) {
        const prod = li.price?.product;
        const productId = prod?.metadata?.product_id; // <- viene de tu checkout
        const qty = li.quantity || 0;

        if (!productId) {
          console.warn('⚠️ line_item sin product_id en metadata. Nombre:', prod?.name);
          continue;
        }

        qtyByProduct.set(productId, (qtyByProduct.get(productId) || 0) + qty);
      }

      // Descontar stock para cada product_id
      for (const [productId, qty] of qtyByProduct.entries()) {
        await sql`
          UPDATE products
          SET stock = GREATEST(stock - ${qty}, 0)
          WHERE id = ${productId}
        `;
        console.log(`✅ Stock actualizado: ${productId} -${qty}`);
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
