const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB');

  const blogs = await client.query('SELECT id, slug, title, category, published_at, excerpt, image_url, image_alt FROM spark_blog_posts ORDER BY id ASC');
  console.log('\n=== BLOG POSTS (' + blogs.rows.length + ') ===');
  for (const b of blogs.rows) {
    console.log(JSON.stringify(b, null, 2));
  }

  const services = await client.query('SELECT id, title, category, summary, details, display_order FROM spark_services ORDER BY display_order ASC');
  console.log('\n=== SERVICES (' + services.rows.length + ') ===');
  for (const s of services.rows) {
    console.log(JSON.stringify(s, null, 2));
  }

  const cases = await client.query('SELECT id, slug, title, client, category, summary, metric FROM spark_case_studies ORDER BY display_order ASC');
  console.log('\n=== CASE STUDIES (' + cases.rows.length + ') ===');
  for (const c of cases.rows) {
    console.log(JSON.stringify(c, null, 2));
  }

  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log('\n=== TABLES ===');
  console.log(tables.rows.map(r => r.table_name));

  await client.end();
}

main().catch(console.error);
