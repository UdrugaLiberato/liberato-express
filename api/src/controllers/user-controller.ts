import { Request, Response } from 'express';
import * as userService from '../services/user-service';

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAll();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id);
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const newUser = await userService.create(req.body);
  res.status(201).json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const updated = await userService.update(req.params.id, req.body);
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.remove(req.params.id);
  res.status(200).send();
};
