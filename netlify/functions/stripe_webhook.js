import { neon } from '@netlify/neon';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  const sql = neon();
  let stripeEvent;

  try {
    // Verificar la firma del webhook
    const signature = event.headers['stripe-signature'];

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Construir el evento desde el payload crudo
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      webhookSecret
    );

    console.log(`Received Stripe webhook: ${stripeEvent.type} - ID: ${stripeEvent.id}`);

    // Verificar si ya procesamos este evento
    const existingEvent = await sql`
      SELECT id FROM stripe_events
      WHERE stripe_event_id = ${stripeEvent.id}
      LIMIT 1
    `;

    if (existingEvent.length > 0) {
      console.log(`Event ${stripeEvent.id} already processed, skipping`);
      return {
        statusCode: 200,
        body: JSON.stringify({ received: true, message: 'Event already processed' })
      };
    }

    // Registrar el evento en la base de datos
    await sql`
      INSERT INTO stripe_events (stripe_event_id, event_type, data, processed)
      VALUES (${stripeEvent.id}, ${stripeEvent.type}, ${JSON.stringify(stripeEvent.data)}, false)
    `;

    // Procesar el evento según su tipo
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object, sql);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(stripeEvent.data.object, sql);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(stripeEvent.data.object, sql);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object, sql);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(stripeEvent.type, stripeEvent.data.object, sql);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(stripeEvent.data.object, sql);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Marcar el evento como procesado
    await sql`
      UPDATE stripe_events
      SET processed = true, processed_at = CURRENT_TIMESTAMP
      WHERE stripe_event_id = ${stripeEvent.id}
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook error:', error);

    // Si tenemos un evento válido pero el procesamiento falló
    if (stripeEvent?.id) {
      try {
        await sql`
          UPDATE stripe_events
          SET processed = false, data = ${JSON.stringify({
            ...stripeEvent.data,
            error: error.message
          })}
          WHERE stripe_event_id = ${stripeEvent.id}
        `;
      } catch (dbError) {
        console.error('Error updating event in database:', dbError);
      }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error.message,
        type: 'webhook_error'
      })
    };
  }
}

// Manejar checkout session completado
async function handleCheckoutSessionCompleted(session, sql) {
  try {
    console.log(`Processing checkout session completed: ${session.id}`);

    // Obtener detalles completos de la sesión
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer', 'payment_intent']
    });

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });

    // Buscar o crear el cliente
    let customerId = null;
    if (fullSession.customer_email) {
      const customer = await sql`
        INSERT INTO customers (email, stripe_customer_id, name)
        VALUES (
          ${fullSession.customer_email},
          ${fullSession.customer || null},
          ${fullSession.customer_details?.name || ''}
        )
        ON CONFLICT (email)
        DO UPDATE SET
          stripe_customer_id = COALESCE(customers.stripe_customer_id, ${fullSession.customer || null}),
          name = COALESCE(NULLIF(customers.name, ''), ${fullSession.customer_details?.name || ''}),
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;
      customerId = customer[0]?.id;
    }

    // Crear o actualizar la orden
    const orderNumber = `ORD-${Date.now()}-${session.id.slice(-8)}`;
    const totalAmount = fullSession.amount_total / 100; // Convertir de centavos
    const subtotalAmount = fullSession.amount_subtotal / 100;
    const shippingAmount = (fullSession.total_details?.amount_shipping || 0) / 100;
    const taxAmount = (fullSession.total_details?.amount_tax || 0) / 100;

    const order = await sql`
      INSERT INTO orders (
        customer_id,
        order_number,
        stripe_payment_intent_id,
        stripe_session_id,
        status,
        payment_status,
        subtotal,
        tax_amount,
        shipping_amount,
        total_amount,
        currency
      ) VALUES (
        ${customerId},
        ${orderNumber},
        ${fullSession.payment_intent?.id || fullSession.payment_intent},
        ${session.id},
        'processing',
        'succeeded',
        ${subtotalAmount},
        ${taxAmount},
        ${shippingAmount},
        ${totalAmount},
        ${fullSession.currency.toUpperCase()}
      )
      ON CONFLICT (stripe_session_id)
      DO UPDATE SET
        status = 'processing',
        payment_status = 'succeeded',
        stripe_payment_intent_id = ${fullSession.payment_intent?.id || fullSession.payment_intent},
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const orderId = order[0].id;

    // Crear items de la orden
    for (const item of lineItems.data) {
      const product = item.price.product;
      const quantity = item.quantity;
      const unitPrice = item.price.unit_amount / 100;
      const totalPrice = unitPrice * quantity;

      // Buscar el producto en nuestra base de datos
      const dbProduct = await sql`
        SELECT id FROM products
        WHERE stripe_price_id = ${item.price.id}
           OR name = ${product.name}
        LIMIT 1
      `;

      const productId = dbProduct[0]?.id;

      await sql`
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          unit_price,
          total_price
        ) VALUES (
          ${orderId},
          ${productId},
          ${quantity},
          ${unitPrice},
          ${totalPrice}
        )
      `;

      // Actualizar stock si tenemos el producto en nuestra DB
      if (productId) {
        await sql`
          UPDATE products
          SET stock = GREATEST(stock - ${quantity}, 0)
          WHERE id = ${productId}
        `;
      }
    }

    // Guardar dirección de envío si existe
    if (fullSession.shipping_details) {
      const shipping = fullSession.shipping_details;
      await sql`
        INSERT INTO addresses (
          customer_id,
          type,
          street,
          city,
          state,
          postal_code,
          country
        ) VALUES (
          ${customerId},
          'shipping',
          ${shipping.address.line1 + (shipping.address.line2 ? ', ' + shipping.address.line2 : '')},
          ${shipping.address.city},
          ${shipping.address.state || ''},
          ${shipping.address.postal_code},
          ${shipping.address.country}
        )
        ON CONFLICT (customer_id, type) DO NOTHING
      `;
    }

    console.log(`Order ${orderNumber} created successfully for session ${session.id}`);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Manejar payment intent exitoso
async function handlePaymentIntentSucceeded(paymentIntent, sql) {
  try {
    console.log(`Processing payment intent succeeded: ${paymentIntent.id}`);

    await sql`
      UPDATE orders
      SET
        payment_status = 'succeeded',
        status = CASE
          WHEN status = 'pending' THEN 'processing'
          ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `;

    console.log(`Payment intent ${paymentIntent.id} marked as succeeded`);

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

// Manejar payment intent fallido
async function handlePaymentIntentFailed(paymentIntent, sql) {
  try {
    console.log(`Processing payment intent failed: ${paymentIntent.id}`);

    await sql`
      UPDATE orders
      SET
        payment_status = 'failed',
        status = 'cancelled',
        notes = COALESCE(notes || E'\n', '') || 'Payment failed: ' || ${paymentIntent.last_payment_error?.message || 'Unknown error'},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${paymentIntent.id}
    `;

    // Restaurar stock
    const orderItems = await sql`
      SELECT oi.product_id, oi.quantity
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.stripe_payment_intent_id = ${paymentIntent.id}
    `;

    for (const item of orderItems) {
      if (item.product_id) {
        await sql`
          UPDATE products
          SET stock = stock + ${item.quantity}
          WHERE id = ${item.product_id}
        `;
      }
    }

    console.log(`Payment intent ${paymentIntent.id} marked as failed and stock restored`);

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}

// Manejar pago de factura exitoso (para suscripciones)
async function handleInvoicePaymentSucceeded(invoice, sql) {
  try {
    console.log(`Processing invoice payment succeeded: ${invoice.id}`);

    // Aquí puedes agregar lógica específica para suscripciones
    // Por ejemplo, activar servicios, extender períodos, etc.

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

// Manejar eventos de suscripción
async function handleSubscriptionEvent(eventType, subscription, sql) {
  try {
    console.log(`Processing subscription event: ${eventType} - ${subscription.id}`);

    // Aquí puedes agregar lógica para manejar suscripciones
    // crear/actualizar/cancelar suscripciones en tu DB

  } catch (error) {
    console.error(`Error handling subscription event ${eventType}:`, error);
    throw error;
  }
}

// Manejar disputas de cargos
async function handleChargeDispute(dispute, sql) {
  try {
    console.log(`Processing charge dispute: ${dispute.id}`);

    // Notificar al equipo sobre la disputa
    // Marcar la orden como disputada
    await sql`
      UPDATE orders
      SET
        status = 'disputed',
        notes = COALESCE(notes || E'\n', '') || 'Charge disputed: ' || ${dispute.reason},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = ${dispute.payment_intent}
    `;

  } catch (error) {
    console.error('Error handling charge dispute:', error);
    throw error;
  }
}
