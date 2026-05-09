import { NextFunction, Request, Response } from "express";
import { config } from "../config/config";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        data: err.data || null,
        error: err.error || [],
        stack: config.mode === "dev" ? err.stack : undefined,
    });
};