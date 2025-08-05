import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { closeRedisConnection } from './middleware/cache';

// Routes
import authRoutes from './routes/auth-routes';
import cityRoutes from './routes/city-routes';
import locationRoutes from './routes/location-routes';
import categoryRoutes from './routes/category-routes';
import userRoutes from './routes/user-routes';
import questionRoutes from './routes/question-routes';
import answerRoutes from './routes/answer-routes';
import imageRoutes from './routes/image-routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Routes
app.get('/', (request, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/cities', cityRoutes);
app.use('/locations', locationRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/images', imageRoutes);

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

      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);

      process.exit(1);
    }
  });
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
