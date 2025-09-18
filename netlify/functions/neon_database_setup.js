import { neon } from '@netlify/neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and structure...\n');

    // Test connection
    console.log('1. Testing database connection...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log(`   Time: ${connectionTest[0].current_time}`);
    console.log(`   Version: ${connectionTest[0].pg_version}\n`);

    // Check existing tables
    console.log('2. Checking existing tables...');
    const tables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('❌ No tables found in the database');
    } else {
      console.log('✅ Found tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.table_type})`);
      });
    }
    console.log();

    // Check products table specifically
    console.log('3. Checking products table...');
    try {
      const productColumns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'products' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      if (productColumns.length === 0) {
        console.log('❌ Products table not found');
      } else {
        console.log('✅ Products table structure:');
        productColumns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking products table:', error.message);
    }
    console.log();

    // Count products
    console.log('4. Checking products data...');
    try {
      const productCount = await sql`SELECT COUNT(*) as count FROM products`;
      console.log(`✅ Found ${productCount[0].count} products`);

      if (productCount[0].count > 0) {
        const sampleProducts = await sql`
          SELECT id, name, price, stock
          FROM products
          LIMIT 5
        `;
        console.log('   Sample products:');
        sampleProducts.forEach(product => {
          console.log(`   - ID: ${product.id}, Name: ${product.name}, Price: $${product.price}, Stock: ${product.stock}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking products data:', error.message);
    }
    console.log();

    // Check for Stripe-related tables
    console.log('5. Checking for Stripe integration tables...');
    const stripeTable = ['customers', 'orders', 'order_items', 'stripe_events'];

    for (const tableName of stripeTable) {
      try {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${tableName}
          )
        `;

        if (result[0].exists) {
          const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
          console.log(`✅ ${tableName} table exists (${count[0].count} records)`);
        } else {
          console.log(`❌ ${tableName} table missing`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${tableName}:`, error.message);
      }
    }
    console.log();

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const hasProducts = tables.some(t => t.table_name === 'products');
    const hasStripeIntegration = stripeTable.some(async (tableName) => {
      try {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${tableName}
          )
        `;
        return result[0].exists;
      } catch {
        return false;
      }
    });

    console.log(`Database Connection: ✅ Working`);
    console.log(`Products Table: ${hasProducts ? '✅' : '❌'} ${hasProducts ? 'Found' : 'Missing'}`);
    console.log(`Stripe Integration: ${hasStripeIntegration ? '✅' : '❌'} ${hasStripeIntegration ? 'Ready' : 'Needs Setup'}`);

    if (!hasProducts) {
      console.log('\n⚠️  You need to create the products table first!');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. If missing tables, run: npm run setup:db');
    console.log('2. Add your products data');
    console.log('3. Test Stripe integration');

  } catch (error) {
    console.error('❌ Database check failed:', error);

    if (error.message.includes('connect')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your DATABASE_URL in .env');
      console.log('2. Verify your Neon database is running');
      console.log('3. Check your internet connection');
    }
  }
}

// Run the check
checkDatabase()
  .then(() => {
    console.log('\n✅ Database check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
