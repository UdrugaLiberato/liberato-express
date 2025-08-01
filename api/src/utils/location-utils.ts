import prisma from '../config/prisma';
import googleMaps from './google-maps';
import { SimplifiedAnswer, LocationWithSimplifiedAnswers } from '../types';

export const locationInclude = {
  answer: {
    include: {
      question: true,
    },
  },
  image: {
    where: {
      deletedAt: null,
    },
  },
  city: true,
  category: true,
};

export const resetImageSequence = async () => {
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('image', 'id'), (SELECT MAX(id) FROM image) + 1)`;
};

export const simplifyAnswers = (answers: any[]): SimplifiedAnswer[] => {
  return answers.map((answer) => ({
    answerId: answer.id,
    answer: answer.answer,
    questionId: answer.questionId,
    question: answer.question.question,
  }));
};

export const addSimplifiedAnswers = (
  location: any,
): LocationWithSimplifiedAnswers => {
  const { answer, ...locationWithoutAnswer } = location;
  return {
    ...locationWithoutAnswer,
    answers: simplifyAnswers(answer || []),
  };
};

export const getCoordinates = async (address: string) => {
  return googleMaps.getCoordinateForStreet('', address);
};

export const createImages = async (
  files: Express.Multer.File[],
  locationId: string,
) => {
  await resetImageSequence();
  return Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: `https://dev.udruga-liberato.hr/images/location/${file.filename}`,
          name: file.originalname.split('.')[0],
          mime: file.mimetype,
          locationId,
        },
      }),
    ),
  );
};

export const createAnswers = async (answers: string, locationId: string) => {
  if (!answers) return;

  const items = answers
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  return Promise.all(
    items.map(async (item) => {
      const [questionId, answer] = item.split(':');
      return prisma.answer.create({
        data: {
          question: { connect: { id: questionId } },
          location: { connect: { id: locationId } },
          answer: answer === 'true' ? 1 : 0,
          createdAt: new Date(),
        },
      });
    }),
  );
};

export const toInt = (value: boolean | number | string): number => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true' || value === '1') {
      return 1;
    }
    if (value.toLowerCase() === 'false' || value === '0') {
      return 0;
    }
    // Try to parse as number
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return value;
};

export const buildLocationUpdateData = (data: any) => ({
  name: data.name,
  address: data.address,
  latitude: data.latitude,
  longitude: data.longitude,
  cityId: data.cityId,
  categoryId: data.categoryId,
  featured: data.featured === undefined ? undefined : toInt(data.featured),
  published: data.published === undefined ? undefined : toInt(data.published),
  updatedAt: new Date(),
});
