import { Request, Response } from 'express';
import * as CityService from '../services/city-service';

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
      res.status(404).json({ message: 'City not found' });
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
      res.status(404).json({ message: 'City not found' });
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

    if (!name || latitude === undefined || longitude === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const newCity = await CityService.createCity({
      name,
      latitude,
      longitude,
      radiusInKm,
    });

    sendSuccess(res, newCity, 201);
  } catch (error) {
    handleError(res, error, 'Failed to create city');
  }
};

export const updateCity = async (request: Request, res: Response) => {
  try {
    const { id } = request.params;
    const updated = await CityService.updateCity(id, request.body);
    sendSuccess(res, updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'City not found' });
    } else {
      handleError(res, error, 'Failed to update city');
    }
  }
};

export const deleteCity = async (request: Request, res: Response) => {
  try {
    const { id } = request.params;
    const deleted = await CityService.deleteCity(id);
    sendSuccess(res, deleted);
  } catch (error: any) {
    if (error.message === 'City has linked locations and cannot be deleted') {
      res.status(400).json({ message: error.message });
    } else if (error.message === 'City not found') {
      res.status(404).json({ message: error.message });
    } else {
      handleError(res, error, 'Failed to delete city');
    }
  }
};
