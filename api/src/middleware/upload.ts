import multer, { FileFilterCallback } from 'multer';
import path from 'node:path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
