import { Request, Response } from 'express';
import * as CityService from '../services/cityService';


export const getCities = async (_req: Request, res: Response) => {
    const cities = await CityService.getAllCities();
    return res.json(cities);
};

export const getCity = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const city = await CityService.getCityById(req.params.id);
        if (!city) return res.status(404).json({ message: 'City not found' });
        return res.json(city);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

export const createCity = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, latitude, longitude, radiusInKm } = req.body;

        if (!name || latitude == null || longitude == null) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newCity = await CityService.createCity({
            name,
            latitude,
            longitude,
            radiusInKm,
        });

        return res.status(201).json(newCity);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const updateCity = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const updated = await CityService.updateCity(id, req.body);

        return res.json(updated);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'City not found' });
        }

        return res.status(400).json({ message: error.message });
    }
};

export const deleteCity = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const deleted = await CityService.deleteCity(id);

        return res.json(deleted);
    } catch (error: any) {
        if (error.message === 'City has linked locations and cannot be deleted') {
            return res.status(400).json({ message: error.message });
        }

        if (error.message === 'City not found') {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({ message: 'Server error' });
    }
};