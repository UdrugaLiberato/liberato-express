import { Request, Response, Express } from 'express';
import * as LocationService from '../services/location-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
} from '../utils/controller-utils';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const { city, category } = req.query;
    const locations = await LocationService.getAllLocations({
      city: city as string | undefined,
      category: category as string | undefined,
    });
    sendSuccess(res, locations);
  } catch (error) {
    handleError(res, error);
  }
};

export const getLocation = async (req: Request, res: Response) => {
  try {
    const location = await LocationService.getLocationById(req.params.id);
    if (!location) {
      sendNotFound(res, 'Location not found');
      return;
    }
    sendSuccess(res, location);
  } catch (error) {
    handleError(res, error);
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const location = await LocationService.createLocation(
      req.body,
      req.files as Express.Multer.File[],
      '1ed198be-8109-68e4-8afe-cd8a4ea3d515',
    );
    if (!location) {
      sendBadRequest(res, 'Invalid city ID');
      return;
    }
    sendCreated(res, location);
  } catch (error) {
    handleError(res, error, 'Failed to create location');
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const updated = await LocationService.updateLocation(
      req.params.id,
      req.body,
      req.files as Express.Multer.File[],
    );
    if (!updated) {
      sendNotFound(res, 'Location not found');
      return;
    }
    sendSuccess(res, updated);
  } catch (error) {
    handleError(res, error, 'Failed to update location');
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    await LocationService.deleteLocation(req.params.id);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete location');
  }
};

export const getLocationsByCityAndCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const { city, category } = req.params;
    const locations = await LocationService.getLocationsByCityAndCategory(
      city,
      category,
      cursor,
    );
    sendSuccess(res, locations);
  } catch (error) {
    handleError(res, error);
  }
};

export const getLocationByCityAndCategoryAndName = async (
  req: Request,
  res: Response,
) => {
  try {
    const { city, category, name } = req.params;
    const location = await LocationService.getLocationByCityAndCategoryAndName(
      city,
      category,
      name,
    );
    if (!location) {
      sendNotFound(res, 'Location not found');
      return;
    }
    sendSuccess(res, location);
  } catch (error) {
    handleError(res, error);
  }
};
