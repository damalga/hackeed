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
      return { statusCode: 400, body: JSON.stringify({ error: 'Carrito vacío' }) };
    }

    // Obtener productos de BD y validar
    const productIds = items.map(i => i.id);
    const dbProducts = await sql`
      SELECT id, name, price_cents, stock
      FROM products
      WHERE id = ANY(${productIds}) AND active = true
    `;

    if (dbProducts.length !== items.length) {
      throw new Error('Algunos productos no existen o están inactivos');
    }

    const lineItems = items.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (!dbProduct) throw new Error(`Producto ${item.id} no encontrado`);
      if (dbProduct.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${dbProduct.name}`);
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
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
