import { Request, Response } from 'express';
import * as QuestionService from '../services/question-service';

export const getAllQuestions = async (_req: Request, res: Response) => {
  const questions = await QuestionService.getAll();
  res.json(questions);
};

export const getQuestion = async (req: Request, res: Response) => {
  const question = await QuestionService.getById(req.params.id);
  res.json(question);
};

export const createQuestion = async (req: Request, res: Response) => {
  const newQuestion = await QuestionService.create(req.body);
  res.status(201).json(newQuestion);
};

export const updateQuestion = async (req: Request, res: Response) => {
  const updated = await QuestionService.update(req.params.id, req.body);
  res.json(updated);
};

export const deleteQuestion = async (req: Request, res: Response) => {
  await QuestionService.remove(req.params.id);
  res.status(204).send();
};
