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
    const city = await CityService.getCityByName(request.params.name);
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
  } catch (error) {
    handleError(res, error, 'Failed to create city');
  }
};

export const updateCity = async (request: Request, res: Response) => {
  try {
    const { id } = request.params;
    const updated = await CityService.updateCity(id, request.body);
    sendSuccess(res, updated);
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
