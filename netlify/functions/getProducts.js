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
        variants
      FROM products
      WHERE active = true
      ORDER BY name
    `;
    
    console.log(`Found ${rows.length} products`);
    console.log('Sample product:', rows[0]);

    // Transform the data to match frontend expectations
    const products = rows.map((product, index) => {
      try {
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
          inStock: product.stock > 0,
          features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
          variants: product.variants ? (typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants) : null
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