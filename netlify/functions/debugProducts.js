import { neon } from '@netlify/neon';

export async function handler(event) {
  // Solo permitir en desarrollo o con autenticación
  const isDevelopment = process.env.NODE_ENV === 'development';
  const debugToken = event.headers['x-debug-token'];
  const validToken = process.env.DEBUG_TOKEN;

  if (!isDevelopment && (!debugToken || debugToken !== validToken)) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Acceso denegado' })
    };
  }
  try {
    console.log('Starting debug function');
    const sql = neon();

    // Test 1: Check if we can connect to the database
    console.log('Testing database connection...');
    const connectionTest = await sql`SELECT NOW() as current_time`;
    console.log('Connection successful:', connectionTest);

    // Test 2: Check table structure
    console.log('Checking table structure...');
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY column_name
    `;
    console.log('Table structure:', tableStructure);

    // Test 3: Count total products
    console.log('Counting products...');
    const productCount = await sql`SELECT COUNT(*) as total FROM products`;
    console.log('Total products:', productCount);

    // Test 4: Get raw data from products (no transformation)
    console.log('Fetching raw product data...');
    const rawProducts = await sql`
      SELECT * FROM products
      WHERE active = true
      LIMIT 3
    `;
    console.log('Raw products:', rawProducts);

    // Test 5: Check specific fields that might be problematic
    console.log('Checking specific fields...');
    const specificFields = await sql`
      SELECT
        id,
        name,
        description,
        images,
        features,
        variants,
        price_cents,
        stock
      FROM products
      WHERE active = true
      LIMIT 2
    `;
    console.log('Specific fields:', specificFields);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tests: {
          connection: connectionTest,
          tableStructure: tableStructure,
          productCount: productCount,
          rawProducts: rawProducts,
          specificFields: specificFields
        }
      }, null, 2),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };

  } catch (err) {
    console.error('Debug function error:', err);
    console.error('Error stack:', err.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
        details: 'Debug function failed'
      }, null, 2),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}
