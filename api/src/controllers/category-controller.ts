import { Request, Response } from 'express';
import * as CategoryService from '../services/category-service';

const handleError = (
  res: Response,
  error: any,
  defaultMessage = 'Server error',
) => {
  const message = error?.message || defaultMessage;
  const status = error?.status || 500;
  res.status(status).json({ message });
};

const sendSuccess = (res: Response, data: any, status = 200) => {
  res.status(status).json(data);
};

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getAll();
    sendSuccess(res, categories);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.getById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    handleError(res, error);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, questions } = req.body;
    const { file } = req;

    if (!name || !file) {
      res.status(400).json({
        message: 'Missing required fields: name or category_image',
      });
      return;
    }

    const newCategory = await CategoryService.create(
      name,
      file,
      description,
      questions,
    );

    sendSuccess(res, newCategory, 201);
  } catch (error) {
    handleError(res, error, 'Failed to create category');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await CategoryService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete category');
  }
};
