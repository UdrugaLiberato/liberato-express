import { NextFunction, Request, Response } from 'express';
import { createClient } from 'redis';

const client = createClient()
  .on('error', (err: Error) => console.log('Redis Client Error', err))
  .on('connect', () => console.log('Redis Client Connected'));

// Initialize Redis
client.connect();

const cache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = 'locations';
    const cachedData = await client.get(key);
    if (cachedData) {
      console.log('Cache hit');
      res.json(JSON.parse(cachedData) as any);
      return;
    }
    console.log('Cache miss');
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};

export default cache;
