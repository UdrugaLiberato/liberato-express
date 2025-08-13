import { Request, Response } from 'express';
import * as LocationService from '../services/location-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
} from '../utils/controller-utils';
import { LocationCreateData, LocationUpdateData } from '../types';

// Helper function to process image upload asynchronously
const processImageUploadAsync = async (locationId: string, file: Express.Multer.File) => {
  try {
    await LocationService.updateWithImage(locationId, file);
    console.log(`Successfully uploaded image for location ${locationId}`);
  } catch (error) {
    console.error(`Failed to upload image for location ${locationId}:`, error);
  }
};

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const {
      city,
      category,
      name,
      cursor,
      includeVotes,
    } = req.query;

    const locations = await LocationService.getAllLocations({
      city: city as string | undefined,
      category: category as string | undefined,
      name: name as string | undefined,
      cursor: cursor as string | undefined,
      includeVotes: includeVotes === 'true',
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
    const files = req.files as Express.Multer.File[];

    // Create location immediately without waiting for image upload
    const location = await LocationService.createLocation(
      req.body as LocationCreateData,
      [], // No files initially
    );
    if (!location) {
      sendBadRequest(res, 'Invalid city ID');
      return;
    }

    // Send response immediately
    sendCreated(res, location);

    // Process image uploads asynchronously if files are provided
    if (files && files.length > 0) {
      Promise.allSettled(
        files.map((file) => processImageUploadAsync(location.id, file)),
      );
    }
  } catch (error) {
    handleError(res, error, 'Failed to create location');
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    // Update location immediately without waiting for image upload
    const updated = await LocationService.updateLocation(
      req.params.id,
      req.body as LocationUpdateData,
      [], // No files initially
    );
    if (!updated) {
      sendNotFound(res, 'Location not found');
      return;
    }

    // Send response immediately
    sendSuccess(res, updated);

    // Process image uploads asynchronously if files are provided
    if (files && files.length > 0) {
      Promise.allSettled(
        files.map((file) => processImageUploadAsync(updated.id, file)),
      );
    }
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
    const { city, category } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const locations = await LocationService.getLocationsByCityAndCategory(
      city,
      category,
      limit,
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

export const getLocationBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const location = await LocationService.getLocationBySlug(slug);
    if (!location) {
      return sendNotFound(res, 'Location not found');
    }
    sendSuccess(res, location);
  } catch (error) {
    handleError(res, error);
  }
};
