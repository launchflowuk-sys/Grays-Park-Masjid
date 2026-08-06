import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Behind exactly two proxies (Coolify's Traefik -> nginx in this compose
// stack); needed for correct client IPs in rate limiting. Do not use `true`
// here — it lets clients spoof X-Forwarded-For past the rate limiter.
app.set("trust proxy", 2);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? process.env.APP_BASE_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Brute-force protection on credentials and payment endpoints; a looser
// cap on the public forms that fan out to email/SMS notifications.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false });
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
});

app.use("/api/auth", authLimiter);
app.use("/api/donations/checkout", checkoutLimiter);
app.use(["/api/enquiries", "/api/members", "/api/volunteer-applications", "/api/course-registrations"], formLimiter);

app.use("/api", router);

// Central error handler: log everything, leak nothing.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled error");
  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

export default app;
