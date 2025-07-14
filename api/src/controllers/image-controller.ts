import { Request, Response } from 'express';
import * as ImageService from '../services/image-service';

export const getAllImages = async (_req: Request, res: Response) => {
  const images = await ImageService.getAll();
  res.json(images);
};

export const getImage = async (req: Request, res: Response) => {
  const image = await ImageService.getById(Number.parseInt(req.params.id));
  res.json(image);
};

export const createImage = async (req: Request, res: Response) => {
  const newImage = await ImageService.create(req.body);
  res.status(201).json(newImage);
};

export const updateImage = async (req: Request, res: Response) => {
  const updated = await ImageService.update(
    Number.parseInt(req.params.id),
    req.body,
  );
  res.json(updated);
};

export const deleteImage = async (req: Request, res: Response) => {
  await ImageService.remove(Number.parseInt(req.params.id));
  res.status(204).send();
};
