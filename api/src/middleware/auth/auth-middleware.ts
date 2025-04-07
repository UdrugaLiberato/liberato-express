import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'liberatosecret';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      req.user = jwt.verify(token, JWT_SECRET);
      return next()
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
  }

  res.status(401).json({ message: 'No token provided' })
}