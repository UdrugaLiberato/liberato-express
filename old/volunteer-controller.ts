import { Request, Response } from 'express';
import * as VolunteerService from '../services/volunteer-service';

export const getAllVolunteers = async (_req: Request, res: Response) => {
  const volunteers = await VolunteerService.getAll();
  res.json(volunteers);
}

export const getVolunteer = async (req: Request, res: Response) => {
  const volunteer = await VolunteerService.getById(req.params.id);
  res.json(volunteer);
}

export const createVolunteer = async (req: Request, res: Response) => {
  const newVolunteer = await VolunteerService.create(req.body);
  res.status(201).json(newVolunteer);
}

export const updateVolunteer = async (req: Request, res: Response) => {
  const updated = await VolunteerService.update(req.params.id, req.body);
  res.json(updated);
}

export const deleteVolunteer = async (req: Request, res: Response) => {
  await VolunteerService.remove(req.params.id);
  res.status(200).send();
}