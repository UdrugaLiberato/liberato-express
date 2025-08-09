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
    mime?: string;
  },
) => {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(file.path));
    formData.append('requestType', 'cities');

    const uploadResponse = await axios.post(
      `${env.STORE_URL}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30_000,
      },
    );

    await CityService.updateWithImage(cityId, uploadResponse.data);

    console.log(`Image uploaded successfully for city ${cityId}`);
  } catch (uploadError: any) {
    console.error(`Failed to upload image for city ${cityId}:`, uploadError);

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
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
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

export const getCityByName = async (request: Request, res: Response) => {
  try {
    const city = await CityService.getCityByName({ name: request.params.name });
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
