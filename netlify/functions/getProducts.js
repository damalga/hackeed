import { neon } from '@netlify/neon';

export async function handler() {
  try {
    const sql = neon(); // usa NETLIFY_DATABASE_URL automáticamente
    const rows = await sql`
      SELECT sku, name, price_cents, stock, active
      FROM products
      WHERE active = true
      ORDER BY name
    `;
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
