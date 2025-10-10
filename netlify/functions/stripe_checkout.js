import { neon } from '@netlify/neon';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { items, customerEmail = 'test@example.com' } = JSON.parse(event.body || '{}');

    if (!items?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No hay productos en tu carrito. Agrega productos antes de continuar.'
        })
      };
    }

    // Obtener productos de BD y validar
    const productIds = items.map(i => i.id);
    const dbProducts = await sql`
      SELECT id, name, price_cents, stock
      FROM products
      WHERE id = ANY(${productIds}) AND active = true
    `;

    if (dbProducts.length !== items.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Algunos productos en tu carrito ya no están disponibles. Actualiza tu carrito y revisa la disponibilidad.'
        })
      };
    }

    const lineItems = items.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (!dbProduct) {
        throw new Error(`El producto "${item.name || item.id}" ya no está disponible.`);
      }
      if (dbProduct.stock < item.quantity) {
        throw new Error(`No hay suficiente stock para "${dbProduct.name}". Stock disponible: ${dbProduct.stock}, solicitado: ${item.quantity}.`);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: dbProduct.name,
            metadata: { product_id: dbProduct.id }
          },
          unit_amount: dbProduct.price_cents
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/cart`,
      customer_email: customerEmail,
      billing_address_collection: 'required',
      locale: 'es'
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id, url: session.url })
    };

  } catch (err) {
    console.error('❌ Checkout error:', err);

    // Determinar el tipo de error y proporcionar mensaje apropiado
    let userMessage = err.message;
    let statusCode = 500;

    // Errores de red/Stripe API
    if (err.type === 'StripeConnectionError' || err.message.includes('network')) {
      userMessage = 'No se pudo conectar con el servicio de pagos. Verifica tu conexión a internet e intenta nuevamente.';
      statusCode = 503;
    }
    // Errores de validación de Stripe
    else if (err.type === 'StripeInvalidRequestError') {
      userMessage = 'Hay un problema con los datos de pago. Por favor, revisa la información e intenta de nuevo.';
      statusCode = 400;
    }
    // Errores de autenticación (API keys)
    else if (err.type === 'StripeAuthenticationError') {
      userMessage = 'Error de configuración del sistema de pagos. Por favor, contacta con soporte técnico.';
      statusCode = 500;
    }
    // Errores de base de datos
    else if (err.message.includes('stock') || err.message.includes('disponible')) {
      // Ya tiene mensaje descriptivo, mantenerlo
      statusCode = 400;
    }
    // Error genérico
    else if (statusCode === 500 && !err.message.includes('stock') && !err.message.includes('disponible')) {
      userMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.';
    }

    return {
      statusCode,
      body: JSON.stringify({ error: userMessage })
    };
  }
}
