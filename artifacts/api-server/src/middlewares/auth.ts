import type { Request, Response, NextFunction } from "express";
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from "../lib/auth";
import type { AdminRole } from "@workspace/db";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  req.admin = payload;
  next();
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}
