import request from 'supertest';
import { describe, it, expect } from '@jest/globals';
import googleMaps from '../utils/google-maps';
import prisma from '../config/prisma';

describe('GoogleMaps', () => {
  const apiKey = 'test-api-key';

  it('should get coordinates for a city', async () => {
    const city = 'Zagreb';
    const result = await googleMaps.getCoordinateForCity(city);

    expect(result).toBeDefined();
    expect(result.lat).toBeDefined();
    expect(result.lng).toBeDefined();
  });

  it('should throw CoordinatesNotFound for non-existent city', async () => {
    const city = 'NonExistentCity12345';

    await expect(googleMaps.getCoordinateForCity(city)).rejects.toThrow('Coordinates for "NonExistentCity12345" could not be found.');
  });

  it('should get coordinates for a street', async () => {
    const street = 'Ilica';
    const city = 'Zagreb';
    const result = await googleMaps.getCoordinateForStreet(street, city);

    expect(result).toBeDefined();
    expect(result.lat).toBeDefined();
    expect(result.lng).toBeDefined();
    expect(result.formattedAddress).toBeDefined();
  });

  it('should throw CoordinatesNotFound for non-existent street', async () => {
    const street = 'NonExistentStreet12345';
    const city = 'NonExistentCity12345';

    await expect(googleMaps.getCoordinateForStreet(street, city)).rejects.toThrow('Coordinates for "NonExistentStreet12345 NonExistentCity12345" could not be found.');
  });
});
