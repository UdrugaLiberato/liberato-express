import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from "../config/prisma";
import { OAuth2Client } from 'google-auth-library';
import {create} from "../services/user-service";

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

  const validPassword = await bcrypt.compare(password, user.password);
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: COOKIE_EXPIRATION,
  });

  res.json({ message: 'Login successful' });
};

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
}