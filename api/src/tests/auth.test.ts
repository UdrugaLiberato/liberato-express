import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Answers API', () => {
  let token: string;

  // beforeAll(async () => {
  //   const res = await request(app)
  //     .post('/api/auth/login')
  //     .send({ email: 'testadmin@test.com', password: 'password' });
  //
  //   const cookies = res.headers['set-cookie'];
  //   let bearerCookie = '';
  //
  //   if (cookies) {
  //     const cookieList = Array.isArray(cookies) ? cookies : [cookies];
  //     bearerCookie = cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
  //   }
  //
  //   if (bearerCookie) {
  //     token = bearerCookie.split('=')[1].split(';')[0];
  //   }
  //
  //   const question = await prisma.question.findFirst();
  //   const author = await prisma.user.findFirst();
  //
  //   if (!question || !author) {
  //     throw new Error('Missing test data: question or user not found');
  //   }
  //
  //   questionId = question.id;
  // });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fail to login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@test.com', password: 'krivipassword' });

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie = cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    expect(token).toBe(undefined);
  })

  it('should be able to login', async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testadmin@test.com', password: 'password' });

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie = cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    expect(token).not.toBe(undefined);
  })
});
