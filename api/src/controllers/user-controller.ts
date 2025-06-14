import { Request, Response } from 'express'
import * as userService from '../services/user-service'

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAll()
  res.json(users)
}

export const getMyself = async (req: Request, res: Response) => {
  if (!req.user) {
    console.log(404);
    res.status(403);
    return;
  }
  const user = await userService.getById(req.user.id);
  console.log(user);

  if (!user) {
    res.status(404);
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,

  })
}

export const getUser = async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id)

  if (!user) {
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    roles: user.roles,
    username: user.username,
    avatar: user.avatar,
    createdAt: user.updated_at,
    updatedAt: user.updated_at,
    deletedAt: user.deleted_at,

  })
}

export const createUser = async (req: Request, res: Response) => {
  const newUser = await userService.create(req.body)
  res.status(201).json(newUser)
}

export const updateUser = async (req: Request, res: Response) => {
  const updated = await userService.update(req.params.id, req.body)
  res.json(updated)
}

export const deleteUser = async (req: Request, res: Response) => {
  await userService.remove(req.params.id)
  res.status(200).send()
}