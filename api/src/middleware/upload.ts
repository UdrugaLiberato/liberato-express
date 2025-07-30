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

const upload = multer({ storage });

export default upload;
