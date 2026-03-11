import chalk from "chalk";
import winston from "winston";
import path from "path";

// Custom format for winston logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const coloredLevel = colorizeLevel(level);
    return `${chalk.gray(timestamp)} ${coloredLevel} ${message}${stack ? "\n" + stack : ""}`;
  })
);

// Function to colorize log levels
function colorizeLevel(level: string): string {
  switch (level) {
    case "error":
      return chalk.bgRed.white(` ${level.toUpperCase()} `);
    case "warn":
      return chalk.bgYellow.black(` ${level.toUpperCase()} `);
    case "info":
      return chalk.bgBlue.white(` ${level.toUpperCase()} `);
    case "debug":
      return chalk.bgCyan.black(` ${level.toUpperCase()} `);
    default:
      return chalk.bgGray.white(` ${level.toUpperCase()} `);
  }
}

// Create Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      const coloredLevel = colorizeLevel(level);
      return `${chalk.gray(timestamp)} ${coloredLevel} ${message}${stack ? "\n" + stack : ""}`;
    })
  ),
  defaultMeta: { service: "edumanage-api" },
  transports: [
    // Console transport with color support
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          const coloredLevel = colorizeLevel(level);
          return `${chalk.gray(timestamp)} ${coloredLevel} ${message}${stack ? "\n" + stack : ""}`;
        })
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
    }),
  ],
});

// Chalk-based utility functions for quick coloring
export const logColors = {
  success: (msg: string) => chalk.green(msg),
  error: (msg: string) => chalk.red(msg),
  warning: (msg: string) => chalk.yellow(msg),
  info: (msg: string) => chalk.blue(msg),
  debug: (msg: string) => chalk.cyan(msg),
  highlight: (msg: string) => chalk.magenta(msg),
  success_bg: (msg: string) => chalk.bgGreen.black(msg),
  error_bg: (msg: string) => chalk.bgRed.white(msg),
  warning_bg: (msg: string) => chalk.bgYellow.black(msg),
  info_bg: (msg: string) => chalk.bgBlue.white(msg),
};
