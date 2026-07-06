import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("CHECK-DB: DATABASE_URL is not set");
  process.exit(1);
}

const redacted = process.env.DATABASE_URL.replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@");
console.log(`CHECK-DB: connecting to ${redacted}`);

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const result = await client.query("select current_database(), current_user, version()");
  console.log("CHECK-DB: connection OK", result.rows[0]);
  await client.end();
  process.exit(0);
} catch (err) {
  console.error("CHECK-DB: connection FAILED");
  console.error(err);
  process.exit(1);
}
