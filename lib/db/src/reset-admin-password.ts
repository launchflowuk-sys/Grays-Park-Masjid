import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { adminUsersTable } from "./schema/admin-users.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("RESET-ADMIN: DATABASE_URL is not set");
  process.exit(1);
}

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@graysparkmasjid.org.uk";
const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

try {
  const passwordHash = await bcrypt.hash(password, 12);

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(adminUsersTable)
      .set({ passwordHash, active: true, updatedAt: new Date() })
      .where(eq(adminUsersTable.email, email));
    console.log(`RESET-ADMIN: password reset for existing admin ${email}`);
  } else {
    await db.insert(adminUsersTable).values({
      email,
      passwordHash,
      name: "Super Admin",
      role: "super_admin",
      active: true,
    });
    console.log(`RESET-ADMIN: created new admin ${email}`);
  }

  console.log(`RESET-ADMIN: login with ${email} / ${password}`);
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error("RESET-ADMIN: FAILED");
  console.error(err);
  process.exit(1);
}
