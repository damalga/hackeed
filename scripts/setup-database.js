import { neon } from '@netlify/neon';

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de base de datos...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está configurada en el archivo .env');
    console.log('📋 Pasos para configurar:');
    console.log('1. Ve a https://neon.tech');
    console.log('2. Crea una cuenta y base de datos');
    console.log('3. Copia la connection string');
    console.log('4. Añádela a tu archivo .env como: DATABASE_URL=postgresql://...');
    process.exit(1);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log('🔌 Conectando a Neon...');

    // Test connection
    const testResult = await sql`SELECT NOW() as current_time, version() as version`;
    console.log('✅ Conexión exitosa:', testResult[0].current_time);

    console.log('🗄️ Creando tablas...');

    // 1. Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        image_url VARCHAR(500),
        stripe_price_id VARCHAR(100),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla products creada');

    // 2. Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        stripe_customer_id VARCHAR(100) UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla customers creada');

    // 3. Create addresses table
    await sql`
      CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'shipping',
        street VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(2) DEFAULT 'ES',
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla addresses creada');

    // 4. Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        stripe_payment_intent_id VARCHAR(100) UNIQUE,
        stripe_session_id VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        shipping_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'EUR',
        shipping_address_id INTEGER REFERENCES addresses(id),
        billing_address_id INTEGER REFERENCES addresses(id),
        notes TEXT,
        tracking_number VARCHAR(100),
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla orders creada');

    // 5. Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabla order_items creada');

    // 6. Create stripe_events table
    await sql`
      CREATE TABLE IF NOT EXISTS stripe_events (
        id SERIAL PRIMARY KEY,
        stripe_event_id VARCHAR(100) UNIQUE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        processed BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      )
    `;
    console.log('✅ Tabla stripe_events creada');

    // 7. Create shopping_carts table (optional)
    await sql`
      CREATE TABLE IF NOT EXISTS shopping_carts (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, product_id)
      )
    `;
    console.log('✅ Tabla shopping_carts creada');

    // 8. Create indexes
    console.log('🔍 Creando índices...');

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_events(processed)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shopping_carts_session ON shopping_carts(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id)`;

    console.log('✅ Índices creados');

    // 9. Create triggers for updated_at
    console.log('⚡ Creando triggers...');

    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    const tables = ['products', 'customers', 'orders', 'shopping_carts'];
    for (const table of tables) {
      await sql`DROP TRIGGER IF EXISTS ${sql(table + '_updated_at')} ON ${sql.unsafe(table)}`;
      await sql`
        CREATE TRIGGER ${sql(table + '_updated_at')}
        BEFORE UPDATE ON ${sql.unsafe(table)}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `;
    }

    console.log('✅ Triggers creados');

    // 10. Insert sample products
    console.log('📦 Insertando productos de ejemplo...');

    const existingProducts = await sql`SELECT COUNT(*) FROM products`;

    if (existingProducts[0].count === '0') {
      await sql`
        INSERT INTO products (sku, name, description, price, stock, category, image_url) VALUES
        ('HACK
