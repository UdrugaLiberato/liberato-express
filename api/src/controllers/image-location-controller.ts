import { Request, Response } from 'express';
import * as ImageLocationService from '../services/image-location-service';

export const getLocationsByImage = async (req: Request, res: Response) => {
  const imageId = Number.parseInt(req.params.image_id);
  const locations = await ImageLocationService.getByImageId(imageId);
  res.json(locations);
};

export const createImageLocation = async (req: Request, res: Response) => {
  const entry = await ImageLocationService.create(req.body);
  res.status(201).json(entry);
};

export const deleteImageLocation = async (req: Request, res: Response) => {
  const imageId = Number.parseInt(req.params.image_id);
  const locationId = req.params.location_id;
  await ImageLocationService.remove(imageId, locationId);
  res.status(204).send();
};
