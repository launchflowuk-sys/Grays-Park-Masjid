import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { adminUsersTable } from "./schema/admin-users.ts";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@graysparkmasjid.org.uk";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email))
    .limit(1);

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(adminUsersTable).values({
    email,
    passwordHash,
    name: "Super Admin",
    role: "super_admin",
    active: true,
  });

  console.log(`Seeded super admin user: ${email} / ${password}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
