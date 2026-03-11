class ApiError extends Error {
    public statusCode: number;
    public success: false;
    public data: null;
    public error: unknown[];

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        data?: any,
        error?: any,
        stack?: string
    ) {
        super(message)

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.success = false,
            this.data = data,
            this.error = error

        if (stack) this.stack = stack
        else Error.captureStackTrace(this, this.constructor)
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            success: this.success,
            error: this.error,
            data: this.data
        }

    }
}

export default ApiError;