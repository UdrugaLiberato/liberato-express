import { Request, Response } from 'express'
import * as AnswerService from '../services/answer-service'

export const getAllAnswers = async (_req: Request, res: Response) => {
  const answers = await AnswerService.getAll();
  res.json(answers);
}

export const getAnswer = async (req: Request, res: Response) => {
  const answer = await AnswerService.getById(req.params.id);
  res.json(answer);
}

export const createAnswer = async (req: Request, res: Response) => {
  const newAnswer = await AnswerService.create(req.body);
  res.status(201).json(newAnswer);
}

export const updateAnswer = async (req: Request, res: Response) => {
  const updated = await AnswerService.update(req.params.id, req.body);
  res.json(updated);
}

export const deleteAnswer = async (req: Request, res: Response) => {
  await AnswerService.remove(req.params.id);
  res.status(204).send();
}