import { Request, Response, NextFunction } from 'express';
import { permissions } from '../config/permissions';

export function checkPermissions(req: Request, res: Response, next: NextFunction): void {
  const routePath = req.baseUrl + req.route.path;
  const method = req.method;

  const allowedRoles = permissions[routePath]?.[method];

  if (!allowedRoles) {
    res.status(403).json({ message: 'Access denied: No permissions set.' });
    return;
  }

  if (!allowedRoles.includes('PUBLIC_ACCESS')) {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json({ message: 'Unauthorized: No user role found.' });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
      return;
    }
  }

  next();
}