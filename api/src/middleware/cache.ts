import { NextFunction, Request, Response } from 'express';
import { client } from '../index';

export const cache = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const key = 'locations';
    const cachedData = await client.get(key);
    if (cachedData) {
      console.log('Cache hit');
      res.json(JSON.parse(cachedData) as any);
      return;
    }
    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
}; 