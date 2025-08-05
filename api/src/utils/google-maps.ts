import axios from 'axios';
import CoordinatesNotFound from '../exceptions/CoordinatesNotFound';
import env from '../config/env';

const { GOOGLE_API_KEY } = env;

class GoogleMaps {
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

    if (
      data.status === 'ZERO_RESULTS' ||
      !data.candidates ||
      data.candidates.length === 0
    ) {
      throw new CoordinatesNotFound(
        `Coordinates for "${city}" could not be found.`,
      );
    }

    const candidate = data.candidates[0];
    if (!candidate.geometry || !candidate.geometry.location) {
      throw new CoordinatesNotFound(`Invalid response format for "${city}".`);
    }

    const { lat } = candidate.geometry.location;
    const { lng } = candidate.geometry.location;

    return { lat, lng };
  }

  async getCoordinateForStreet(
    street: string,
    city: string,
  ): Promise<{ lat: number; lng: number; formattedAddress: string }> {
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

    if (
      data.status === 'ZERO_RESULTS' ||
      !data.results ||
      data.results.length === 0
    ) {
      throw new CoordinatesNotFound(
        `Coordinates for "${address}" could not be found.`,
      );
    }

    const result = data.results[0];
    if (!result.geometry || !result.geometry.location) {
      throw new CoordinatesNotFound(
        `Invalid response format for "${address}".`,
      );
    }

    const { lat } = result.geometry.location;
    const { lng } = result.geometry.location;
    const formattedAddress = result.formatted_address || address;

    return { lat, lng, formattedAddress };
  }
}

const googleMaps = new GoogleMaps();

export default googleMaps;
