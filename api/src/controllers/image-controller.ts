import { Request, Response } from 'express';
import * as ImageService from '../services/image-service';
import { parseImageId } from '../utils/image-utils';

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

export const getAllImages = async (_req: Request, res: Response) => {
  try {
    const images = await ImageService.getAll();
    sendSuccess(res, images);
  } catch (error) {
    handleError(res, error);
  }
};

export const getImage = async (req: Request, res: Response) => {
  try {
    const image = await ImageService.getById(parseImageId(req.params.id));
    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }
    sendSuccess(res, image);
  } catch (error) {
    handleError(res, error);
  }
};

export const createImage = async (req: Request, res: Response) => {
  try {
    const newImage = await ImageService.create(req.body);
    sendSuccess(res, newImage, 201);
  } catch (error) {
    handleError(res, error, 'Failed to create image');
  }
};

export const updateImage = async (req: Request, res: Response) => {
  try {
    const updated = await ImageService.update(
      parseImageId(req.params.id),
      req.body,
    );
    sendSuccess(res, updated);
  } catch (error) {
    handleError(res, error, 'Failed to update image');
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    await ImageService.remove(parseImageId(req.params.id));
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete image');
  }
};
