import { Request, Response } from 'express';
import * as CityService from '../services/city-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  validateRequiredFields,
  handleValidationError,
  handlePrismaError,
} from '../utils/controller-utils';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import env from '../config/env';

const processImageUploadAsync = async (
  cityId: string,
  file: {
    path: string;
    filename?: string;
    originalname?: string;
    mimetype?: string;
  },
) => {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(file.path));
    formData.append('requestType', 'cities');

    const uploadResponse = await axios.post(
      new URL('/upload', env.STORE_URL).toString(),
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30_000,
      },
    );

    await CityService.updateWithImage(cityId, uploadResponse.data);
  } catch (uploadError: any) {
    console.error(`Failed to upload image for city ${cityId}:`, uploadError);

    if (uploadError?.response) {
      console.error('Upload service responded with:', {
        status: uploadError.response.status,
        statusText: uploadError.response.statusText,
        data: uploadError.response.data,
        url: new URL('/upload', env.STORE_URL).toString(),
      });
    } else if (uploadError?.request) {
      console.error('Upload service request failed:', uploadError.message);
    } else {
      console.error('Upload error:', uploadError?.message || 'Unknown error');
    }

    // Consider implementing retry mechanism or background job for failed uploads
    // if the upload is business-critical
  } finally {
    // Use non-blocking file deletion
    if (file.path && fs.existsSync(file.path)) {
      try {
        await fs.promises.unlink(file.path);
      } catch (deleteError) {
        console.error(
          `Failed to delete temporary file ${file.path}:`,
          deleteError,
        );
      }
    }
  }
};

export const getCities = async (_request: Request, res: Response) => {
  try {
    const cities = await CityService.getAllCities();
    sendSuccess(res, cities);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCity = async (request: Request, res: Response) => {
  try {
    const city = await CityService.getCityById(request.params.id);
    if (!city) {
      sendNotFound(res, 'City not found');
      return;
    }
    sendSuccess(res, city);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCityBySlug = async (request: Request, res: Response) => {
  try {
    // Validate slug parameter
    const { slug } = request.params;
    if (!slug || slug.trim() === '') {
      sendBadRequest(res, 'City slug is required and cannot be empty');
      return;
    }

    // Normalize slug
    const normalizedSlug = slug.trim().toLowerCase();

    const city = await CityService.getCityBySlug({ slug: normalizedSlug });
    if (!city) {
      sendNotFound(res, 'City not found');
      return;
    }
    sendSuccess(res, city);
  } catch (error) {
    handleError(res, error);
  }
};

export const createCity = async (request: Request, res: Response) => {
  try {
    const { file } = request;
    const { name, latitude, longitude, radiusInKm } = request.body;

    const missingFields = validateRequiredFields(request.body, [
      'name',
      'latitude',
      'longitude',
    ]);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    const newCity = await CityService.createCity({
      name,
      latitude,
      longitude,
      radiusInKm,
    });

    sendCreated(res, newCity);

    if (file) {
      processImageUploadAsync(newCity.id, file);
    }
  } catch (error) {
    handleError(res, error, 'Failed to create city');
  }
};

export const updateCity = async (request: Request, res: Response) => {
  try {
    const { file } = request;
    const { id } = request.params;
    const updated = await CityService.updateCity(id, request.body);
    sendSuccess(res, updated);

    if (file) {
      processImageUploadAsync(updated.id, file);
    }
  } catch (error) {
    handlePrismaError(res, error);
  }
};

export const deleteCity = async (request: Request, res: Response) => {
  try {
    const { id } = request.params;
    const deleted = await CityService.deleteCity(id);
    sendSuccess(res, deleted);
  } catch (error: any) {
    if (error.message === 'City has linked locations and cannot be deleted') {
      sendBadRequest(res, error.message);
    } else if (error.message === 'City not found') {
      sendNotFound(res, error.message);
    } else {
      handleError(res, error, 'Failed to delete city');
    }
  }
};
