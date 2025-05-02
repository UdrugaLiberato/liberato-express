import { Request, Response, NextFunction } from 'express';
import { permissions } from '../config/permissions';

export function checkPermissions(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const requestPath = req.originalUrl.split('?')[0];

  let matchedRoles: string[] | undefined = undefined;

  for (const [permissionPath, methods] of Object.entries(permissions)) {
    const regex = new RegExp('^' + permissionPath.replace(/\*/g, '.*') + '$'); // convert wildcards
    if (regex.test(requestPath)) {
      matchedRoles = methods[method];
      break;
    }
  }

  if (!matchedRoles) {
    res.status(403).json({ message: 'Access denied: No permissions set.' });
    return;
  }

  if (!matchedRoles.includes('PUBLIC_ACCESS')) {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(401).json({ message: 'Unauthorized: No user role found.' });
      return;
    }

    if (!matchedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
      return;
    }
  }

  next();
}