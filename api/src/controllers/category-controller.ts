import { Request, Response, Express } from 'express';
import * as CategoryService from '../services/category-service';

export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await CategoryService.getAll();
  res.json(categories);
};

export const getCategory = async (req: Request, res: Response) => {
  const category = await CategoryService.getById(req.params.id);
  res.json(category);
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, questions } = req.body;
    const { file } = req;

    if (!name || !file) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: name or category_image' });
    }

    const newCategory = await CategoryService.create(
      name,
      file as Express.Multer.File,
      description,
      questions,
    );

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  await CategoryService.remove(req.params.id);
  res.status(200).send();
};
