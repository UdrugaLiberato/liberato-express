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
import { LocationCreateData, LocationUpdateData } from '../types';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import env from '../config/env';
import { getAuth } from '@clerk/express';

// Async function to handle image upload in background
const processImageUploadAsync = async (
  locationId: string,
  file: {
    path: string;
    filename?: string;
    originalname?: string;
    mime?: string;
  },
) => {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(file.path));
    formData.append('requestType', 'locations');

    const uploadResponse = await axios.post(
      `${env.STORE_URL}/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30_000, // 30 second timeout
      },
    );

    // Update location with image info once upload is complete
    await LocationService.updateWithImage(locationId, uploadResponse.data);

    // Clean up local file only after successful upload
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (uploadError: any) {
    console.error(
      `Failed to upload image for location ${locationId}:`,
      uploadError,
    );

    // Log more detailed error information for debugging
    if (uploadError?.response) {
      console.error('Upload service responded with:', {
        status: uploadError.response.status,
        statusText: uploadError.response.statusText,
        data: uploadError.response.data,
        url: `${env.STORE_URL}/upload`,
      });
    } else if (uploadError?.request) {
      console.error('Upload service request failed:', uploadError.message);
    } else {
      console.error('Upload error:', uploadError?.message || 'Unknown error');
    }

    // Keep the local file on failure for potential retry or debugging
    console.log(`Local file preserved at: ${file.path} due to upload failure`);
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const { city, category, name, cursor, votes } = req.query;
    const { userId } = getAuth(req);

    const locations = await LocationService.getAllLocations(
      {
        city: city as string | undefined,
        category: category as string | undefined,
        name: name as string | undefined,
        cursor: cursor as string | undefined,
        votes: votes === 'true',
      },
      userId || undefined,
    );

    sendSuccess(res, locations);
  } catch (error) {
    handleError(res, error);
  }
};

export const getLocation = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const location = await LocationService.getLocationById(
      req.params.id,
      userId || undefined,
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

export const createLocation = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    // Create location immediately without waiting for image upload
    const location = await LocationService.createLocation(
      req.body as LocationCreateData,
      [], // No files initially
      '1ed198be-8109-68e4-8afe-cd8a4ea3d515',
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

export const getLocationByCityAndCategoryAndName = async (
  req: Request,
  res: Response,
) => {
  try {
    const { city, category, name, cursor } = req.params;
    const location = await LocationService.getLocationByCityAndCategoryAndName({
      city,
      category,
      cursor,
      name,
    });
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
    const { userId } = getAuth(req);

    const location = await LocationService.getLocationBySlug(
      slug,
      userId || undefined,
    );
    if (!location) {
      return sendNotFound(res, 'Location not found');
    }
    sendSuccess(res, location);
  } catch (error) {
    handleError(res, error);
  }
};
