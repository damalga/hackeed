import { neon } from '@netlify/neon';
import Stripe from 'stripe';

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  try {
    console.log('=== TEST CHECKOUT DEBUG ===');
    console.log('Event body:', event.body);
    console.log('Headers:', event.headers);

    const {
      items,
      customerEmail = 'test@example.com',
    } = JSON.parse(event.body || '{}');

    console.log('Parsed items:', items);
    console.log('Customer email:', customerEmail);

    // Validar datos básicos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Items del carrito son requeridos' })
      };
    }

    // Verificar conexión con Stripe
    console.log('Verificando conexión con Stripe...');
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY no configurada');
    }

    // Validar productos contra la base de datos para evitar manipulación de precios
    const sql = neon();
    const productIds = items.map(item => item.id);

    console.log('Validating product IDs:', productIds);

    // Obtener productos reales de la base de datos
    const dbProducts = await sql`
      SELECT id, name, price_cents, stock
      FROM products
      WHERE id = ANY(${productIds}) AND active = true
    `;

    if (dbProducts.length !== items.length) {
      throw new Error('Algunos productos no están disponibles o no existen');
    }

    console.log('Database products:', dbProducts);

    // Crear line items usando SOLO precios de la base de datos
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.id);

      if (!dbProduct) {
        throw new Error(`Producto ${item.id} no encontrado`);
      }

      // Verificar stock
      if (dbProduct.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${dbProduct.name}. Disponible: ${dbProduct.stock}, Solicitado: ${item.quantity}`);
      }

      const dbPrice = parseFloat(dbProduct.price_cents) / 100; // Convertir centavos a euros
      const quantity = parseInt(item.quantity) || 1;

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: dbProduct.name,
            metadata: {
              product_id: dbProduct.id.toString(),
              validated: 'true'
            }
          },
          unit_amount: Math.round(dbPrice * 100), // Usar SOLO precio de BD
        },
        quantity: quantity,
      });

      totalAmount += dbPrice * quantity;
    }

    console.log('Line items:', JSON.stringify(lineItems, null, 2));

    // URLs de éxito y cancelación
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:8888';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cart`;

    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    // Configuración simplificada de la sesión
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,

      // Metadatos para debug
      metadata: {
        source: 'test-checkout',
        timestamp: Date.now().toString()
      },

      // Configuración básica
      billing_address_collection: 'required',
      locale: 'es',
    };

    console.log('Session config:', JSON.stringify(sessionConfig, null, 2));

    // Crear la sesión de checkout
    console.log('Creando sesión de Stripe...');
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Sesión creada exitosamente:', session.id);

    // Verificar conexión con base de datos
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
    try{
      console.log('Verificando conexión con Neon...');
      const sql = neon();
      const testQuery = await sql`SELECT NOW() as current_time`;
      console.log('Conexión con DB exitosa:', testQuery);
      const isValidDatabaseUrl = (
        databaseUrl &&
        typeof databaseUrl === 'string' &&
        databaseUrl !== '1' &&
        databaseUrl.toLowerCase().startsWith('postgres')
      );

      if (!isValidDatabaseUrl) {
        console.info('URL de base de datos no válida o no proporcionada. Omitiendo verificación de Neon.');
      } else {
        const sql = neon(databaseUrl);
        const testQuery = await sql`SELECT NOW() as current_time`;
        console.log('Conexión con DB exitosa:', testQuery);
    }
    } catch (dbError) {
      console.warn('Error conectando a BD (continuando):', dbError.message);
    }

    // Respuesta exitosa
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        id: session.id,
        url: session.url,
        customer_email: session.customer_email,
        debug: {
          items_count: items.length,
          total_amount: lineItems.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0) / 100,
          session_id: session.id
        }
      })
    };

  } catch (error) {
    console.error('=== ERROR EN TEST CHECKOUT ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          timestamp: new Date().toISOString()
        } : undefined
      })
    };
  }
}
