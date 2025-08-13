import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler';

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for certain routes
  const skipValidationRoutes = [
    '/health',
    '/webhook',
    '/api/v1/docs',
    '/docs',
  ];

  if (skipValidationRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  // Get API key from headers or query parameters
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  // If no API key is provided, continue (for backward compatibility)
  if (!apiKey) {
    return next();
  }

  // Validate API key format
  if (typeof apiKey !== 'string' || apiKey.length < 10) {
    throw new ApiError(
      'Invalid API key format',
      401,
      true,
      'INVALID_API_KEY_FORMAT',
    );
  }

  // In production, you would validate against a database or external service
  // For now, we'll use a simple validation
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (process.env.NODE_ENV === 'production' && !validApiKeys.includes(apiKey)) {
    throw new ApiError(
      'Invalid API key',
      401,
      true,
      'INVALID_API_KEY',
    );
  }

  // Add API key to request for logging purposes
  req.apiKey = apiKey;

  next();
};

// Enhanced API key validation with rate limiting per key
export const validateApiKeyWithRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return next();
  }

  // Basic validation
  if (typeof apiKey !== 'string' || apiKey.length < 10) {
    throw new ApiError(
      'Invalid API key format',
      401,
      true,
      'INVALID_API_KEY_FORMAT',
    );
  }

  // Add API key to request
  req.apiKey = apiKey;

  // Rate limiting per API key could be implemented here
  // For now, we'll just pass through
  next();
};

// API key validation for admin routes
export const validateAdminApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    throw new ApiError(
      'API key required for admin operations',
      401,
      true,
      'API_KEY_REQUIRED',
    );
  }

  // Validate admin API key
  const adminApiKeys = process.env.ADMIN_API_KEYS?.split(',') || [];
  
  if (!adminApiKeys.includes(apiKey as string)) {
    throw new ApiError(
      'Invalid admin API key',
      403,
      true,
      'INVALID_ADMIN_API_KEY',
    );
  }

  req.apiKey = apiKey as string;
  next();
};

// API key validation for public routes (optional)
export const validatePublicApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  // Public routes don't require API key, but if provided, validate it
  if (apiKey) {
    if (typeof apiKey !== 'string' || apiKey.length < 10) {
      throw new ApiError(
        'Invalid API key format',
        401,
        true,
        'INVALID_API_KEY_FORMAT',
      );
    }

    req.apiKey = apiKey;
  }

  next();
};
