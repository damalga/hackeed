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
    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    // Fetch order from database
    const order = await sql`
      SELECT * FROM orders WHERE stripe_session_id = ${sessionId} LIMIT 1
    `;

    // Prepare response
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
    console.error('stripe_verify: Payment verification error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
