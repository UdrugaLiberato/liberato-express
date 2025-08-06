import { Request, Response } from 'express';
import * as CategoryService from '../services/category-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import env from '../config/env';

// Optimized async function to handle image upload with performance monitoring
const processImageUploadAsync = async (
  categoryId: string,
  file: {
    path: string;
    filename?: string;
    originalname?: string;
    mime?: string;
  },
) => {
  const startTime = Date.now();
  let fileStats: fs.Stats | null = null;

  try {
    // Get file stats for monitoring
    fileStats = fs.statSync(file.path);
    console.log(`[${categoryId}] Starting upload - File: ${fileStats.size} bytes (${(fileStats.size / 1024 / 1024).toFixed(2)}MB) to ${env.STORE_URL}`);

    const formData = new FormData();
    const fileStream = fs.createReadStream(file.path);
    formData.append('files', fileStream);
    formData.append('requestType', 'categories');

    // Optimize axios configuration for production
    const uploadResponse = await axios.post(
      `${env.STORE_URL}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Connection': 'keep-alive', // Reuse connections
        },
        timeout: 60_000, // Increased timeout to 60 seconds
        maxBodyLength: 25 * 1024 * 1024, // 25MB limit
        maxContentLength: 25 * 1024 * 1024,
        // Performance optimizations
        httpAgent: new (require('http').Agent)({
          keepAlive: true,
          keepAliveMsecs: 30000,
          maxSockets: 5
        }),
        httpsAgent: new (require('https').Agent)({
          keepAlive: true,
          keepAliveMsecs: 30000,
          maxSockets: 5,
          rejectUnauthorized: false // Only if you have SSL issues
        }),
        // Monitor upload progress
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const elapsed = Date.now() - startTime;
            if (percentCompleted % 20 === 0 || elapsed > 10000) { // Log every 20% or after 10s
              console.log(`[${categoryId}] Upload progress: ${percentCompleted}% (${elapsed}ms elapsed)`);
            }
          }
        },
      },
    );

    // Update category with image info once upload is complete
    await CategoryService.updateWithImage(categoryId, uploadResponse.data);

    const totalTime = Date.now() - startTime;
    const mbps = fileStats ? ((fileStats.size / 1024 / 1024) / (totalTime / 1000)).toFixed(2) : 'unknown';
    console.log(`[${categoryId}] ✅ Upload successful - ${totalTime}ms total (${mbps} MB/s)`);

  } catch (uploadError: any) {
    const totalTime = Date.now() - startTime;
    const fileSize = fileStats ? `${(fileStats.size / 1024 / 1024).toFixed(2)}MB` : 'unknown';

    console.error(`[${categoryId}] ❌ Upload failed after ${totalTime}ms - File: ${fileSize}`);

    // Enhanced error logging for debugging network issues
    if (uploadError?.response) {
      console.error(`[${categoryId}] Store service error:`, {
        status: uploadError.response.status,
        statusText: uploadError.response.statusText,
        data: uploadError.response.data,
        url: `${env.STORE_URL}/upload`,
        timing: `${totalTime}ms`,
        fileSize,
      });
    } else if (uploadError?.request) {
      console.error(`[${categoryId}] Network/timeout error:`, {
        message: uploadError.message,
        code: uploadError.code,
        timeout: uploadError.code === 'ECONNABORTED',
        timing: `${totalTime}ms`,
        fileSize,
      });
    } else {
      console.error(`[${categoryId}] Unknown upload error:`, {
        message: uploadError?.message || 'Unknown error',
        timing: `${totalTime}ms`,
        fileSize,
      });
    }

    // Consider implementing retry logic for transient failures
    // throw uploadError; // Uncomment if you want to propagate errors
  } finally {
    // Clean up local file
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`[${categoryId}] Cleaned up temp file: ${file.path}`);
      }
    } catch (cleanupError) {
      console.warn(`[${categoryId}] Failed to cleanup temp file: ${cleanupError}`);
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
