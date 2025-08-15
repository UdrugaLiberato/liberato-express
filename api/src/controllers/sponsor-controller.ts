import { Request, Response } from 'express';
import * as SponsorService from '../services/sponsor-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';
import env from '../config/env';

// Async function to handle image upload in background
const processImageUploadAsync = async (
  sponsorId: string,
  files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[],
) => {
  try {
    const formData = new FormData();
    const filesToProcess: Express.Multer.File[] = [];

    // Handle both array and object formats
    if (Array.isArray(files)) {
      filesToProcess.push(...files);
    } else {
      // Extract files from fields object
      const lightFiles = files.light_image || [];
      const darkFiles = files.dark_image || [];
      filesToProcess.push(...lightFiles, ...darkFiles);
    }

    // Add all files to form data
    // eslint-disable-next-line no-restricted-syntax
    for (const file of filesToProcess) {
      formData.append('files', fs.createReadStream(file.path));
    }
    formData.append('requestType', 'sponsors');

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

    // Update sponsor with image info once upload is complete
    await SponsorService.updateWithImages(
      sponsorId,
      uploadResponse.data,
      files,
    );

    console.log(`Images uploaded successfully for sponsor ${sponsorId}`);
  } catch (uploadError: any) {
    console.error(
      `Failed to upload images for sponsor ${sponsorId}:`,
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
  } finally {
    // Clean up local files
    const filesToClean: Express.Multer.File[] = [];

    if (Array.isArray(files)) {
      filesToClean.push(...files);
    } else {
      const lightFiles = files.light_image || [];
      const darkFiles = files.dark_image || [];
      filesToClean.push(...lightFiles, ...darkFiles);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const file of filesToClean) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }
};

export const getAllSponsors = async (_req: Request, res: Response) => {
  try {
    const sponsors = await SponsorService.getAll();
    sendSuccess(res, sponsors);
  } catch (error) {
    handleError(res, error);
  }
};

export const getSponsor = async (req: Request, res: Response) => {
  try {
    const sponsor = await SponsorService.getById(req.params.id);
    if (!sponsor) {
      sendNotFound(res, 'Sponsor not found');
      return;
    }
    sendSuccess(res, sponsor);
  } catch (error) {
    handleError(res, error);
  }
};

export const createSponsor = async (req: Request, res: Response) => {
  try {
    const { files } = req;
    const { name, alt, description, url, weight } = req.body;

    const missingFields = validateRequiredFields(req.body, [
      'name',
      'alt',
      'description',
      'url',
    ]);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    // Validate that both light and dark images are provided
    if (!files || Array.isArray(files)) {
      handleValidationError(res, [
        'Both light_image and dark_image are required when creating a sponsor',
      ]);
      return;
    }

    const lightImages = files.light_image || [];
    const darkImages = files.dark_image || [];

    if (lightImages.length === 0 || darkImages.length === 0) {
      handleValidationError(res, [
        'Both light_image and dark_image are required when creating a sponsor',
      ]);
      return;
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      handleValidationError(res, ['URL must start with http:// or https://']);
      return;
    }

    // Create sponsor immediately without waiting for image upload
    const newSponsor = await SponsorService.create(
      name,
      alt,
      description,
      url,
      null, // No image data initially
      weight ? Number.parseInt(weight, 10) : 0,
    );

    // Send response immediately
    sendCreated(res, newSponsor);

    // Process image upload asynchronously since we've validated files exist
    processImageUploadAsync(newSponsor.id, files);
  } catch (error) {
    handleError(res, error, 'Failed to create sponsor');
  }
};

export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { files } = req;
    const { name, alt, description, url, weight } = req.body;
    const { id } = req.params;

    // Check if sponsor exists
    const existingSponsor = await SponsorService.getById(id);
    if (!existingSponsor) {
      sendNotFound(res, 'Sponsor not found');
      return;
    }

    // Validate URL format if provided
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      handleValidationError(res, ['URL must start with http:// or https://']);
      return;
    }

    // Update sponsor immediately without waiting for image upload
    const updatedSponsor = await SponsorService.update(
      id,
      name,
      alt,
      description,
      url,
      weight === undefined ? undefined : Number.parseInt(weight, 10),
    );

    // Send response immediately
    sendSuccess(res, updatedSponsor);

    // Process image upload asynchronously if files are provided
    if (files) {
      // If files are provided, validate that both light and dark images are included
      if (Array.isArray(files)) {
        handleValidationError(res, [
          'Both light_image and dark_image are required when updating sponsor images',
        ]);
        return;
      }

      const lightImages = files.light_image || [];
      const darkImages = files.dark_image || [];
      const hasFiles = lightImages.length > 0 || darkImages.length > 0;

      if (hasFiles) {
        // If any images are provided, both light and dark must be provided
        if (lightImages.length === 0 || darkImages.length === 0) {
          handleValidationError(res, [
            'Both light_image and dark_image are required when updating sponsor images',
          ]);
          return;
        }
        processImageUploadAsync(id, files);
      }
    }
  } catch (error) {
    handleError(res, error, 'Failed to update sponsor');
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    const sponsor = await SponsorService.getById(req.params.id);
    if (!sponsor) {
      sendNotFound(res, 'Sponsor not found');
      return;
    }

    await SponsorService.remove(req.params.id);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete sponsor');
  }
};
