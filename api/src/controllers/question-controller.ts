import { Request, Response } from 'express';
import * as QuestionService from '../services/question-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
} from '../utils/controller-utils';

export const getAllQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await QuestionService.getAll();
    sendSuccess(res, questions);
  } catch (error) {
    handleError(res, error);
  }
};

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const question = await QuestionService.getById(req.params.id);
    if (!question) {
      sendNotFound(res, 'Question not found');
      return;
    }
    sendSuccess(res, question);
  } catch (error) {
    handleError(res, error);
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const newQuestion = await QuestionService.create(req.body);
    sendCreated(res, newQuestion);
  } catch (error) {
    handleError(res, error, 'Failed to create question');
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const updated = await QuestionService.update(req.params.id, req.body);
    sendSuccess(res, updated);
  } catch (error) {
    handleError(res, error, 'Failed to update question');
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    await QuestionService.remove(req.params.id);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete question');
  }
};
