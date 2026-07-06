import { Router, type IRouter } from "express";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, adminUsersTable, passwordResetTokensTable } from "@workspace/db";
import { LoginBody, ForgotPasswordBody, ResetPasswordBody } from "@workspace/api-zod";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  hashPassword,
  signAuthToken,
  verifyPassword,
} from "../lib/auth";
import { sendPasswordResetEmail } from "../lib/mail";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function toPublicAdminUser(admin: typeof adminUsersTable.$inferSelect) {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    active: admin.active,
    lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
    createdAt: admin.createdAt.toISOString(),
  };
}

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;

  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase()))
    .limit(1);

  if (!admin || !admin.active) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const validPassword = await verifyPassword(password, admin.passwordHash);

  if (!validPassword) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signAuthToken({ sub: admin.id, email: admin.email, role: admin.role });
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

  await db
    .update(adminUsersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsersTable.id, admin.id));

  res.status(200).json(toPublicAdminUser(admin));
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  res.status(204).send();
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.admin!.sub))
    .limit(1);

  if (!admin || !admin.active) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.status(200).json(toPublicAdminUser(admin));
});

router.post("/auth/forgot-password", async (req, res) => {
  const parsed = ForgotPasswordBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email } = parsed.data;

  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase()))
    .limit(1);

  if (admin && admin.active) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokensTable).values({
      adminUserId: admin.id,
      token,
      expiresAt,
    });

    const appBaseUrl = process.env.APP_BASE_URL ?? "";
    const resetUrl = `${appBaseUrl}/admin/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(admin.email, resetUrl);
    } catch (err) {
      logger.error({ err }, "Failed to send password reset email");
    }
  }

  // Always return 204 regardless of whether the account exists, to avoid leaking which emails are registered.
  res.status(204).send();
});

router.post("/auth/reset-password", async (req, res) => {
  const parsed = ResetPasswordBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { token, password } = parsed.data;

  const [resetToken] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token))
    .limit(1);

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: "Invalid or expired token" });
    return;
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(adminUsersTable)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsersTable.id, resetToken.adminUserId));

  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.id, resetToken.id));

  res.status(204).send();
});

export default router;
