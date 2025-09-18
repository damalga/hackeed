import { neon } from '@netlify/neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function addStripeTables() {
  try {
    console.log('🚀 Adding Stripe integration tables to database...\n');

    // 1. Create customers table
    console.log('1. Creating customers table...');
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
    console.log('✅ Customers table created');

    // 2. Create addresses table
    console.log('2. Creating addresses table...');
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
    console.log('✅ Addresses table created');

    // 3. Create orders table
    console.log('3. Creating orders table...');
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
    console.log('✅ Orders table created');

    // 4. Create order_items table
    console.log('4. Creating order_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Order items table created');

    // 5. Create stripe_events table (for webhook deduplication)
    console.log('5. Creating stripe_events table...');[vite] connecting... client:789:8
    [vite] connected. client:912:14
    ✅ Stripe configurado correctamente useStripe.js:23:10
    🔄 Inicializando Stripe... useStripe.js:50:14
    You may test your Stripe.js integration over HTTP. However, live Stripe.js integrations must use HTTPS. stripe.js:1:698636
    ✅ Stripe inicializado correctamente useStripe.js:57:14
    Partitioned cookie or storage access was provided to “https://js.stripe.com/v3/controller-with-preconnect-58a6372c5afdee86bc6bfb378d07285e.html#__shared_params__[version]=basil&__shared_params__[light_experiment_assignments]=%7B%22token%22%3A%220b86681f-9250-41e4-8707-2fdc33a8b3ad%22%2C%22assignments%22%3A%7B%7D%7D&apiKey=pk_test_51S7wo9IgnsuQsgcujdzyo7UjD8AAKg9AIvuCHFtY5qemlocwY8H35fAdFIDcQempL5jFwavHgLcn9SOTq5HFRv7E00ivRxIjwb&apiVersion=2025-03-31.basil&stripeJsId=0b86681f-9250-41e4-8707-2fdc33a8b3ad&stripeObjId=sobj-0411eb25-e43e-4e6c-ba9f-512fd1e60f29&firstStripeInstanceCreatedLatency=17&controllerCount=1&isCheckout=false&stripeJsLoadTime=1758126014916&manualBrowserDeprecationRollout=false&mids[guid]=NA&mids[muid]=62009fdf-ba88-45f4-9c01-c9993dfa8cafbdeb0c&mids[sid]=22a9bf5e-a54d-47a4-9359-d76fa8a80836479804&referrer=http%3A%2F%2Flocalhost%3A8888%2Ftest-cart&controllerId=__privateStripeController0771” because it is loaded in the third-party context and dynamic state partitioning is enabled.

    Layout was forced before the page was fully loaded. If stylesheets are not yet loaded this may cause a flash of unstyled content. markup.js:250:53
    Partitioned cookie or storage access was provided to “https://js.stripe.com/v3/m-outer-3437aaddcdf6922d623e172c2d6f9278.html#url=http%3A%2F%2Flocalhost%3A8888%2Ftest-cart&title=Hackeed&referrer=&muid=62009fdf-ba88-45f4-9c01-c9993dfa8cafbdeb0c&sid=22a9bf5e-a54d-47a4-9359-d76fa8a80836479804&version=6&preview=false&__shared_params__[version]=basil” because it is loaded in the third-party context and dynamic state partitioning is enabled.

    Partitioned cookie or storage access was provided to “https://m.stripe.network/inner.html#url=http%3A%2F%2Flocalhost%3A8888%2Ftest-cart&title=Hackeed&referrer=&muid=62009fdf-ba88-45f4-9c01-c9993dfa8cafbdeb0c&sid=22a9bf5e-a54d-47a4-9359-d76fa8a80836479804&version=6&preview=false&__shared_params__[version]=basil” because it is loaded in the third-party context and dynamic state partitioning is enabled.

    Blocked third party https://m.stripe.network/inner.html#url=http%3A%2F%2Flocalhost%3A8888%2Ftest-cart&title=Hackeed&referrer=&muid=62009fdf-ba88-45f4-9c01-c9993dfa8cafbdeb0c&sid=22a9bf5e-a54d-47a4-9359-d76fa8a80836479804&version=6&preview=false&__shared_params__[version]=basil from extracting canvas data. out-4.5.45.js:1:26884
    Cookie “m” has been rejected because it is foreign and does not have the “Partitioned“ attribute. 2 6
    Cookie “m” has been rejected because it is foreign and does not have the “Partitioned“ attribute. 2 6
    🔄 Iniciando redirección a checkout... useStripe.js:178:14
    🔄 Inicializando Stripe... useStripe.js:50:14
    ✅ Stripe inicializado correctamente useStripe.js:57:14
    🚀 Creando sesión de checkout... useStripe.js:128:14
    Cart items:
    Proxy { <target>: (3) […], <handler>: {…} }
    useStripe.js:129:14
    Customer info:
    Object { email: "test@example.com", name: "Cliente de Prueba" }
    useStripe.js:130:14
    XHRPOST
    http://localhost:8888/.netlify/functions/stripe_checkout
    [HTTP/1.1 500 Internal Server Error 1454ms]

    Response status: 500 useStripe.js:153:14
    Response data:
    Object { error: "Error interno del servidor", message: 'invalid input syntax for type uuid: "1"', details: {…} }
    useStripe.js:155:14
    ❌ Error creando sesión de checkout: Error: Error interno del servidor
        createCheckoutSession useStripe.js:158
        redirectToCheckout useStripe.js:190
        testQuickCheckout TestCart_pag.vue:297
        7 TestCart_pag.vue:144
        callWithErrorHandling runtime-core.esm-bundler.js:199
        callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
        invoker runtime-dom.esm-bundler.js:729
        addEventListener runtime-dom.esm-bundler.js:680
        patchEvent runtime-dom.esm-bundler.js:698
        patchProp runtime-dom.esm-bundler.js:775
        mountElement runtime-core.esm-bundler.js:4944
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        patchBlockChildren runtime-core.esm-bundler.js:5125
        patchElement runtime-core.esm-bundler.js:5043
        processElement runtime-core.esm-bundler.js:4902
        patch runtime-core.esm-bundler.js:4757
        componentUpdateFn runtime-core.esm-bundler.js:5479
        run reactivity.esm-bundler.js:237
        runIfDirty reactivity.esm-bundler.js:275
        callWithErrorHandling runtime-core.esm-bundler.js:199
        flushJobs runtime-core.esm-bundler.js:408
        promise callback*queueFlush runtime-core.esm-bundler.js:322
        queueJob runtime-core.esm-bundler.js:317
        scheduler runtime-core.esm-bundler.js:5521
        trigger reactivity.esm-bundler.js:265
        endBatch reactivity.esm-bundler.js:323
        noTracking reactivity.esm-bundler.js:919
        push reactivity.esm-bundler.js:816
        addToCart useStripe.js:74
        addTestProducts TestCart_pag.vue:254
        addTestProducts TestCart_pag.vue:253
        0 TestCart_pag.vue:40
        callWithErrorHandling runtime-core.esm-bundler.js:199
        callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
        invoker runtime-dom.esm-bundler.js:729
        addEventListener runtime-dom.esm-bundler.js:680
        patchEvent runtime-dom.esm-bundler.js:698
        patchProp runtime-dom.esm-bundler.js:775
        mountElement runtime-core.esm-bundler.js:4944
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
    useStripe.js:168:14
    ❌ Error en redirección a checkout: Error: Error interno del servidor
        createCheckoutSession useStripe.js:158
        redirectToCheckout useStripe.js:190
        testQuickCheckout TestCart_pag.vue:297
        7 TestCart_pag.vue:144
        callWithErrorHandling runtime-core.esm-bundler.js:199
        callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
        invoker runtime-dom.esm-bundler.js:729
        addEventListener runtime-dom.esm-bundler.js:680
        patchEvent runtime-dom.esm-bundler.js:698
        patchProp runtime-dom.esm-bundler.js:775
        mountElement runtime-core.esm-bundler.js:4944
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        patchBlockChildren runtime-core.esm-bundler.js:5125
        patchElement runtime-core.esm-bundler.js:5043
        processElement runtime-core.esm-bundler.js:4902
        patch runtime-core.esm-bundler.js:4757
        componentUpdateFn runtime-core.esm-bundler.js:5479
        run reactivity.esm-bundler.js:237
        runIfDirty reactivity.esm-bundler.js:275
        callWithErrorHandling runtime-core.esm-bundler.js:199
        flushJobs runtime-core.esm-bundler.js:408
        promise callback*queueFlush runtime-core.esm-bundler.js:322
        queueJob runtime-core.esm-bundler.js:317
        scheduler runtime-core.esm-bundler.js:5521
        trigger reactivity.esm-bundler.js:265
        endBatch reactivity.esm-bundler.js:323
        noTracking reactivity.esm-bundler.js:919
        push reactivity.esm-bundler.js:816
        addToCart useStripe.js:74
        addTestProducts TestCart_pag.vue:254
        addTestProducts TestCart_pag.vue:253
        0 TestCart_pag.vue:40
        callWithErrorHandling runtime-core.esm-bundler.js:199
        callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
        invoker runtime-dom.esm-bundler.js:729
        addEventListener runtime-dom.esm-bundler.js:680
        patchEvent runtime-dom.esm-bundler.js:698
        patchProp runtime-dom.esm-bundler.js:775
        mountElement runtime-core.esm-bundler.js:4944
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
        mountElement runtime-core.esm-bundler.js:4926
        processElement runtime-core.esm-bundler.js:4891
        patch runtime-core.esm-bundler.js:4757
        mountChildren runtime-core.esm-bundler.js:5003
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
    console.log('✅ Stripe events table created');

    // 6. Create shopping_carts table (for persistence)
    console.log('6. Creating shopping_carts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS shopping_carts (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, product_id)
      )
    `;
    console.log('✅ Shopping carts table created');

    // 7. Create indexes for optimization
    console.log('7. Creating indexes...');
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
    console.log('✅ Indexes created');

    // 8. Create function for generating order numbers
    console.log('8. Creating helper functions...');
    await sql`
      CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
      BEGIN
          RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('orders_id_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql;
    `;
    console.log('✅ Order number generator created');

    // 9. Create trigger function for updated_at
    console.log('9. Creating triggers...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Apply triggers to tables that need updated_at
    await sql`DROP TRIGGER IF EXISTS update_customers_updated_at ON customers`;
    await sql`CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_orders_updated_at ON orders`;
    await sql`CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;

    await sql`DROP TRIGGER IF EXISTS update_shopping_carts_updated_at ON shopping_carts`;
    await sql`CREATE TRIGGER update_shopping_carts_updated_at BEFORE UPDATE ON shopping_carts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`;
    console.log('✅ Triggers created');

    // 10. Verify all tables exist
    console.log('10. Verifying installation...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('customers', 'addresses', 'orders', 'order_items', 'stripe_events', 'shopping_carts')
      ORDER BY table_name
    `;

    console.log('\n📊 INSTALLATION SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (tables.length === 6) {
      console.log('✅ All Stripe tables created successfully!');
      console.log('✅ Tables created:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️  Some tables might not have been created:');
      console.log('Expected: customers, addresses, orders, order_items, stripe_events, shopping_carts');
      console.log('Found:', tables.map(t => t.table_name).join(', '));
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Test the Stripe integration');
    console.log('2. Configure Stripe webhooks');
    console.log('3. Test complete payment flow');

  } catch (error) {
    console.error('❌ Error creating Stripe tables:', error);
    console.error('Error details:', error.message);

    if (error.message.includes('permission denied')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your DATABASE_URL permissions');
      console.log('2. Verify your Neon database allows DDL operations');
    }

    process.exit(1);
  }
}

// Run the migration
addStripeTables()
  .then(() => {
    console.log('\n✅ Stripe tables migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
