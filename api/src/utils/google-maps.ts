import axios from 'axios';
import CoordinatesNotFound from '../exceptions/CoordinatesNotFound';

const GOOGLE_API_KEY: string = process.env.GOOGLE_API_KEY!;

export class GoogleMaps {
  constructor(private apiKey: string = GOOGLE_API_KEY) {}

  async getCoordinateForCity(
    city: string,
  ): Promise<{ lat: number; lng: number }> {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: city,
          inputtype: 'textquery',
          fields: 'geometry',
          key: this.apiKey,
        },
      },
    );

    const { data } = response;

    if (data.status === 'ZERO_RESULTS') {
      throw new CoordinatesNotFound(
        `Coordinates for "${city}" could not be found.`,
      );
    }

    const { lat } = data.candidates[0].geometry.location;
    const { lng } = data.candidates[0].geometry.location;

    return { lat, lng };
  }

  async getCoordinateForStreet(
    street: string,
    city: string,
  ): Promise<{ lat: number; lng: number; formatted_address: string }> {
    const address = `${street} ${city}`;
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          fields: 'geometry',
          key: this.apiKey,
        },
      },
    );

    const { data } = response;

    if (data.status === 'ZERO_RESULTS') {
      throw new CoordinatesNotFound(
        `Coordinates for "${address}" could not be found.`,
      );
    }

    const result = data.results[0];
    const { lat } = result.geometry.location;
    const { lng } = result.geometry.location;
    const { formatted_address } = result;

    return { lat, lng, formatted_address };
  }
}
