import { NextFunction, Request, Response } from "express";
import { config } from "../config/config";
import { logger, logColors } from "../utils/logger.util";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") {
        statusCode = 400,
            message = `Invalid ${err.path}: ${err.value}`;
    }

    logger.error(
        `${logColors.error_bg(`Error on ${req.method} ${req.originalUrl}`)} - Status ${statusCode} - Message ${message}`
    );

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.error && { errors: err.error }),
        ...(config.env === "dev" && { stack: err.stack }),
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    })
}

export default globalErrorHandler;