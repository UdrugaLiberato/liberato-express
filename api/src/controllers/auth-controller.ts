import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from "../config/prisma";

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const COOKIE_EXPIRATION = parseInt(process.env.COOKIE_EXPIRATION || '3600000', 10);

export const login = async (req: Request, res: Response) => {
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