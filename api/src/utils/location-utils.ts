import prisma from '../config/prisma';
import googleMaps from './google-maps';

export interface LocationFilters {
  cityId?: string;
  categoryId?: string;
  includeAnswers?: boolean;
  includeImages?: boolean;
  includeQuestions?: boolean;
}

export interface SimplifiedAnswer {
  id: string;
  answer: string;
  questionId: string;
}

export interface LocationWithSimplifiedAnswers {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cityId: string;
  categoryId: string;
  answers: SimplifiedAnswer[];
}

export const locationInclude = {
  answers: {
    include: {
      question: true,
    },
  },
  images: true,
  city: true,
  category: true,
};

export const resetImageSequence = async () => {
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('image', 'id'), (SELECT MAX(id) FROM image) + 1)`;
};

export const simplifyAnswers = (answers: any[]): SimplifiedAnswer[] => {
  return answers.map((answer) => ({
    id: answer.id,
    answer: answer.answer,
    questionId: answer.questionId,
  }));
};

export const addSimplifiedAnswers = (
  location: any,
): LocationWithSimplifiedAnswers => {
  return {
    ...location,
    answers: simplifyAnswers(location.answers || []),
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

  await prisma.answer.createMany({
    data: items.map(() => ({
      answer: 1,
      locationId,
      createdAt: new Date(),
    })),
  });
};

export const buildLocationUpdateData = (data: any) => ({
  name: data.name,
  address: data.address,
  latitude: data.latitude,
  longitude: data.longitude,
  cityId: data.cityId,
  categoryId: data.categoryId,
  updatedAt: new Date(),
});

export const toInt = (value: boolean | number): number => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value;
};
