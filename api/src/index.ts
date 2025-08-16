import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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
import sponsorRoutes from './routes/sponsor-routes';
import statsRoutes from './routes/stats-routes';

const app = express();
const port = env.PORT;

// Webhook routes (before JSON parsing to preserve raw body)
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(clerkMiddleware());

// Routes
app.use('/cities', cityRoutes);
app.use('/locations', locationRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/images', imageRoutes);
app.use('/health', healthRoutes);
app.use('/sponsors', sponsorRoutes);
app.use('/stats', statsRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await closeRedisConnection();
      console.log('Graceful shutdown completed');
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  });
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
