import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from "../config/prisma";
import { OAuth2Client } from 'google-auth-library';
import {create, createIncomplete} from "../services/user-service";
import {createUser} from "./user-controller";
import * as userService from "../services/user-service";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const COOKIE_EXPIRATION = parseInt(process.env.COOKIE_EXPIRATION || '3600000', 10);

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (!user.password) {
    throw new Error("User password is null");
  }

  const hash = user.password.replace(/^\$2y\$/, '$2b$'); // normalize prefix todo viktor @reminder

  const validPassword = await bcrypt.compare(password, hash);
  if (!validPassword) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }


  const token = jwt.sign(
    { id: user.id, role: user.roles },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION } as jwt.SignOptions
  );

  res.cookie('BEARER', token, {
    httpOnly: true,
    secure: true, // process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: COOKIE_EXPIRATION,
  });

  res.json({
    // message: 'Login successful',
    role: user.roles,
    name: user.username,
    email: user.email,
    token: token,
    id: user.id,
  });
};

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const file = req.file as Express.Multer.File | undefined;

    if (!email || !password || !username) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already registered' });
      return;
    }

    // Handle avatar
    const avatar = file?.filename || '';

    const newUser = await userService.createIncomplete(email, password, username, avatar);

    if (!newUser) {
      res.status(500).json({ message: 'Unexpected error' });
      return;
    }

    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      id: newUser.id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// const register = async (req: Request, res: Response) => {
//   let {
//     email,
//     password,
//     username,
//     avatar
//   } = req.body;
//
//   if (!email || !password || !username) {
//     res.status(400).json({ message: 'Missing required fields' });
//     return;
//   }
//
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (user) {
//     res.status(400).json({ message: 'User already registered' });
//     return;
//   }
//
//   if (!avatar) {
//     avatar = '';
//   }
//
//   const newUser = await userService.createIncomplete(email, password, username, avatar);
//
//   if (!newUser) {
//     res.status(500).json({ message: 'Unexpected error' });
//     return;
//   }
//
//   res.status(201).send();
// }

const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ message: 'Invalid Google token' });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('User not found');
      user = await create({
        username: name,
        email: email,
        avatar: picture || '',
      });
    }

    if (!user) {
      res.status(500).json({ message: 'Error' });
      return;
    }

    const jwtToken = jwt.sign(
      { id: user.id, role: user.roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } as jwt.SignOptions
    );

    res.cookie('BEARER', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: COOKIE_EXPIRATION,
    });

    res.json({ message: 'Google login successful' });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export {
  login,
  googleLogin,
  register
}