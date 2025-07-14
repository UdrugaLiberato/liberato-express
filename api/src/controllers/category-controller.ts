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
  try {
    const { name, description, questions } = req.body;
    const file = req.file;


    if (!name || !file) {
      return res.status(400).json({ error: 'Missing required fields: name or category_image' });
    }

    const category_image = file.filename;

    const newCategory = await CategoryService.create({
      name,
      description,
      category_image,
      questions,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};


export const deleteCategory = async (req: Request, res: Response) => {
  await CategoryService.remove(req.params.id);
  res.status(200).send();
}