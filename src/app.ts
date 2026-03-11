import Express from "express";
import cors from "cors";
import connectDB from "./config/mongodb";
import { router } from "./routes/index";
import { config } from "./config/config";
import { corsOptions } from "./middlewares/cors.middleware";
import { notFoundHandler } from "./middlewares/notFoundError";
import { createServer, Server as HttpServer } from "http";
import globalErrorHandler from "./middlewares/errorHandler";
import chalk from "chalk";
import { logger, logColors } from "./utils/logger.util";

const app = Express();
const httpServer: HttpServer = createServer(app);

app.use(Express.json({ limit: "100mb" }));
app.use(Express.urlencoded({ extended: true, limit: "100mb" }));
if (config.cors.enable) app.use(cors(corsOptions));
else logger.warn(logColors.warning_bg("⚠️  CORS is disabled by config"));

app.use(
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const startTime = process.hrtime();

    res.on("finish", () => {
      const diff = process.hrtime(startTime);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

      // Color code based on status
      const getStatusColor = (code: number) => {
        if (code >= 500) return chalk.red.bold;
        if (code >= 400) return chalk.yellow.bold;
        if (code >= 300) return chalk.cyan.bold;
        return chalk.green.bold;
      };

      // Color code based on method
      const getMethodColor = (method: string) => {
        const colors: { [key: string]: Function } = {
          GET: chalk.blue.bold,
          POST: chalk.green.bold,
          PUT: chalk.yellow.bold,
          PATCH: chalk.magenta.bold,
          DELETE: chalk.red.bold,
        };
        return colors[method] || chalk.white.bold;
      };

      const coloredMethod = getMethodColor(req.method)(req.method.padEnd(6));
      const coloredUrl = chalk.cyan(req.originalUrl);
      const coloredStatus = getStatusColor(res.statusCode)(String(res.statusCode).padEnd(3));
      const coloredTime = chalk.magenta(`${responseTime}ms`);

      const logMessage = `${coloredMethod} ${coloredUrl} │ ${coloredStatus} │ ${coloredTime}`;
      logger.info(logMessage);
    });
    next();
  },
);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    httpServer.listen(config.port, () => {
      logger.info(
        logColors.success(
          `🚀 Server is running at http://localhost:${config.port}`,
        ),
      );
    });
  } catch (err: any) {
    logger.error(logColors.error_bg(`❌ Failed to start the server: ${err.message}`));
    process.exit(1);
  }
};

const shutdown = (): void => {
  logger.info(logColors.warning("🛑 Shutting down the server..."));

  httpServer.close(() => {
    logger.info(logColors.success("✓ Server closed gracefully."));
    process.exit(0);
  });

  // Force shutdown after 10 seconds if it doesn't shut down properly
  setTimeout(() => {
    logger.error(logColors.error_bg("⚠️  Forcing shutdown after timeout."));
    process.exit(1);
  }, 10000).unref(); // Prevent blocking the event loop
};

app.use("/api", router);

app.use(notFoundHandler);
app.use(globalErrorHandler);

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer();
