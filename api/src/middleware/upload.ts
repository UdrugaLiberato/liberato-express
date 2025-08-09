/* eslint-disable promise/prefer-await-to-callbacks */
import multer from 'multer';
import path from 'node:path';
import { Request } from 'express';
import crypto from 'node:crypto';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomInt(1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to validate file types
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Default upload configuration (for backward compatibility)
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Specialized upload for category images (smaller limit for better performance)
export const categoryImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for category images
    files: 1,
  },
});

// Specialized upload for location images (multiple files, reasonable limit)
export const locationImagesUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per image
    files: 5, // Maximum 5 images per location
  },
});

// Specialized upload for user avatars (small limit)
export const avatarUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
    files: 1,
  },
});

// Specialized upload for city images
export const cityImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for city images
    files: 1,
  },
});

export default upload;
