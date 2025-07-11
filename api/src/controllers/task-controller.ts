import { Request, Response } from 'express';
import * as TaskService from '../services/task-service';

export const getAllTasks = async (_req: Request, res: Response) => {
  const tasks = await TaskService.getAll();
  res.json(tasks);
};

export const getTask = async (req: Request, res: Response) => {
  const task = await TaskService.getById(req.params.id);
  res.json(task);
};

export const createTask = async (req: Request, res: Response) => {
  const newTask = await TaskService.create(req.body);
  res.status(201).json(newTask);
};

export const updateTask = async (req: Request, res: Response) => {
  const updated = await TaskService.update(req.params.id, req.body);
  res.json(updated);
};

// ne postoji delete za ovo ? // todo @viktor
// export const deleteTask = async (req: Request, res: Response) => {
//   await TaskService.remove(req.params.id);
//   res.status(204).send();
// }
