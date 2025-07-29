import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import { apiError } from '../utils/apiError.js';
import { User } from '../Models/userModels/user.models.js';
import crypto from 'crypto';
import geoip from 'geoip-lite';

/**
 * Advanced Security Configuration
 */
export class SecurityMiddleware {
  
  /**
   * Helmet configuration for security headers
   */
  static helmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.stripe.com"],
          scriptSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
          connectSrc: ["'self'", "https://api.stripe.com", "https://*.google-analytics.com"],
          frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Advanced CORS configuration
   */
  static corsConfig() {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yourapp.com',
      'https://admin.yourapp.com'
    ].filter(Boolean);

    return cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        return callback(new apiError(403, 'Not allowed by CORS policy'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Forwarded-For',
        'X-Real-IP',
        'User-Agent'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400 // 24 hours
    });
  }

  /**
   * Advanced rate limiting with different tiers
   */
  static rateLimitConfig() {
    const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
      return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        keyGenerator: (req) => {
          return req.ip + ':' + (req.user?.id || 'anonymous');
        },
        skip: (req) => {
          // Skip rate limiting for trusted IPs or specific user roles
          const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
          if (trustedIPs.includes(req.ip)) return true;
          
          // Skip for admin users
          if (req.user?.role === 'super-admin') return true;
          
          return false;
        },
        onLimitReached: async (req, res, options) => {
          // Log rate limit violations
          console.warn(`Rate limit exceeded for IP: ${req.ip}, User: ${req.user?.id || 'anonymous'}`);
          
          // Update user security logs if authenticated
          if (req.user) {
            await User.findByIdAndUpdate(req.user.id, {
              $push: {
                securityLogs: {
                  action: 'rate_limit_exceeded',
                  timestamp: new Date(),
                  ipAddress: req.ip,
                  userAgent: req.get('User-Agent'),
                  success: false
                }
              }
            });
          }
        }
      });
    };

    return {
      // Global rate limit
      global: createRateLimit(15 * 60 * 1000, 1000, 'Too many requests, please try again later'), // 1000 requests per 15 minutes
      
      // Authentication endpoints
      auth: createRateLimit(15 * 60 * 1000, 20, 'Too many authentication attempts, please try again later'), // 20 requests per 15 minutes
      
      // API endpoints
      api: createRateLimit(15 * 60 * 1000, 500, 'API rate limit exceeded'), // 500 requests per 15 minutes
      
      // Upload endpoints
      upload: createRateLimit(60 * 60 * 1000, 50, 'Too many upload attempts'), // 50 uploads per hour
      
      // Search endpoints
      search: createRateLimit(5 * 60 * 1000, 100, 'Search rate limit exceeded'), // 100 searches per 5 minutes
      
      // Password reset
      passwordReset: createRateLimit(60 * 60 * 1000, 5, 'Too many password reset attempts'), // 5 attempts per hour
    };
  }

  /**
   * Slow down middleware for gradual response delays
   */
  static slowDownConfig() {
    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 100, // Allow 100 requests at full speed
      delayMs: 500, // Add 500ms delay per request after delayAfter
      maxDelayMs: 20000, // Maximum delay of 20 seconds
      skipSuccessfulRequests: true
    });
  }

  /**
   * Request sanitization
   */
  static sanitizeRequest() {
    return [
      // MongoDB injection protection
      mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
          console.warn(`Potential MongoDB injection attempt: ${key} from IP: ${req.ip}`);
        }
      }),
      
      // XSS protection
      xss(),
      
      // HTTP Parameter Pollution protection
      hpp({
        whitelist: ['sort', 'fields', 'page', 'limit', 'filter']
      })
    ];
  }

  /**
   * IP-based security checks
   */
  static ipSecurityCheck() {
    return async (req, res, next) => {
      try {
        const clientIP = req.ip || req.connection.remoteAddress;
        const forwardedIPs = req.get('X-Forwarded-For');
        
        // Check for malicious IPs (implement your blacklist logic)
        const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
        if (blacklistedIPs.includes(clientIP)) {
          throw new apiError(403, 'Access denied from this IP address');
        }

        // Geo-location check (optional)
        if (process.env.ENABLE_GEO_BLOCKING === 'true') {
          const geo = geoip.lookup(clientIP);
          const allowedCountries = process.env.ALLOWED_COUNTRIES?.split(',') || [];
          
          if (geo && allowedCountries.length > 0 && !allowedCountries.includes(geo.country)) {
            throw new apiError(403, 'Access denied from your location');
          }
        }

        // Add IP info to request
        req.clientGeo = geoip.lookup(clientIP);
        req.clientIP = clientIP;
        
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Request signature validation
   */
  static requestSignatureValidation() {
    return (req, res, next) => {
      // Only validate signatures for sensitive endpoints
      const sensitiveEndpoints = ['/api/admin', '/api/payments', '/api/webhooks'];
      const requiresSignature = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));
      
      if (!requiresSignature) {
        return next();
      }

      const signature = req.get('X-Signature');
      const timestamp = req.get('X-Timestamp');
      
      if (!signature || !timestamp) {
        return next(new apiError(400, 'Missing request signature or timestamp'));
      }

      // Check timestamp (prevent replay attacks)
      const requestTime = parseInt(timestamp);
      const currentTime = Date.now();
      const timeDifference = Math.abs(currentTime - requestTime);
      
      if (timeDifference > 300000) { // 5 minutes
        return next(new apiError(400, 'Request timestamp too old'));
      }

      // Validate signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.REQUEST_SIGNATURE_SECRET)
        .update(timestamp + JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        return next(new apiError(400, 'Invalid request signature'));
      }

      next();
    };
  }

  /**
   * Brute force protection
   */
  static bruteForceProtection() {
    const attemptsByIP = new Map();
    const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
    const MAX_ATTEMPTS = 10;
    const LOCKOUT_TIME = 60 * 60 * 1000; // 1 hour

    return async (req, res, next) => {
      const key = req.ip + ':' + req.path;
      const now = Date.now();
      
      if (!attemptsByIP.has(key)) {
        attemptsByIP.set(key, { attempts: 0, firstAttempt: now, lockedUntil: 0 });
      }

      const attempts = attemptsByIP.get(key);

      // Check if still locked out
      if (attempts.lockedUntil > now) {
        const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
        throw new apiError(429, `Too many failed attempts. Try again in ${remainingTime} minutes`);
      }

      // Reset attempts if window has passed
      if (now - attempts.firstAttempt > ATTEMPT_WINDOW) {
        attempts.attempts = 0;
        attempts.firstAttempt = now;
        attempts.lockedUntil = 0;
      }

      // Check if max attempts reached
      if (attempts.attempts >= MAX_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_TIME;
        throw new apiError(429, 'Too many failed attempts. Account temporarily locked');
      }

      // Increment on failed requests (handled in error middleware)
      req.bruteForceKey = key;
      req.bruteForceAttempts = attempts;

      next();
    };
  }

  /**
   * Session security
   */
  static sessionSecurity() {
    return async (req, res, next) => {
      if (!req.user) return next();

      try {
        // Check for concurrent sessions
        const user = await User.findById(req.user.id);
        if (!user) {
          throw new apiError(401, 'User not found');
        }

        // Check if account is suspended
        if (user.isSuspended) {
          throw new apiError(403, 'Account suspended: ' + (user.suspensionReason || 'Violation of terms'));
        }

        // Check for account lockout
        if (user.accountLockout?.isLocked && user.accountLockout.lockUntil > new Date()) {
          const remainingTime = Math.ceil((user.accountLockout.lockUntil - new Date()) / 1000 / 60);
          throw new apiError(423, `Account locked. Try again in ${remainingTime} minutes`);
        }

        // Update last activity
        await User.findByIdAndUpdate(req.user.id, {
          $set: {
            'activeSessions.$.lastActivity': new Date()
          }
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Content Security Policy for file uploads
   */
  static fileUploadSecurity() {
    return (req, res, next) => {
      if (!req.files && !req.file) return next();

      const files = req.files || [req.file];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new apiError(400, 'Invalid file type. Only images are allowed');
        }

        if (file.size > maxSize) {
          throw new apiError(400, 'File too large. Maximum size is 10MB');
        }

        // Check for malicious content in filename
        if (/[<>:"/\\|?*\x00-\x1f]/.test(file.originalname)) {
          throw new apiError(400, 'Invalid filename');
        }
      }

      next();
    };
  }

  /**
   * API Key validation
   */
  static apiKeyValidation() {
    return (req, res, next) => {
      const apiKey = req.get('X-API-Key');
      
      // Skip API key validation for public endpoints
      const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/products'];
      if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        return next();
      }

      if (!apiKey) {
        return next(new apiError(401, 'API key required'));
      }

      // Validate API key format
      if (!/^[a-f0-9]{64}$/.test(apiKey)) {
        return next(new apiError(401, 'Invalid API key format'));
      }

      // TODO: Implement API key validation against database
      next();
    };
  }

  /**
   * Security headers middleware
   */
  static securityHeaders() {
    return (req, res, next) => {
      // Remove server information
      res.removeHeader('X-Powered-By');
      
      // Add custom security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
      
      next();
    };
  }

  /**
   * Request logging for security monitoring
   */
  static securityLogging() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log security-relevant requests
      const securityEndpoints = ['/api/auth', '/api/admin', '/api/payments'];
      const isSecurityEndpoint = securityEndpoints.some(endpoint => req.path.startsWith(endpoint));
      
      if (isSecurityEndpoint) {
        console.log(`[SECURITY] ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?.id || 'anonymous'} - UA: ${req.get('User-Agent')}`);
      }

      // Monitor response for potential security issues
      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Log slow requests (potential DoS)
        if (duration > 5000) {
          console.warn(`[SECURITY] Slow request detected: ${req.method} ${req.path} - ${duration}ms - IP: ${req.ip}`);
        }

        // Log error responses
        if (res.statusCode >= 400) {
          console.warn(`[SECURITY] Error response: ${res.statusCode} - ${req.method} ${req.path} - IP: ${req.ip}`);
        }

        originalSend.call(this, data);
      };

      next();
    };
  }
}

/**
 * Compression middleware with security considerations
 */
export const secureCompression = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Don't compress responses that may contain sensitive data
    if (req.path.includes('admin') || req.path.includes('payment')) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Export all security middlewares
 */
export const securityMiddlewares = {
  helmet: SecurityMiddleware.helmetConfig(),
  cors: SecurityMiddleware.corsConfig(),
  rateLimits: SecurityMiddleware.rateLimitConfig(),
  slowDown: SecurityMiddleware.slowDownConfig(),
  sanitize: SecurityMiddleware.sanitizeRequest(),
  ipSecurity: SecurityMiddleware.ipSecurityCheck(),
  requestSignature: SecurityMiddleware.requestSignatureValidation(),
  bruteForce: SecurityMiddleware.bruteForceProtection(),
  sessionSecurity: SecurityMiddleware.sessionSecurity(),
  fileUploadSecurity: SecurityMiddleware.fileUploadSecurity(),
  apiKeyValidation: SecurityMiddleware.apiKeyValidation(),
  securityHeaders: SecurityMiddleware.securityHeaders(),
  securityLogging: SecurityMiddleware.securityLogging(),
  compression: secureCompression
};
