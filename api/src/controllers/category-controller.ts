import { Request, Response } from 'express'
import * as CategoryService from '../services/category-service'

export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await CategoryService.getAll();
  res.json(categories);
}

export const getCategory = async (req: Request, res: Response) => {
  const category = await CategoryService.getById(req.params.id);
  res.json(category);
}

export const createCategory = async (req: Request, res: Response) => {
  const newCategory = await CategoryService.create(req.body);
  res.status(201).json(newCategory);
}

export const updateCategory = async (req: Request, res: Response) => {
  const updated = await CategoryService.update(req.params.id, req.body);
  res.json(updated);
}

export const deleteCategory = async (req: Request, res: Response) => {
  await CategoryService.remove(req.params.id);
  res.status(204).send();
}