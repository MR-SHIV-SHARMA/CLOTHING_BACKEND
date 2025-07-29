import jwt from "jsonwebtoken";
import { User } from "../Models/userModels/user.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TwoFactorAuth } from "../utils/twoFactorAuth.js";
import crypto from "crypto";
import geoip from "geoip-lite";

/**
 * Enhanced authentication middleware with advanced security features
 */
export const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Get user with security-related fields
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new apiError(403, "Account is deactivated");
    }

    // Check if user account is suspended
    if (user.isSuspended) {
      throw new apiError(403, `Account suspended: ${user.suspensionReason || 'Violation of terms'}`);
    }

    // Check if account is locked
    if (user.accountLockout?.isLocked && user.accountLockout.lockUntil > new Date()) {
      const remainingTime = Math.ceil((user.accountLockout.lockUntil - new Date()) / 1000 / 60);
      throw new apiError(423, `Account locked. Try again in ${remainingTime} minutes`);
    }

    // Device and location tracking
    const currentIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const deviceFingerprint = crypto.createHash('sha256')
      .update(userAgent + currentIP)
      .digest('hex');

    // Check for suspicious activity (login from new device/location)
    const geo = geoip.lookup(currentIP);
    const isNewDevice = !user.activeSessions?.some(session => 
      session.deviceInfo === userAgent && session.ipAddress === currentIP
    );

    // Update or create session
    if (!user.activeSessions) {
      user.activeSessions = [];
    }

    const sessionIndex = user.activeSessions.findIndex(session => 
      session.deviceInfo === userAgent && session.ipAddress === currentIP
    );

    if (sessionIndex !== -1) {
      // Update existing session
      user.activeSessions[sessionIndex].lastActivity = new Date();
    } else {
      // Create new session if under limit
      const maxSessions = 5; // Maximum concurrent sessions
      if (user.activeSessions.length >= maxSessions) {
        // Remove oldest session
        user.activeSessions.sort((a, b) => a.lastActivity - b.lastActivity);
        user.activeSessions.shift();
      }

      // Add new session
      user.activeSessions.push({
        sessionId: crypto.randomUUID(),
        deviceInfo: userAgent,
        ipAddress: currentIP,
        lastActivity: new Date(),
        createdAt: new Date()
      });

      // Initialize security logs if not exists
      if (!user.securityLogs) {
        user.securityLogs = [];
      }

      // Log new device login
      user.securityLogs.push({
        action: 'login',
        timestamp: new Date(),
        ipAddress: currentIP,
        userAgent: userAgent,
        success: true
      });

      // Send notification for new device (implement email/SMS service)
      if (process.env.ENABLE_NEW_DEVICE_ALERTS === 'true') {
        console.log(`New device login detected for user ${user.email} from ${currentIP}`);
        // TODO: Send email/SMS notification
      }
    }

    // Save updated user data
    await user.save();

    // Add security context to request
    req.user = user;
    req.sessionInfo = {
      deviceFingerprint,
      isNewDevice,
      location: geo ? `${geo.city}, ${geo.country}` : 'Unknown',
      ipAddress: currentIP
    };

    next();
  } catch (error) {
    // Log failed authentication attempt
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.warn(`Failed authentication attempt from IP: ${req.ip}`);
    }
    
    throw new apiError(401, error?.message || "Invalid access token");
  }
});

/**
 * Optional authentication middleware (doesn't throw error if no token)
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (user && user.isActive && !user.isSuspended) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
});

/**
 * Two-factor authentication middleware
 */
export const twoFactorAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new apiError(401, "Authentication required");
  }

  // Skip 2FA for routes that don't require it
  const skipRoutes = ['/api/auth/2fa/setup', '/api/auth/2fa/verify'];
  if (skipRoutes.some(route => req.path.includes(route))) {
    return next();
  }

  // Check if 2FA is enabled for user
  if (req.user.twoFactorAuth?.enabled) {
    const twoFactorToken = req.get('X-2FA-Token');
    
    if (!twoFactorToken) {
      throw new apiError(403, "Two-factor authentication required");
    }

    // Verify 2FA token
    const isValid = TwoFactorAuth.verifyToken(twoFactorToken, req.user.twoFactorAuth.secret);
    
    if (!isValid) {
      // Log failed 2FA attempt
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          securityLogs: {
            action: '2fa_failed',
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            success: false
          }
        }
      });
      
      throw new apiError(403, "Invalid two-factor authentication code");
    }

    // Update last used timestamp
    await User.findByIdAndUpdate(req.user.id, {
      'twoFactorAuth.lastUsed': new Date()
    });
  }

  next();
});

/**
 * Admin-only authentication middleware
 */
export const adminAuth = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new apiError(401, "Authentication required");
  }

  if (!['admin', 'super-admin'].includes(req.user.role)) {
    throw new apiError(403, "Admin access required");
  }

  next();
});

/**
 * Session validation middleware
 */
export const validateSession = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const currentIP = req.ip;
  const userAgent = req.get('User-Agent');

  // Find current session
  const currentSession = req.user.activeSessions?.find(session => 
    session.deviceInfo === userAgent && session.ipAddress === currentIP
  );

  if (!currentSession) {
    throw new apiError(401, "Session not found or expired");
  }

  // Check session timeout (24 hours)
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  if (new Date() - currentSession.lastActivity > sessionTimeout) {
    // Remove expired session
    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        activeSessions: {
          sessionId: currentSession.sessionId
        }
      }
    });
    
    throw new apiError(401, "Session expired");
  }

  next();
});

/**
 * Permission-based middleware
 */
export const requirePermissions = (permissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new apiError(401, "Authentication required");
    }

    // Super admin has all permissions
    if (req.user.role === 'super-admin') {
      return next();
    }

    // Check if user has required permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new apiError(403, "Insufficient permissions");
    }

    next();
  });
};

/**
 * Rate limiting per user
 */
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 0, resetTime: now + windowMs });
    }

    const userLimit = userRequests.get(userId);

    // Reset if window has passed
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (userLimit.count >= maxRequests) {
      throw new apiError(429, "User rate limit exceeded");
    }

    userLimit.count++;
    next();
  });
};

/**
 * Device verification middleware
 */
export const deviceVerification = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const deviceId = req.get('X-Device-ID');
  const userAgent = req.get('User-Agent');
  const currentIP = req.ip;

  // Create device fingerprint
  const deviceFingerprint = crypto.createHash('sha256')
    .update(userAgent + currentIP + (deviceId || ''))
    .digest('hex');

  // Check if device is trusted
  const trustedDevices = req.user.trustedDevices || [];
  const isTrustedDevice = trustedDevices.some(device => 
    device.fingerprint === deviceFingerprint
  );

  if (!isTrustedDevice && process.env.REQUIRE_DEVICE_VERIFICATION === 'true') {
    // For sensitive operations, require device verification
    const sensitiveRoutes = ['/api/admin', '/api/payments', '/api/user/delete'];
    const isSensitiveRoute = sensitiveRoutes.some(route => req.path.startsWith(route));

    if (isSensitiveRoute) {
      throw new apiError(403, "Device verification required for this action");
    }
  }

  req.deviceFingerprint = deviceFingerprint;
  req.isTrustedDevice = isTrustedDevice;

  next();
});

// Export default as the main auth middleware for backward compatibility
export default authMiddleware;
