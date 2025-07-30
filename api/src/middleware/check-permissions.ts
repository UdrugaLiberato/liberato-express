import { Request, Response, NextFunction } from 'express';

const checkPermissions = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next();
};

export default checkPermissions;
