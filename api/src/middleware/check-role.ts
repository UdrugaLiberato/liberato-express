import { Request, Response, NextFunction } from 'express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

type Role = 'ROLE_ADMIN' | 'ROLE_USER';
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface AccessControlConfig {
    routes: {
        [path: string]: {
            [method in Method]?: Role[];
        };
    };
}

const configPath = path.join(__dirname, '../config/access-control.yml');
const accessControl = yaml.load(fs.readFileSync(configPath, 'utf8')) as AccessControlConfig;

export const checkRoleAccess = (req: Request, res: Response, next: NextFunction) => {
    const method = req.method as Method;
    const route = req.baseUrl + req.route.path; // Make sure routes are defined consistently
    const role = req.user?.role;

    const allowedRoles = accessControl.routes?.[route]?.[method];

    if (!allowedRoles) {
        res.status(403).json({ message: 'Access rule not defined.' });
        return;
    }

    if (!role || !allowedRoles.includes(role)) {
        res.status(403).json({ message: 'Access denied.' });
        return;
    }

    next();
};