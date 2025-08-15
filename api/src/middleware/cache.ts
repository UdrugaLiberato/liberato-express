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

      client.on('connect', () => {});

      client.on('ready', () => {});

      client.on('end', () => {});

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
const cache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure Redis is connected before proceeding
    const redisClient = await initializeRedis();

    if (!redisClient.isReady) {
      return next();
    }

    const key = req.baseUrl + JSON.stringify(req.query);
    const ttl = 3600;

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      res.json(JSON.parse(cachedData) as any);
      return;
    }

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
  }
};

export default cache;
