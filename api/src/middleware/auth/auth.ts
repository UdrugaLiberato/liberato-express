import { Request, Response, NextFunction } from 'express'

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin role missing.' })
  }
  next()
}

export const isAdminOrSelf = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  const targetId = req.params.id

  if (!user || (user.role !== 'admin' && user.id !== targetId)) {
    return res.status(403).json({ message: 'Only admins or the user can perform this action.' })
  }

  next()
}