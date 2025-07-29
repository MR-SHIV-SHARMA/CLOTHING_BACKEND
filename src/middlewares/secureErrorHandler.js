import { apiError } from '../utils/apiError.js';

/**
 * Enhanced error handling middleware with security considerations
 */
export const secureErrorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError instances to ApiError
  if (!(error instanceof apiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || "Internal Server Error";
    error = new apiError(statusCode, message);
  }

  // Security-focused error handling
  let response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  };

  // Sanitize error messages in production
  if (process.env.NODE_ENV === 'production') {
    // Don't expose sensitive information in production
    switch (error.statusCode) {
      case 400:
        response.message = 'Bad Request';
        break;
      case 401:
        response.message = 'Authentication required';
        break;
      case 403:
        response.message = 'Access denied';
        break;
      case 404:
        response.message = 'Resource not found';
        break;
      case 429:
        response.message = 'Too many requests';
        break;
      case 500:
      default:
        response.message = 'Internal server error';
        break;
    }
  }

  // Log security-related errors
  const securityErrorCodes = [401, 403, 429];
  if (securityErrorCodes.includes(error.statusCode)) {
    console.warn(`[SECURITY ERROR] ${error.statusCode} - ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?.id || 'anonymous'} - UA: ${req.get('User-Agent')}`);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // MongoDB validation error
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new apiError(400, `Validation Error: ${message}`);
    response.message = process.env.NODE_ENV === 'production' ? 'Invalid input data' : message;
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new apiError(400, message);
    response.message = process.env.NODE_ENV === 'production' ? 'Duplicate entry' : message;
  }

  if (err.name === 'JsonWebTokenError') {
    error = new apiError(401, 'Invalid token');
    response.message = 'Authentication failed';
  }

  if (err.name === 'TokenExpiredError') {
    error = new apiError(401, 'Token expired');
    response.message = 'Authentication expired';
  }

  if (err.name === 'CastError') {
    error = new apiError(400, 'Invalid ID format');
    response.message = 'Invalid resource ID';
  }

  // Rate limiting errors
  if (err.status === 429) {
    response.message = 'Too many requests, please try again later';
    response.retryAfter = err.retryAfter;
  }

  // Update brute force attempts on authentication failures
  if (error.statusCode === 401 && req.bruteForceKey && req.bruteForceAttempts) {
    req.bruteForceAttempts.attempts++;
  }

  // Remove stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete response.stack;
  }

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  res.status(error.statusCode || 500).json(response);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = new apiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = (server) => {
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
      }, 10000);
    });
  });
};
