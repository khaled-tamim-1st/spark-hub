import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening in production-hardened mode");
});

let isShuttingDown = false;

function initiateGracefulShutdown(reason: string, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn({ reason, exitCode }, "Initiating graceful server shutdown...");

  // Force exit after 10 seconds if connections fail to drain
  const forceExitTimeout = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out after 10s. Forcing process exit.");
    process.exit(exitCode || 1);
  }, 10000);
  forceExitTimeout.unref();

  server.close(async (closeErr) => {
    if (closeErr) {
      logger.error({ closeErr }, "Error while closing HTTP server");
    } else {
      logger.info("HTTP server closed to new connections.");
    }

    try {
      await pool.end();
      logger.info("Database connection pool drained successfully.");
    } catch (dbErr) {
      logger.error({ dbErr }, "Error draining database pool");
    }

    process.exit(exitCode);
  });
}

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Fatal uncaughtException encountered: shutting down process cleanly");
  initiateGracefulShutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Fatal unhandledRejection encountered: shutting down process cleanly");
  initiateGracefulShutdown("unhandledRejection", 1);
});

process.on("SIGTERM", () => initiateGracefulShutdown("SIGTERM", 0));
process.on("SIGINT", () => initiateGracefulShutdown("SIGINT", 0));
