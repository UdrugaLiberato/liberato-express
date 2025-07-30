import { Request, Response } from 'express';
import * as ImageService from '../services/image-service';
import { parseImageId } from '../utils/image-utils';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
} from '../utils/controller-utils';

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
      sendNotFound(res, 'Image not found');
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
    sendCreated(res, newImage);
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
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete image');
  }
};
