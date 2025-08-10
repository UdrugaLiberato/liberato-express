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
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import env from '../config/env';

// Async function to handle image upload in background
const processImageUploadAsync = async (
  categoryId: string,
  file: {
    path: string;
    filename?: string;
    originalname?: string;
    mime?: string;
  },
) => {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(file.path));
    formData.append('requestType', 'categories');

    const uploadResponse = await axios.post(
      `${env.STORE_URL}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30_000, // 30 second timeout
      },
    );

    // Update category with image info once upload is complete
    await CategoryService.updateWithImage(categoryId, uploadResponse.data);

    console.log(`Image uploaded successfully for category ${categoryId}`);
  } catch (uploadError: any) {
    console.error(
      `Failed to upload image for category ${categoryId}:`,
      uploadError,
    );

    // Log more detailed error information for debugging
    if (uploadError?.response) {
      console.error('Upload service responded with:', {
        status: uploadError.response.status,
        statusText: uploadError.response.statusText,
        data: uploadError.response.data,
        url: `${env.STORE_URL}/upload`,
      });
    } else if (uploadError?.request) {
      console.error('Upload service request failed:', uploadError.message);
    } else {
      console.error('Upload error:', uploadError?.message || 'Unknown error');
    }
  } finally {
    // Clean up local file
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
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

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    // Validate slug parameter
    const { slug } = req.params;
    if (!slug || slug.trim() === '') {
      sendBadRequest(res, 'Category slug is required and cannot be empty');
      return;
    }

    // Normalize slug
    const normalizedSlug = slug.trim().toLowerCase();

    const category = await CategoryService.getBySlug(normalizedSlug);
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
    const { file } = req;

    const { name, descriptionEN, descriptionHR, questions } = req.body;
    const missingFields = validateRequiredFields(req.body, ['name']);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    // Create category immediately without waiting for image upload
    const newCategory = await CategoryService.create(
      name,
      null, // No image data initially
      descriptionEN,
      descriptionHR,
      questions,
    );

    // Send response immediately
    sendCreated(res, newCategory);

    // Process image upload asynchronously if file is provided
    if (file) {
      processImageUploadAsync(newCategory.id, file);
    }
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
