import { Request, Response, NextFunction } from 'express';

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip, userAgent } = req;

  // Log request start
  console.log(`📥 ${method} ${originalUrl} - ${ip} - ${userAgent}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Determine log level based on status code
    let logLevel = 'info';
    if (statusCode >= 500) {
      logLevel = 'error';
    } else if (statusCode >= 400) {
      logLevel = 'warn';
    } else if (statusCode >= 300) {
      logLevel = 'info';
    }

    // Create log message
    const logMessage = `📤 ${method} ${originalUrl} - ${statusCode} - ${duration}ms`;

    // Log based on level
    switch (logLevel) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds

    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }

    // Log very slow requests
    if (duration > 5000) {
      console.error(`🚨 Very slow request: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] || generateRequestId();
  req.headers['x-request-id'] = id as string;
  res.setHeader('X-Request-ID', id);
  next();
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// API usage tracking middleware
export const apiUsageTracker = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl } = req;
  const endpoint = `${method} ${originalUrl}`;

  // Track API usage (you can extend this to store in database or analytics service)
  const usageData = {
    endpoint,
    method,
    url: originalUrl,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  };

  // Log API usage (in production, you might want to send this to an analytics service)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 API Usage:', usageData);
  }

  next();
};
