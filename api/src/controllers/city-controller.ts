import { Request, Response } from 'express';

import * as CityService from '../services/city-service';

export const getCities = async (
  _request: Request,
  res: Response,
): Promise<void> => {
  const cities = await CityService.getAllCities();
  res.json(cities);
};

export const getCity = async (
  request: Request,
  res: Response,
): Promise<void> => {
  try {
    const city = await CityService.getCityById(request.params.id);
    if (!city) {
      res.status(404).json({ message: 'City not found' });
      return;
    }
    res.json(city);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCity = async (
  request: Request,
  res: Response,
): Promise<void> => {
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

    res.status(201).json(newCity);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCity = async (
  request: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = request.params;
    const updated = await CityService.updateCity(id, request.body);
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'City not found' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

export const deleteCity = async (
  request: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = request.params;
    const deleted = await CityService.deleteCity(id);
    res.json(deleted);
  } catch (error: any) {
    if (error.message === 'City has linked locations and cannot be deleted') {
      res.status(400).json({ message: error.message });
    } else if (error.message === 'City not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};
