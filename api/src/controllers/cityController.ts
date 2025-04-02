import { Request, Response } from 'express';
import * as CityService from '../services/cityService';


export const getCities = async (_req: Request, res: Response) => {
    const cities = await CityService.getAllCities();
    res.json(cities);
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