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
    console.error('Invalid signature:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      // Fetch line items with expanded product metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });

      // Process each line item
      for (const li of lineItems.data) {
        const prod = li.price?.product;
        const productId = prod?.metadata?.product_id;
        const variantOptionId = prod?.metadata?.variant_option_id;
        const qty = li.quantity || 0;

        if (!productId) {
          console.warn('line_item without product_id in metadata. Name:', prod?.name);
          continue;
        }

        // Update variant-specific stock if product has variants
        if (variantOptionId) {
          console.log('Processing product with variant:', productId, 'variant:', variantOptionId, 'qty:', qty);

          // Fetch product with variants
          const [product] = await sql`
            SELECT variants
            FROM products
            WHERE id = ${productId}
          `;

          if (!product) {
            console.error('Product not found:', productId);
            continue;
          }

          // Parse variants
          let variants = product.variants;
          if (typeof variants === 'string') {
            variants = JSON.parse(variants);
          }

          if (!variants || !variants.options) {
            console.error('Product has no valid variants:', productId);
            continue;
          }

          // Find and update specific variant option
          let optionFound = false;
          variants.options = variants.options.map(option => {
            if (option.id === variantOptionId || option.name === variantOptionId) {
              optionFound = true;
              const newStock = Math.max((option.stock || 0) - qty, 0);
              console.log('Variant stock updated:', option.name, 'from', option.stock, 'to', newStock);
              return {
                ...option,
                stock: newStock,
                inStock: newStock > 0
              };
            }
            return option;
          });

          if (!optionFound) {
            console.error('Variant not found:', variantOptionId, 'in product', productId);
            continue;
          }

          // Update product with modified variants
          await sql`
            UPDATE products
            SET variants = ${JSON.stringify(variants)}
            WHERE id = ${productId}
          `;

          console.log('Variant stock updated in DB: product', productId, 'variant', variantOptionId, 'qty', -qty);

        } else {
          // No variants: update general stock
          await sql`
            UPDATE products
            SET stock = GREATEST(stock - ${qty}, 0)
            WHERE id = ${productId}
          `;
          console.log('General stock updated: product', productId, 'qty', -qty);
        }
      }
    }

    // Record event for idempotency
    await sql`
      INSERT INTO stripe_events (stripe_event_id, event_type, data, processed)
      VALUES (${stripeEvent.id}, ${stripeEvent.type}, ${JSON.stringify(stripeEvent.data)}, true)
      ON CONFLICT (stripe_event_id) DO NOTHING
    `;

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Error processing webhook:', err);
    return { statusCode: 500, body: 'Webhook handler failed' };
  }
}
