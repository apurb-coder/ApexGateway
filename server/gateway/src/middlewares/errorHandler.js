export class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_GATEWAY_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, _req, res, _next) => {
  console.error(`[Gateway Error] ${err.stack || err.message}`);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Gateway Error';
  let code = err.code || 'INTERNAL_GATEWAY_ERROR';

  // Customize standard errors
  if (err.name === 'PrismaClientInitializationError' || err.name === 'PrismaClientKnownRequestError') {
    statusCode = 500;
    message = 'Gateway database connectivity error';
    code = 'GATEWAY_DB_ERROR';
  }

  res.status(statusCode).json({
    error: message,
    code
  });
};
