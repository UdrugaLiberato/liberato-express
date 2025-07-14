import { Request, Response, Express } from 'express';
import * as LocationService from '../services/location-service';

export const getLocations = async (req: Request, res: Response) => {
  const { city, category } = req.query;

  const locations = await LocationService.getAllLocations({
    city: city as string | undefined,
    category: category as string | undefined,
  });

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

// export const addLocationImage = async (req: Request, res: Response) => {
//   try {
//     const locationId = req.params.id;
//     const files = req.files as Express.Multer.File[];
// ``
//     if (!files?.length) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }
//
//     const updatedLocation = await LocationService.addLocationImage(locationId, files);
//     res.json(updatedLocation);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const removeLocationImage = async (req: Request, res: Response) => {
//   try {
//     const { imageId } = req.body;
//     const locationId = req.params.id as string;
//
//     if (!imageId) {
//       return res.status(400).json({ message: 'imageId is required' });
//     }
//
//     await LocationService.removeLocationImage(imageId, locationId);
//     res.status(204).send();
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createLocation = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(403).json({ message: 'User not found' });
    return;
  }
  try {
    const location = await LocationService.createLocation(
      req.body,
      req.files as Express.Multer.File[],
      req.user.id,
    );
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
      req.files as Express.Multer.File[],
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
