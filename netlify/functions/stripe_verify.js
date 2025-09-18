import { neon } from '@netlify/neon';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) {
    return { statusCode: 400, body: 'Falta session_id' };
  }

  try {
    // 1. Recuperar sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    // 2. Buscar orden en DB (si la guardas) o producto relacionado
    const order = await sql`
      SELECT * FROM orders WHERE stripe_session_id = ${sessionId} LIMIT 1
    `;

    // 3. Preparar respuesta
    return {
      statusCode: 200,
      body: JSON.stringify({
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency
        },
        order: order[0] || null,
        payment_verified: session.payment_status === 'paid'
      })
    };

  } catch (err) {
    console.error('Error verificando pago:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
