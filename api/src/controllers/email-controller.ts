import { Request, Response } from 'express'
import * as EmailsService from '../services/email-service'

export const getAllEmails = async (_req: Request, res: Response) => {
  const emails = await EmailsService.getAll();
  res.json(emails);
}

export const getEmail = async (req: Request, res: Response) => {
  const email = await EmailsService.getById(req.params.id);
  res.json(email);
}

export const createEmail = async (req: Request, res: Response) => {
  const newEmail = await EmailsService.create(req.body);
  res.status(201).json(newEmail);
}

export const updateEmail = async (req: Request, res: Response) => {
  const updated = await EmailsService.update(req.params.id, req.body);
  res.json(updated);
}