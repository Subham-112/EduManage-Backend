import { NextFunction, Request, Response } from "express";

export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const now = new Date();
    const timeInAMPM = now.toLocaleTimeString("en-US", { hour12: true });
    const day = now.toLocaleDateString("en-US", { weekday: "short" });
    const date = now.toLocaleDateString("en-US");
    const month = now.toLocaleDateString("en-US", { month: "short" });
    const year = now.getFullYear();

    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2); // Convert to milliseconds

    console.log(
      `${timeInAMPM} ${day} ${date} ${month} ${year} || METHOD: ${req.method} | URL: ${req.originalUrl} | STATUS: ${res.statusCode} | Response time: ${duration}ms`,
    );
  });

  next();
};
