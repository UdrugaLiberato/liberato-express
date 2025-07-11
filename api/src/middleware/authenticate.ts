import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.BEARER;

  if (!token) {
    next();
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err || !decoded || typeof decoded !== 'object') {
        res.sendStatus(403);
        return;
      }

      req.user = decoded as { id: string; role: 'ROLE_ADMIN' | 'ROLE_USER' };
      next();
    },
  );
};
