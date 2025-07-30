import { Request, Response } from 'express';
import * as AnswerService from '../services/answer-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
} from '../utils/controller-utils';

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
      sendNotFound(res, 'Answer not found');
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
    sendCreated(res, newAnswer);
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
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete answer');
  }
};
