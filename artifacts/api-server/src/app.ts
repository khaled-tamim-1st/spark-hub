import express, { type Express, type Request, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import router from "./routes";
import renderRouter from "./render/routes";
import sitemapRouter from "./render/sitemap";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import { globalApiLimiter } from "./middleware/rateLimiter";

const app: Express = express();

// Trust reverse proxy (Cloudflare Worker / Edge gateway)
app.set("trust proxy", 1);

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

// 1. Mount Clerk proxy for production custom domains before body parsers
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// 2. Strict CORS whitelist - Reject arbitrary origin reflections
const ALLOWED_ORIGINS = new Set([
  "https://spark-hub.online",
  "https://www.spark-hub.online",
  ...(process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
      ]
    : []),
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. server-side requests, curl, mobile clients)
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);

// 3. Strict body parser limits (Max 100kb payload to prevent memory exhaustion / DoS)
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// 7. Clerk authentication session parser
app.use(clerkMiddleware());

// 8. Application routes with rate limiting
app.use("/api", globalApiLimiter, router);
app.use("/render", renderRouter);
app.use(sitemapRouter);

// 9. Centralized Error Handling Middleware
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err?.message?.includes("CORS blocked")) {
    res.status(403).json({ error: "Forbidden: Origin not allowed by CORS policy" });
    return;
  }

  if (err.type === "entity.too.large" || err.status === 413) {
    res.status(413).json({ error: "Payload Too Large: Maximum allowed body size is 100kb" });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Malformed JSON payload in request body" });
    return;
  }

  logger.error(
    {
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      path: req.path,
      method: req.method,
    },
    "Unhandled express route error",
  );

  const statusCode = typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(statusCode).json({
    error:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : err.message || "Unknown error",
  });
};

app.use(errorHandler);

export { isAuthorizedAdmin } from "./middleware/auth";
export default app;