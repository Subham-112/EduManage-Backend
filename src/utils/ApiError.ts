class ApiError extends Error {
  public success: boolean;
  public statusCode: number;
  public data: any;
  public error: unknown[];

  constructor(
    statusCode: number,
    message: string,
    data: any = null,
    error: unknown[] = [],
    stack?: string,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.success = false;
    this.statusCode = statusCode;
    this.data = data;
    this.error = error;

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      error: this.error,
    };
  }
}

export default ApiError;
