const { Client } = require('pg');
require('dotenv').config({ path: 'grabrentals-backend/.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/grabrentals'
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT booking_reference, invoice_pdf_url, status, created_at FROM bookings ORDER BY created_at DESC LIMIT 5");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end();
});

