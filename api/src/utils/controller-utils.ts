import { Response } from 'express';
import { ApiResponse } from '../types';

export const handleError = (
  res: Response,
  error: any,
  defaultMessage = 'Server error',
) => {
  const message = error?.message || defaultMessage;
  const status = error?.status || 500;
  res.status(status).json({ message });
};

export const sendSuccess = (res: Response, data: any, status = 200) => {
  res.status(status).json(data);
};

export const sendCreated = (res: Response, data: any) => {
  res.status(201).json(data);
};

export const sendNoContent = (res: Response) => {
  res.status(204).send();
};

export const sendNotFound = (res: Response, message = 'Resource not found') => {
  res.status(404).json({ message });
};

export const sendBadRequest = (res: Response, message = 'Bad request') => {
  res.status(400).json({ message });
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
  res.status(401).json({ message });
};

export const sendForbidden = (res: Response, message = 'Forbidden') => {
  res.status(403).json({ message });
};

export const sendConflict = (res: Response, message = 'Conflict') => {
  res.status(409).json({ message });
};

export const sendInternalError = (
  res: Response,
  message = 'Internal server error',
) => {
  res.status(500).json({ message });
};

export const validateRequiredFields = (
  body: any,
  requiredFields: string[],
): string[] => {
  return requiredFields.filter((field) => !body[field] && body[field] !== 0);
};

export const handleValidationError = (
  res: Response,
  missingFields: string[],
) => {
  const message = `Missing required fields: ${missingFields.join(', ')}`;
  sendBadRequest(res, message);
};

export const handlePrismaError = (res: Response, error: any) => {
  if (error.code === 'P2025') {
    sendNotFound(res, 'Resource not found');
  } else if (error.code === 'P2002') {
    sendConflict(res, 'Resource already exists');
  } else {
    handleError(res, error);
  }
};
