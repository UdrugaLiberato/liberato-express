import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../api/src';
import prisma from '../api/src/config/prisma';

describe('Members API', () => {
  let token: string;
  let testMemberId: string | null = null;
  let testMemberFirstname: string | null = null;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all members', async () => {
    const res = await request(app)
      .get('/api/members')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a member', async () => {
    const memberData = {
      firstname: 'Ivan',
      lastname: 'Ivic',
      is_student: true,
      dob: '1995-04-12T00:00:00.000Z',
      oib: Math.floor(Math.random() * 100000000000).toString(),
      address: 'Trg bana Jelačića 5',
      city: 'Zagreb',
      phone: Math.floor(Math.random() * 100000000000).toString(),
      email: `testni+${Math.floor(Math.random() * 10000)}@example.com`,
      disabled_percent: '100',
      join_date: '2024-04-12T00:00:00.000Z',
      is_active: true
    };

    const res = await request(app)
      .post('/api/members')
      .set('Cookie', [`BEARER=${token}`])
      .send(memberData);

    if (res.statusCode !== 201) {
      console.error(res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.firstname).toEqual(memberData.firstname);

    testMemberFirstname = res.body.firstname;
    testMemberId = res.body.id;
  });

  it('should get the created member', async () => {
    const res = await request(app)
      .get(`/api/members/${testMemberId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testMemberId);
  });

  it('should update the member firstname', async () => {
    const updatedFirstname = testMemberFirstname + ' Updated';
    const res = await request(app)
      .put(`/api/members/${testMemberId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ firstname: updatedFirstname });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.firstname).toEqual(updatedFirstname);
  });

  it('should delete the member', async () => {
    const res = await request(app)
      .delete(`/api/members/${testMemberId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
  });
});
