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

    console.log('Checkout request received');
    console.log('Items count:', items?.length);
    console.log('Customer email:', customerEmail);

    if (!items?.length) {
      console.log('No items in cart');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No hay productos en tu carrito. Agrega productos antes de continuar.'
        })
      };
    }

    // Fetch and validate products from database
    const productIds = items.map(i => i.id);

    // Extract unique product IDs (products may have multiple variants)
    const uniqueProductIds = [...new Set(productIds)];

    console.log('Product IDs in cart:', productIds);
    console.log('Unique product IDs:', uniqueProductIds);

    const dbProducts = await sql`
      SELECT id, name, price_cents, stock, variants
      FROM products
      WHERE id = ANY(${uniqueProductIds}) AND active = true
    `;

    console.log('DB products found:', dbProducts.length);
    console.log('Expected unique products:', uniqueProductIds.length);

    // Verify all unique products exist in database
    if (dbProducts.length !== uniqueProductIds.length) {
      console.log('Product count mismatch');
      const foundIds = dbProducts.map(p => p.id);
      const missingIds = uniqueProductIds.filter(id => !foundIds.includes(id));
      console.log('Missing product IDs:', missingIds);

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Algunos productos en tu carrito ya no están disponibles. Actualiza tu carrito y revisa la disponibilidad.'
        })
      };
    }

    console.log('Creating line items for', items.length, 'products');

    const lineItems = items.map(item => {
      console.log('Processing item:', item.id, {
        hasVariants: !!item.variants,
        hasOption: !!item.variants?.option
      });

      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (!dbProduct) {
        throw new Error(`El producto "${item.name || item.id}" ya no está disponible.`);
      }

      // Validate quantity
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(`Cantidad inválida para "${dbProduct.name}". La cantidad debe ser un número entero positivo.`);
      }

      if (item.quantity > 10) {
        throw new Error(`Cantidad inválida para "${dbProduct.name}". Máximo permitido: 10 unidades por producto.`);
      }

      // Parse variants if present
      let variants = null;
      if (dbProduct.variants) {
        variants = typeof dbProduct.variants === 'string'
          ? JSON.parse(dbProduct.variants)
          : dbProduct.variants;
      }

      // Validate stock based on variant configuration
      let availableStock;
      let variantKey = null;

      // Check if product has variants in both database and cart item
      if (variants && variants.options && item.variants && item.variants.option) {
        // Find variant-specific stock
        const selectedOption = variants.options.find(opt => {
          // Match by ID if both have it
          if (opt.id && item.variants.option.id) {
            return opt.id === item.variants.option.id;
          }
          // Fallback: match by name
          return opt.name === item.variants.option.name;
        });

        if (!selectedOption) {
          throw new Error(`La variante seleccionada de "${dbProduct.name}" ya no está disponible.`);
        }

        availableStock = selectedOption.stock !== undefined ? selectedOption.stock : 0;

        // Generate unique key for variant identification
        const variantProps = Object.entries(item.variants.selected || {})
          .map(([key, value]) => `${key}:${value}`)
          .sort()
          .join('|');
        variantKey = variantProps;

      } else {
        // No variants: use general stock
        availableStock = dbProduct.stock !== undefined ? dbProduct.stock : 0;
      }

      console.log('Stock check:', dbProduct.name, {
        availableStock,
        requestedQuantity: item.quantity,
        hasVariantKey: !!variantKey
      });

      if (availableStock === null || availableStock === undefined) {
        throw new Error(`No se pudo determinar el stock para "${dbProduct.name}". Por favor, contacta con soporte.`);
      }

      if (availableStock < item.quantity) {
        const productName = item.variants ? item.name : dbProduct.name;
        throw new Error(`No hay suficiente stock para "${productName}". Stock disponible: ${availableStock}, solicitado: ${item.quantity}.`);
      }

      // Prepare metadata for webhook
      const metadata = {
        product_id: dbProduct.id
      };

      // Include variant data for webhook if applicable
      if (variantKey) {
        metadata.variant_key = variantKey;
        metadata.variant_option_id = item.variants.option.id || item.variants.option.name;
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name || dbProduct.name, // Use cart name which includes variant
            metadata: metadata
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
    console.error('Checkout error:', err);
    console.error('Error stack:', err.stack);
    console.error('Error type:', err.type);

    // Determine error type and provide appropriate message
    let userMessage = err.message;
    let statusCode = 500;

    // Network/Stripe API errors
    if (err.type === 'StripeConnectionError' || err.message.includes('network')) {
      userMessage = 'No se pudo conectar con el servicio de pagos. Verifica tu conexión a internet e intenta nuevamente.';
      statusCode = 503;
    }
    // Stripe validation errors
    else if (err.type === 'StripeInvalidRequestError') {
      userMessage = 'Hay un problema con los datos de pago. Por favor, revisa la información e intenta de nuevo.';
      statusCode = 400;
    }
    // Authentication errors (API keys)
    else if (err.type === 'StripeAuthenticationError') {
      userMessage = 'Error de configuración del sistema de pagos. Por favor, contacta con soporte técnico.';
      statusCode = 500;
    }
    // Database errors
    else if (err.message.includes('stock') || err.message.includes('disponible')) {
      // Already has descriptive message, keep it
      statusCode = 400;
    }
    // Generic error
    else if (statusCode === 500 && !err.message.includes('stock') && !err.message.includes('disponible')) {
      userMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.';
    }

    return {
      statusCode,
      body: JSON.stringify({ error: userMessage })
    };
  }
}
