import { Request, Response } from 'express';
import * as MemberService from '../services/member-service';

export const getAllMembers = async (_req: Request, res: Response) => {
  const members = await MemberService.getAll();
  res.json(members);
};

export const getMember = async (req: Request, res: Response) => {
  const member = await MemberService.getById(req.params.id);
  res.json(member);
};

export const createMember = async (req: Request, res: Response) => {
  const newMember = await MemberService.create(req.body);
  res.status(201).json(newMember);
};

export const updateMember = async (req: Request, res: Response) => {
  const updated = await MemberService.update(req.params.id, req.body);
  res.json(updated);
};

export const deleteMember = async (req: Request, res: Response) => {
  await MemberService.remove(req.params.id);
  res.status(200).send();
};
