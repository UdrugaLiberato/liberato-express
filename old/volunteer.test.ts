import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../api/src';
import prisma from '../api/src/config/prisma';

describe('Volunteers API', () => {
  let token: string;

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

  let testVolunteerId: string | null = null;

  it('should get all volunteers', async () => {
    const res = await request(app)
      .get('/api/volunteers')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a volunteer', async () => {
    const volunteerData = {
      first_name: 'Test volunteer ' + Date.now() ,
      last_name: 'prezime' + Date.now(),
      city: 'Test grad',
      email: 'testmail+' + Date.now() + '@gmail.com',
      membership: true,
      reason: 'Razlog',
      resume: 'test resume',
      notes: 'Test note',
    };

    const res = await request(app)
      .post('/api/volunteers')
      .set('Cookie', [`BEARER=${token}`])
      .send(volunteerData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.first_name).toEqual(volunteerData.first_name);

    testVolunteerId = res.body.id;
  });

  it('should get the created volunteer', async () => {
    const res = await request(app)
      .get('/api/volunteers/' + testVolunteerId)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testVolunteerId);
  });

  it('should update the volunteer', async () => {
    const updatedData = {
      first_name: 'Ana' + Date.now(),
      notes: 'Notes... updated',
    };

    const res = await request(app)
      .put('/api/volunteers/' + testVolunteerId)
      .set('Cookie', [`BEARER=${token}`])
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.first_name).toEqual(updatedData.first_name);
    expect(res.body.notes).toEqual(updatedData.notes);
  });

  it('should delete the volunteer', async () => {
    const res = await request(app)
      .delete('/api/volunteers/' + testVolunteerId)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
  });
});