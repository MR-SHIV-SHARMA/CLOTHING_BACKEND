import { apiError } from "../utils/apiError.js";

/**
 * API Versioning Middleware
 * Supports versioning through:
 * 1. URL path: /api/v1/products, /api/v2/products
 * 2. Accept header: Accept: application/vnd.clothing-api.v1+json
 * 3. Custom header: X-API-Version: v1
 */

const SUPPORTED_VERSIONS = ['v1', 'v2'];
const DEFAULT_VERSION = 'v1';

export const apiVersioning = (req, res, next) => {
  let version = DEFAULT_VERSION;

  // 1. Check URL path for version
  const urlVersionMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (urlVersionMatch) {
    version = urlVersionMatch[1];
  }
  
  // 2. Check Accept header
  else if (req.get('Accept')) {
    const acceptVersionMatch = req.get('Accept').match(/application\/vnd\.clothing-api\.(v\d+)\+json/);
    if (acceptVersionMatch) {
      version = acceptVersionMatch[1];
    }
  }
  
  // 3. Check custom header
  else if (req.get('X-API-Version')) {
    version = req.get('X-API-Version');
  }

  // Validate version
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return next(new apiError(400, `API version ${version} is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`));
  }

  // Set version in request object
  req.apiVersion = version;
  
  // Set response headers
  res.set('X-API-Version', version);
  res.set('X-Supported-Versions', SUPPORTED_VERSIONS.join(', '));

  next();
};

/**
 * Version-specific route handler
 * Usage: versionHandler({ v1: handlerV1, v2: handlerV2 })
 */
export const versionHandler = (handlers) => {
  return (req, res, next) => {
    const version = req.apiVersion || DEFAULT_VERSION;
    const handler = handlers[version];
    
    if (!handler) {
      return next(new apiError(501, `Handler for API version ${version} is not implemented`));
    }
    
    return handler(req, res, next);
  };
};

/**
 * Deprecation warning middleware
 */
export const deprecationWarning = (version, deprecationDate, alternativeVersion) => {
  return (req, res, next) => {
    if (req.apiVersion === version) {
      res.set('Warning', `299 - "API version ${version} is deprecated and will be removed on ${deprecationDate}. Please use ${alternativeVersion}"`);
      res.set('Sunset', deprecationDate);
    }
    next();
  };
};