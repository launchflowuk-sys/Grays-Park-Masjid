import { Router, type IRouter } from "express";
import { eq, ne, and } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { AdminCreateUserBody, AdminUpdateUserBody } from "@workspace/api-zod";
import { hashPassword } from "../lib/auth";
import { requireAuth, requireRole } from "../middlewares/auth";
import { SUPER_ADMIN_ONLY } from "../lib/roles";

const router: IRouter = Router();

function toPublicAdminUser(admin: typeof adminUsersTable.$inferSelect) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    phone: admin.phone,
    active: admin.active,
    lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
    createdAt: admin.createdAt.toISOString(),
  };
}

async function countActiveSuperAdmins(excludeId?: string) {
  const rows = await db
    .select({ id: adminUsersTable.id })
    .from(adminUsersTable)
    .where(
      excludeId
        ? and(
            eq(adminUsersTable.role, "super_admin"),
            eq(adminUsersTable.active, true),
            ne(adminUsersTable.id, excludeId),
          )
        : and(eq(adminUsersTable.role, "super_admin"), eq(adminUsersTable.active, true)),
    );

  return rows.length;
}

router.get("/admin/users", requireAuth, requireRole(...SUPER_ADMIN_ONLY), async (_req, res) => {
  const admins = await db.select().from(adminUsersTable).orderBy(adminUsersTable.createdAt);
  res.status(200).json(admins.map(toPublicAdminUser));
});

router.post("/admin/users", requireAuth, requireRole(...SUPER_ADMIN_ONLY), async (req, res) => {
  const parsed = AdminCreateUserBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password, name, role, active, phone } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: adminUsersTable.id })
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, normalizedEmail))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [created] = await db
    .insert(adminUsersTable)
    .values({
      email: normalizedEmail,
      passwordHash,
      name,
      role,
      active: active ?? true,
      phone: phone ?? null,
    })
    .returning();

  res.status(201).json(toPublicAdminUser(created));
});

router.put("/admin/users/:id", requireAuth, requireRole(...SUPER_ADMIN_ONLY), async (req, res) => {
  const parsed = AdminUpdateUserBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const id = req.params.id as string;

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { name, role, active, password, phone } = parsed.data;

  const demotingFromSuperAdmin = existing.role === "super_admin" && role && role !== "super_admin";
  const deactivatingSuperAdmin = existing.role === "super_admin" && active === false;

  if ((demotingFromSuperAdmin || deactivatingSuperAdmin) && (await countActiveSuperAdmins(id)) === 0) {
    res.status(400).json({ error: "Cannot remove the last active super admin" });
    return;
  }

  const updates: Partial<typeof adminUsersTable.$inferInsert> = { updatedAt: new Date() };

  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (active !== undefined) updates.active = active;
  if (phone !== undefined) updates.phone = phone;
  if (password) updates.passwordHash = await hashPassword(password);

  const [updated] = await db
    .update(adminUsersTable)
    .set(updates)
    .where(eq(adminUsersTable.id, id))
    .returning();

  res.status(200).json(toPublicAdminUser(updated));
});

router.delete("/admin/users/:id", requireAuth, requireRole(...SUPER_ADMIN_ONLY), async (req, res) => {
  const id = req.params.id as string;

  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (existing.role === "super_admin" && existing.active && (await countActiveSuperAdmins(id)) === 0) {
    res.status(400).json({ error: "Cannot deactivate the last active super admin" });
    return;
  }

  await db
    .update(adminUsersTable)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(adminUsersTable.id, id));

  res.status(204).send();
});

export default router;
