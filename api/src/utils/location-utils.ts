import prisma from '../config/prisma';
import { GoogleMaps } from './google-maps';

// Types
export interface LocationFilters {
  city?: string;
  category?: string;
}

export interface SimplifiedAnswer {
  answerId: string;
  questionId: string;
  question: string;
  answer: number;
}

export interface LocationWithSimplifiedAnswers {
  id: string;
  name: string;
  street: string;
  phone?: string;
  email?: string;
  about?: string;
  latitude: number;
  longitude: number;
  published: number;
  featured: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  city: any;
  category: any;
  user?: { id: string; username: string };
  image: any[];
  answer: SimplifiedAnswer[];
}

// Common Prisma include object for locations
export const locationInclude = {
  city: true,
  category: true,
  user: { select: { id: true, username: true } },
  answer: {
    select: {
      id: true,
      answer: true,
      question: { select: { id: true, question: true } },
    },
  },
  image: true,
};

// Utility function to reset the auto-increment sequence for the image table
export const resetImageSequence = async () => {
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('image', 'id'), COALESCE((SELECT MAX(id) FROM image), 0) + 1, false)`;
};

// Simplify answers from Prisma result
export const simplifyAnswers = (answers: any[]): SimplifiedAnswer[] => {
  return (answers || [])
    .filter((a) => a.question !== null)
    .map((a) => ({
      answerId: a.id,
      questionId: a.question!.id,
      question: a.question!.question,
      answer: a.answer,
    }));
};

// Add simplified answers to location
export const addSimplifiedAnswers = (
  location: any,
): LocationWithSimplifiedAnswers => {
  return {
    ...location,
    answer: simplifyAnswers(location.answer),
  };
};

// Get coordinates from Google Maps
export const getCoordinates = async (street: string, cityName: string) => {
  const googleMaps = new GoogleMaps();
  const geo = await googleMaps.getCoordinateForStreet(street, cityName);

  if (!geo?.lat || !geo?.lng) {
    throw new Error('Google Maps failed to find coordinates');
  }

  return {
    latitude: geo.lat,
    longitude: geo.lng,
    formattedAddress: geo.formatted_address || street,
  };
};

// Create image records
export const createImages = async (
  files: Express.Multer.File[],
  locationId: string,
) => {
  await resetImageSequence();

  return Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: `https://dev.udruga-liberato.hr/images/locations/${file.filename}`,
          name: file.originalname.split('.')[0],
          mime: file.mimetype,
          locationId,
        },
      }),
    ),
  );
};

// Create answer records from QA string
export const createAnswers = async (qaString: string, locationId: string) => {
  const qaItems = qaString.split(',');

  return Promise.all(
    qaItems.map(async (item: string) => {
      const [questionId, answer] = item.split(':');
      return prisma.answer.create({
        data: {
          question: { connect: { id: questionId } },
          answer: answer === 'true' ? 1 : 0,
          location: { connect: { id: locationId } },
          createdAt: new Date(),
        },
      });
    }),
  );
};

// Build location update data
export const buildLocationUpdateData = (body: any) => {
  const dataToUpdate: any = {};

  if (body.name !== undefined) dataToUpdate.name = body.name;
  if (body.street !== undefined) dataToUpdate.street = body.street;
  if (body.phone !== undefined) dataToUpdate.phone = body.phone;
  if (body.email !== undefined) dataToUpdate.email = body.email;
  if (body.about !== undefined) dataToUpdate.about = body.about;

  if (body.categoryId !== undefined) {
    dataToUpdate.category = { connect: { id: body.categoryId } };
  }

  if (body.city_id !== undefined) {
    dataToUpdate.city = { connect: { id: body.city_id } };
  }

  if (body.published !== undefined) {
    dataToUpdate.published =
      body.published === true || body.published === 'true' ? 1 : 0;
  }

  if (body.featured !== undefined) {
    dataToUpdate.featured =
      body.featured === true || body.featured === 'true' ? 1 : 0;
  }

  dataToUpdate.updatedAt = new Date();

  return dataToUpdate;
};

// Convert boolean/string to integer
export const toInt = (value: boolean | string): number => {
  return value === true || value === 'true' ? 1 : 0;
};
