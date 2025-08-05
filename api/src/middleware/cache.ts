import { NextFunction, Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

// Redis client instance
let client: RedisClientType | null = null;
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

// Initialize Redis client with proper error handling and connection management
const initializeRedis = async (): Promise<RedisClientType> => {
  if (client && client.isReady) {
    return client;
  }

  if (isConnecting && connectionPromise) {
    await connectionPromise;
    return client!;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      client = createClient({
        // Add retry strategy for better resilience
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis connection failed after 10 retries');
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000); // Exponential backoff with max 3s
          },
        },
      });

      client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
      });

      client.on('connect', () => {
        console.log('Redis Client Connected');
      });

      client.on('ready', () => {
        console.log('Redis Client Ready');
      });

      client.on('end', () => {
        console.log('Redis Client Disconnected');
      });

      await client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      client = null;
      throw error;
    } finally {
      isConnecting = false;
    }
  })();

  await connectionPromise;
  if (!client) {
    throw new Error('Redis client initialization failed');
  }
  return client;
};

// Cache middleware with proper Redis connection handling
const cache =
  (key: string = 'locations', ttl: number = 3600) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure Redis is connected before proceeding
      const redisClient = await initializeRedis();

      if (!redisClient.isReady) {
        console.log('Redis client not connected, skipping cache');
        return next();
      }

      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log('Cache hit');
        res.json(JSON.parse(cachedData) as any);
        return;
      }

      console.log('Cache miss');

      // Store the original res.json to intercept response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Store in cache asynchronously without blocking the response
        (async () => {
          try {
            await redisClient.setEx(key, ttl, JSON.stringify(data));
          } catch (error) {
            console.error('Error setting cache:', error);
          }
        })();
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      // If Redis is unavailable, continue without cache
      next();
    }
  };

// Graceful shutdown function
export const closeRedisConnection = async (): Promise<void> => {
  if (client && client.isReady) {
    await client.quit();
    console.log('Redis connection closed gracefully');
  }
};

export default cache;
