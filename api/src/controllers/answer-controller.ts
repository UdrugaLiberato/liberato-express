import { Request, Response } from 'express';
import * as AnswerService from '../services/answer-service';

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

export const getAllAnswers = async (_req: Request, res: Response) => {
  try {
    const answers = await AnswerService.getAll();
    sendSuccess(res, answers);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAnswer = async (req: Request, res: Response) => {
  try {
    const answer = await AnswerService.getById(req.params.id);
    if (!answer) {
      res.status(404).json({ message: 'Answer not found' });
      return;
    }
    sendSuccess(res, answer);
  } catch (error) {
    handleError(res, error);
  }
};

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const newAnswer = await AnswerService.create(req.body);
    sendSuccess(res, newAnswer, 201);
  } catch (error) {
    handleError(res, error, 'Failed to create answer');
  }
};

export const updateAnswer = async (req: Request, res: Response) => {
  try {
    const updated = await AnswerService.update(req.params.id, req.body);
    sendSuccess(res, updated);
  } catch (error) {
    handleError(res, error, 'Failed to update answer');
  }
};

export const deleteAnswer = async (req: Request, res: Response) => {
  try {
    await AnswerService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'Failed to delete answer');
  }
};
