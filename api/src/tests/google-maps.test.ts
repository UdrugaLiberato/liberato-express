import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import axios from 'axios';
import {GoogleMaps} from "../utils/google-maps";
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GoogleMaps', () => {
  const apiKey = 'fake-api-key';
  const googleMaps = new GoogleMaps(apiKey);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCoordinateForCity', () => {
    it('should return coordinates for a valid city', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'OK',
          candidates: [
            { geometry: { location: { lat: 52.52, lng: 13.405 } } }
          ]
        }
      });

      const coords = await googleMaps.getCoordinateForCity('Berlin');
      expect(coords).toEqual({ lat: 52.52, lng: 13.405 });
    });

    it('should throw an error if city not found', async () => {
      mockedAxios.get.mockResolvedValue({ data: { status: 'ZERO_RESULTS' } });

      await expect(googleMaps.getCoordinateForCity('Unknownville')).rejects.toThrow(
        'Coordinates for "Unknownville" could not be found.'
      );
    });
  });

  describe('getCoordinateForStreet', () => {
    it('should return coordinates and address for a valid street and city', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'OK',
          results: [
            {
              formatted_address: 'Some street in, Berlin, Germany',
              geometry: { location: { lat: 52.5, lng: 13.4 } }
            }
          ]
        }
      });

      const coords = await googleMaps.getCoordinateForStreet('Example St', 'Berlin');
      expect(coords).toEqual({
        lat: 52.5,
        lng: 13.4,
        formatted_address: 'Some street in, Berlin, Germany'
      });
    });

    it('should throw an error if address not found', async () => {
      mockedAxios.get.mockResolvedValue({ data: { status: 'ZERO_RESULTS' } });

      await expect(googleMaps.getCoordinateForStreet('Unknown St', 'Nowhere')).rejects.toThrow(
        'Coordinates for "Unknown St Nowhere" could not be found.'
      );
    });
  });
});