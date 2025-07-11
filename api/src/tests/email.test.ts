import dotenv from 'dotenv';

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

dotenv.config({ path: '.env.test' });

describe('Emails API', () => {
  let token: string;
  let testEmailId: string | null = null;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all emails', async () => {
    const res = await request(app)
      .get('/api/emails')
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting all emails:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create an email', async () => {
    const emailAddress = `test${Math.floor(Math.random() * 10_000)}@example.com`;
    const res = await request(app)
      .post('/api/emails')
      .set('Cookie', [`BEARER=${token}`])
      .send({
        message_id: 'asldkj',
        from_address: emailAddress,
        from_name: 'Test name',
        subject: 'Test Subject',
        body: 'Test Body',
        attachments: 'testAttachments',
        date: '2025-04-04T13:05:38+00:00',
      });

    if (res.statusCode !== 201) {
      console.error('Error creating email:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');

    testEmailId = res.body.id;
  });

  it('should get the created email', async () => {
    const res = await request(app)
      .get(`/api/emails/${testEmailId}`)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting email:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testEmailId);
  });

  it('should update the email subject', async () => {
    const updatedSubject = 'Updated Subject';
    const res = await request(app)
      .put(`/api/emails/${testEmailId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ subject: updatedSubject });

    if (res.statusCode !== 200) {
      console.error('Error updating email:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.subject).toEqual(updatedSubject);
  });
});
