import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { createIncomplete } from '../services/user-service';
import {
  generateToken,
  setAuthCookie,
  verifyPassword,
  verifyGoogleToken,
} from '../utils/auth-utils';
import { AuthResponse, RegisterResponse } from '../types';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendUnauthorized,
  sendBadRequest,
  sendInternalError,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';
import env from '../config/env';

const { GOOGLE_CLIENT_ID } = env;

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { emailAddress: email },
    });

    if (!user) {
      sendUnauthorized(res, 'Invalid credentials');
      return;
    }

    if (!user.password) {
      throw new Error('User password is null');
    }

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      sendUnauthorized(res, 'Invalid credentials');
      return;
    }

    const token = generateToken(user.id, user.roles);
    setAuthCookie(res, token);

    const response: AuthResponse = {
      role: user.roles,
      name: user.username,
      email: user.emailAddress,
      token,
      id: user.id,
    };

    sendSuccess(res, response);
  } catch (error) {
    handleError(res, error, 'Login failed');
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    const missingFields = validateRequiredFields(req.body, [
      'email',
      'password',
      'username',
    ]);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { emailAddress: email },
    });
    if (existingUser) {
      sendBadRequest(res, 'User already registered');
      return;
    }

    const avatar = file?.filename || '';

    const newUser = await createIncomplete(email, password, username, avatar);

    if (!newUser) {
      sendInternalError(res, 'Unexpected error');
      return;
    }

    const response: RegisterResponse = {
      username: newUser.username,
      email: newUser.emailAddress,
      avatar: newUser.avatarUrl,
      id: newUser.id,
    };

    sendCreated(res, response);
  } catch (error) {
    handleError(res, error, 'Registration failed');
  }
};

const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const payload = await verifyGoogleToken(token, GOOGLE_CLIENT_ID);
    if (!payload) {
      sendUnauthorized(res, 'Invalid Google token');
      return;
    }

    const { email, name, picture } = payload;

    if (!email) {
      sendUnauthorized(res, 'Invalid Google token - no email');
      return;
    }

    let user = await prisma.user.findUnique({ where: { emailAddress: email } });

    if (!user) {
      const userName = name || 'User';
      const userPicture = picture || '';
      user = await createIncomplete(email, '', userName, userPicture);
    }

    if (!user) {
      sendInternalError(res, 'Error creating user');
      return;
    }

    const jwtToken = generateToken(user.id, user.roles);
    setAuthCookie(res, jwtToken);

    sendSuccess(res, { message: 'Google login successful' });
  } catch (error) {
    handleError(res, error, 'Google authentication failed');
  }
};

export { login, googleLogin, register };
