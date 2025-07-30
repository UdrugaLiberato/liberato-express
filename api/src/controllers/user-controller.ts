import { Request, Response } from 'express';
import * as userService from '../services/user-service';
import {
  buildUserResponse,
  buildSimpleUserResponse,
} from '../utils/user-utils';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendForbidden,
} from '../utils/controller-utils';

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAll();
    sendSuccess(res, users);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMyself = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendForbidden(res);
      return;
    }
    const user = await userService.getById(req.user.id);

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    sendSuccess(res, buildUserResponse(user));
  } catch (error) {
    handleError(res, error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getById(req.params.id);

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    sendSuccess(res, buildSimpleUserResponse(user));
  } catch (error) {
    handleError(res, error);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.create(req.body);
    sendCreated(res, newUser);
  } catch (error) {
    handleError(res, error, 'Failed to create user');
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updated = await userService.update(req.params.id, req.body);
    sendSuccess(res, updated);
  } catch (error) {
    handleError(res, error, 'Failed to update user');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.remove(req.params.id);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error, 'Failed to delete user');
  }
};
