import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { closeRedisConnection } from './middleware/cache';
import { clerkMiddleware } from '@clerk/express';
import env from './config/env';

// Routes
import cityRoutes from './routes/city-routes';
import locationRoutes from './routes/location-routes';
import categoryRoutes from './routes/category-routes';
import userRoutes from './routes/user-routes';
import questionRoutes from './routes/question-routes';
import answerRoutes from './routes/answer-routes';
import imageRoutes from './routes/image-routes';
import healthRoutes from './routes/health-routes';
import webhookRoutes from './routes/webhook-routes';
import voteRoutes from './routes/vote-routes';

// Custom middleware
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { validateApiKey } from './middleware/api-key-validation';

const app = express();
const port = env.PORT;

// Security middleware (should be first)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except health check
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  return limiter(req, res, next);
});

// Webhook routes (before JSON parsing to preserve raw body)
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://udruga-liberato.hr', 'https://www.udruga-liberato.hr']
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-API-Key',
      'Accept',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  }),
);

// Request logging middleware
app.use(requestLogger);

// API key validation for protected routes
app.use(validateApiKey);

// Clerk authentication middleware
app.use(clerkMiddleware());

// Health check route (before other routes)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes with versioning
app.use('/api/v1/cities', cityRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/answers', answerRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/votes', voteRoutes);

// Legacy route support (deprecated but maintained for backward compatibility)
app.use('/cities', cityRoutes);
app.use('/locations', locationRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/images', imageRoutes);
app.use('/votes', voteRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Liberato API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/api/v1/docs',
    health: '/health',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    status: 404,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (should be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');

    try {
      // Close database connections
      await closeRedisConnection();
      console.log('Redis connection closed');
      
      // Additional cleanup can be added here
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
});

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
