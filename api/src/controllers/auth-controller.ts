import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from "../config/prisma";

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
    {
      id: user.id,
      role: user.roles,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRATION }
  );

  res.cookie('BEARER', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: process.env.JWT_EXPIRATION,
  });

  res.json({ message: 'Login successful' });
};