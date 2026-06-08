export class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.stack || err.message}`);

  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || [];

  // Prisma Error Handling
  if (err.code && err.code.startsWith('P')) {
    code = `DB_${err.code}`;
    if (err.code === 'P2002') {
      statusCode = 400;
      message = 'A resource with this identifier already exists';
      if (err.meta && err.meta.target) {
        details = err.meta.target.map(field => ({ field, message: `${field} must be unique` }));
      }
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Foreign key constraint failed';
    } else {
      statusCode = 400;
      message = 'Database operation failed';
    }
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    code = 'EXPIRED_TOKEN';
  }

  res.status(statusCode).json({
    error: message,
    code,
    ...(details.length > 0 && { details })
  });
};
