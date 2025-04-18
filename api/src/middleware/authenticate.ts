// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
//
// export const authenticate = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies?.BEARER;
//
//   if (!token) {
//     res.sendStatus(401);
//     return;
//   }
//
//   jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
//     if (err || typeof user !== 'object') {
//       res.sendStatus(403);
//       return;
//     }
//
//     req.user = user as { id: string; role: 'ROLE_ADMIN' | 'ROLE_USER' };
//     next();
//   });
// };