import { Request, Response } from 'express';
import * as CategoryService from '../services/category-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';

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
      sendNotFound(res, 'Category not found');
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCategoryByName = async (req: Request, res: Response) => {
  try {
    const category = await CategoryService.getByName({ name: req.params.name });
    if (!category) {
      sendNotFound(res, 'Category not found');
      return;
    }
    sendSuccess(res, category);
  } catch (error) {
    handleError(res, error);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, descriptionEN, descriptionHR, questions } = req.body;
    const { file } = req;

    const missingFields = validateRequiredFields(req.body, ['name']);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    if (!file) {
      sendBadRequest(res, 'Missing required fields: category_image');
      return;
    }

    const newCategory = await CategoryService.create(
      name,
      file,
      descriptionEN,
      descriptionHR,
      questions,
    );

    sendCreated(res, newCategory);
  } catch (error) {
    handleError(res, error, 'Failed to create category');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await CategoryService.remove(req.params.id);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete category');
  }
};
