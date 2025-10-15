import { neon } from '@netlify/neon';

export async function handler() {
  try {
    console.log('Starting getProducts function');
    const sql = neon();

    console.log('Executing SQL query');
    const rows = await sql`
      SELECT
        id,
        sku,
        name,
        description,
        long_desc,
        img,
        images,
        price_cents,
        stock,
        active,
        brand,
        category,
        features,
        variants,
        created_at
      FROM products
      WHERE active = true
      ORDER BY created_at DESC
    `;

    console.log(`Found ${rows.length} products`);
    console.log('Sample product:', rows[0]);

    // Transform the data to match frontend expectations
    const products = rows.map((product, index) => {
      try {
        // Parse variants if needed
        let variants = product.variants ? (typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants) : null;

        // Calcular disponibilidad del producto
        let productInStock;

        if (variants && variants.options) {
          // Si tiene variantes, el producto está disponible si al menos una variante tiene stock
          productInStock = variants.options.some(option => {
            // Si la opción tiene campo 'stock', usarlo; si no, mantener compatibilidad con 'inStock'
            return option.stock ? option.stock > 0 : option.inStock === true;
          });

          // Asegurar que cada opción tenga el campo 'inStock' calculado desde 'stock'
          variants.options = variants.options.map(option => ({
            ...option,
            // Mantener el stock numérico si existe
            stock: option.stock !== undefined ? option.stock : (option.inStock ? 999 : 0),
            // Calcular inStock desde stock para compatibilidad
            inStock: option.stock !== undefined ? option.stock > 0 : option.inStock === true
          }));
        } else {
          // Si NO tiene variantes, usar el stock general del producto
          productInStock = product.stock > 0;
        }

        const transformed = {
          id: product.id,
          sku: product.sku,
          name: product.name,
          desc: product.description,
          longDesc: product.long_desc,
          img: product.img,
          images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [],
          price: product.price_cents ? product.price_cents / 100 : 0,
          category: product.category,
          brand: product.brand,
          inStock: productInStock,
          features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
          variants: variants,
          createdAt: product.created_at
        };

        console.log(`Transformed product ${index}:`, {
          id: transformed.id,
          name: transformed.name,
          hasImages: transformed.images.length > 0,
          hasFeatures: transformed.features.length > 0,
          hasVariants: !!transformed.variants
        });

        return transformed;
      } catch (transformErr) {
        console.error(`Error transforming product ${index}:`, transformErr);
        console.error('Raw product data:', product);
        throw transformErr;
      }
    });

    console.log(`Successfully transformed ${products.length} products`);

    return {
      statusCode: 200,
      body: JSON.stringify(products),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (err) {
    console.error('Error in getProducts function:', err);
    console.error('Error stack:', err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: 'Check server logs for more information'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}
