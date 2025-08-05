import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { promisify } from 'node:util';
import env from '../config/env';

const verifyToken = promisify(jwt.verify) as (
  token: string,
  secret: string,
) => Promise<JwtPayload>;

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.BEARER;

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = await verifyToken(token, env.JWT_SECRET as string);
    req.user = decoded as { id: string; role: string };
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export default authenticate;
