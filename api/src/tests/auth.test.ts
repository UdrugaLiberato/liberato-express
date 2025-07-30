import dotenv from 'dotenv';

import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import app from '../index';
import prisma from '../config/prisma';

dotenv.config({ path: '.env.test' });

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'googletestuser@test.com',
          name: 'Test Google User',
          picture: 'https://example.com/avatar.png',
          sub: 'mock-google-id',
        }),
      }),
    })),
  };
});

describe('Answers API', () => {
  let token: string;

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
      bearerCookie =
        cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    expect(token).toBe(undefined);
  });

  it('should be able to login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@test.com', password: 'password' });

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie =
        cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    expect(token).not.toBe(undefined);
  });

  it('should login using mocked Google Sign-In', async () => {
    const res = await request(app)
      .post('/api/auth/google-login')
      .send({ token: 'fake-google-token' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Google login successful');

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie =
        cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    expect(bearerCookie).toBeDefined();
  });
});
