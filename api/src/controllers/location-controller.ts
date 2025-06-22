import { Request, Response } from 'express';
import * as LocationService from '../services/location-service';

export const getLocations = async (_req: Request, res: Response) => {
  const locations = await LocationService.getAllLocations();
  res.json(locations);
};

export const getLocation = async (req: Request, res: Response) => {
  try {
    const location = await LocationService.getLocationById(req.params.id);
    if (!location) res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// export const createLocation = async (req: Request, res: Response) => {
//   try {
//     const image = req.file?.filename;
//
//     const locationData = {
//       ...req.body,
//       image,
//     };
//
//     const location = await LocationService.createLocation(locationData);
//     res.status(201).json(location);
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// };

export const createLocation = async (req: Request, res: Response) => {
  try {
    console.log(req.files);
    const location = await LocationService.createLocation(req.body, req.files as Express.Multer.File[]);
    res.status(201).json(location);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const updateLocation = async (req: Request, res: Response) => {
  try {
    const updated = await LocationService.updateLocation(
      req.params.id,
      req.body,
    );
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    await LocationService.deleteLocation(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
