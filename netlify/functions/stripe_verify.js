import { neon } from '@netlify/neon';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  // Verificar origen permitido
  const allowedOrigins = [
    'http://localhost:8888',
    'https://tu-dominio.netlify.app'
  ];

  const origin = event.headers.origin;
  const corsHeaders = allowedOrigins.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    : {
        'Access-Control-Allow-Origin': 'null',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

  // Solo permitir GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const sql = neon();
    const { queryStringParameters } = event;

    // Extraer parámetros de la query string
    const sessionId = queryStringParameters?.session_id;
    const paymentIntentId = queryStringParameters?.payment_intent_id;
    const orderId = queryStringParameters?.order_id;

    if (!sessionId && !paymentIntentId && !orderId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Se requiere session_id, payment_intent_id o order_id'
        })
      };
    }

    let verificationResult = {};

    // Verificar por Session ID (más común después de Stripe Checkout)
    if (sessionId) {
      const sessionResult = await verifyBySessionId(sessionId, sql);
      verificationResult = { ...verificationResult, ...sessionResult };
    }

    // Verificar por Payment Intent ID
    if (paymentIntentId) {
      const paymentResult = await verifyByPaymentIntentId(paymentIntentId, sql);
      verificationResult = { ...verificationResult, ...paymentResult };
    }

    // Verificar por Order ID interno
    if (orderId) {
      const orderResult = await verifyByOrderId(orderId, sql);
      verificationResult = { ...verificationResult, ...orderResult };
    }

    // Sanitizar datos sensibles antes de enviar
    const sanitizedResult = sanitizeVerificationResult(verificationResult);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitizedResult)
    };

  } catch (error) {
    console.error('Error verifying payment:', error);

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
}

// Función para sanitizar datos sensibles
function sanitizeVerificationResult(result) {
  if (!result) return result;

  // Crear copia para no mutar el original
  const sanitized = JSON.parse(JSON.stringify(result));

  // Remover datos sensibles del order
  if (sanitized.order) {
    delete sanitized.order.customer_email;
    delete sanitized.order.notes;

    // Mantener solo información básica del cliente
    if (sanitized.order.customer_name) {
      sanitized.order.customer_name = sanitized.order.customer_name.charAt(0) + '***';
    }
  }

  // Remover client_secret de payment intent
  if (sanitized.stripe_payment_intent) {
    delete sanitized.stripe_payment_intent.client_secret;
  }

  // Remover customer_email de session
  if (sanitized.stripe_session) {
    delete sanitized.stripe_session.customer_email;
  }

  return sanitized;
}

// Verificar pago por Session ID
async function verifyBySessionId(sessionId, sql) {
  try {
    // Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });

    // Buscar la orden en nuestra base de datos
    const order = await sql`
      SELECT
        o.*,
        c.email as customer_email,
        c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.stripe_session_id = ${sessionId}
      LIMIT 1
    `;

    // Obtener items de la orden
    let orderItems = [];
    if (order.length > 0) {
      orderItems = await sql`
        SELECT
          oi.*,
          p.name as product_name,
          p.sku as product_sku,
          p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ${order[0].id}
        ORDER BY oi.id
      `;
    }

    return {
      verification_type: 'session',
      stripe_session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency
      },
      order: order.length > 0 ? {
        ...order[0],
        items: orderItems
      } : null,
      payment_verified: session.payment_status === 'paid' && order.length > 0,
      created_at: session.created
    };

  } catch (error) {
    console.error('Error verifying by session ID:', error);
    throw new Error(`Error verificando sesión: ${error.message}`);
  }
}

// Verificar pago por Payment Intent ID
async function verifyByPaymentIntentId(paymentIntentId, sql) {
  try {
    // Obtener el payment intent de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Buscar la orden en nuestra base de datos
    const order = await sql`
      SELECT
        o.*,
        c.email as customer_email,
        c.name as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.stripe_payment_intent_id = ${paymentIntentId}
      LIMIT 1
    `;

    // Obtener items de la orden
    let orderItems = [];
    if (order.length > 0) {
      orderItems = await sql`
        SELECT
          oi.*,
          p.name as product_name,
          p.sku as product_sku,
          p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ${order[0].id}
        ORDER BY oi.id
      `;
    }

    return {
      verification_type: 'payment_intent',
      stripe_payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        client_secret: paymentIntent.client_secret
      },
      order: order.length > 0 ? {
        ...order[0],
        items: orderItems
      } : null,
      payment_verified: paymentIntent.status === 'succeeded' && order.length > 0,
      created_at: paymentIntent.created
    };

  } catch (error) {
    console.error('Error verifying by payment intent ID:', error);
    throw new Error(`Error verificando payment intent: ${error.message}`);
  }
}

// Verificar por Order ID interno
async function verifyByOrderId(orderId, sql) {
  try {
    // Buscar la orden en nuestra base de datos
    const order = await sql`
      SELECT
        o.*,
        c.email as customer_email,
        c.name as customer_name,
        c.stripe_customer_id
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ${orderId} OR o.order_number = ${orderId}
      LIMIT 1
    `;

    if (order.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const orderData = order[0];

    // Obtener items de la orden
    const orderItems = await sql`
      SELECT
        oi.*,
        p.name as product_name,
        p.sku as product_sku,
        p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderData.id}
      ORDER BY oi.id
    `;

    // Si tenemos stripe_payment_intent_id, verificar con Stripe
    let stripePaymentIntent = null;
    if (orderData.stripe_payment_intent_id) {
      try {
        stripePaymentIntent = await stripe.paymentIntents.retrieve(orderData.stripe_payment_intent_id);
      } catch (stripeError) {
        console.warn('Error retrieving payment intent from Stripe:', stripeError.message);
      }
    }

    // Si tenemos stripe_session_id, verificar con Stripe
    let stripeSession = null;
    if (orderData.stripe_session_id) {
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(orderData.stripe_session_id);
      } catch (stripeError) {
        console.warn('Error retrieving session from Stripe:', stripeError.message);
      }
    }

    return {
      verification_type: 'order',
      order: {
        ...orderData,
        items: orderItems
      },
      stripe_payment_intent: stripePaymentIntent ? {
        id: stripePaymentIntent.id,
        status: stripePaymentIntent.status,
        amount: stripePaymentIntent.amount,
        currency: stripePaymentIntent.currency
      } : null,
      stripe_session: stripeSession ? {
        id: stripeSession.id,
        payment_status: stripeSession.payment_status,
        amount_total: stripeSession.amount_total,
        currency: stripeSession.currency
      } : null,
      payment_verified: orderData.payment_status === 'succeeded',
      created_at: Math.floor(new Date(orderData.created_at).getTime() / 1000)
    };

  } catch (error) {
    console.error('Error verifying by order ID:', error);
    throw new Error(`Error verificando orden: ${error.message}`);
  }
}

// Función auxiliar para formatear fechas
function formatDate(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

// Función auxiliar para calcular el estado general
function calculateOverallStatus(order, stripeData) {
  if (!order) return 'not_found';

  if (order.payment_status === 'succeeded' &&
      (!stripeData || stripeData.status === 'succeeded' || stripeData.payment_status === 'paid')) {
    return 'completed';
  }

  if (order.payment_status === 'failed' ||
      (stripeData && (stripeData.status === 'failed' || stripeData.payment_status === 'unpaid'))) {
    return 'failed';
  }

  if (order.payment_status === 'pending' ||
      (stripeData && (stripeData.status === 'processing' || stripeData.payment_status === 'pending'))) {
    return 'pending';
  }

  return 'unknown';
}
