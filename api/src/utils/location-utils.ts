import prisma from '../config/prisma';
import googleMaps from './google-maps';
import { SimplifiedAnswer, LocationWithSimplifiedAnswers } from '../types';
import env from '../config/env';

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

export const simplifyAnswers = (answers: any[]): SimplifiedAnswer[] => {
  return answers.map((answer) => ({
    answerId: answer.id,
    answer: answer.answer,
    questionId: answer.question.id,
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

export const createLocationImage = async (
  locationId: string,
  image: {
    path: string;
    name?: string;
    size?: number;
    fileType?: string;
  },
) => {
  return prisma.image.create({
    data: {
      src: `${env.STORE_URL}${image.path}`,
      name: image.name || 'location-image',
      mime: image.fileType || 'application/octet-stream',
      locationId,
    },
  });
};

export const createImages = async (
  files: Express.Multer.File[],
  locationId: string,
) => {
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

export const buildLocationUpdateData = async (
  data: any,
  currentLocation?: { cityId: string; categoryId: string; id: string },
) => {
  const updateData: any = {
    name: data.name,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    cityId: data.cityId,
    categoryId: data.categoryId,
    featured: data.featured === undefined ? undefined : toInt(data.featured),
    published: data.published === undefined ? undefined : toInt(data.published),
    updatedAt: new Date(),
  };

  // Generate slug if name, cityId, or categoryId is being updated
  if (
    (data.name !== undefined || data.cityId !== undefined || data.categoryId !== undefined) &&
    currentLocation
  ) {
    const finalCityId = data.cityId || currentLocation.cityId;
    const finalCategoryId = data.categoryId || currentLocation.categoryId;
    const finalName = data.name || 'Unknown'; // fallback if name is undefined

    updateData.slug = await getUniqueSlug(
      finalName,
      finalCityId,
      finalCategoryId,
      currentLocation.id,
    );
  }

  return updateData;
};

export const fromPascalWithDashes = (input: string): string => {
  return input
    .split('-') // split on dashes first
    .map((part) =>
      part
        .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .toLowerCase(),
    )
    .join(' - ')
    .replace(/^./, (c) => c.toUpperCase());
};

export const generateSlug = (name: string): string => {
  const croatianCharMap: { [key: string]: string } = {
    š: 's',
    đ: 'd',
    č: 'c',
    ć: 'c',
    ž: 'z',
    Š: 's',
    Đ: 'd',
    Č: 'c',
    Ć: 'c',
    Ž: 'z',
  };

  const slug = [...name]
    .map((char) => croatianCharMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^\da-z-]/g, '')
    .replaceAll(/-+/g, '-')
    .replaceAll(/(^-)|(-$)/g, '');

  // Ensure slug is trimmed to 255 characters
  return slug.slice(0, 255);
};

export const getUniqueSlug = async (
  name: string,
  cityId: string,
  categoryId: string,
  excludeId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(name);

  // First, check if the base slug is available within the same city and category
  const baseSlugExists = await prisma.location.findFirst({
    where: {
      slug: baseSlug,
      cityId,
      categoryId,
      deletedAt: null
    },
    select: { id: true },
  });

  if (!baseSlugExists || (excludeId && baseSlugExists.id === excludeId)) {
    return baseSlug;
  }

  // Generate numbered variants and check them in batch
  const maxAttempts = 100; // Reasonable limit to prevent infinite loops
  const slugVariants = [];

  for (let counter = 1; counter <= maxAttempts; counter++) {
    let slug = `${baseSlug}-${counter}`;
    // Ensure the final slug with counter doesn't exceed 255 characters
    if (slug.length > 255) {
      const maxBaseLength = 255 - `-${counter}`.length;
      slug = `${baseSlug.slice(0, maxBaseLength)}-${counter}`;
    }
    slugVariants.push(slug);
  }

  // Check all variants at once
  const existingSlugs = await prisma.location.findMany({
    where: {
      slug: { in: slugVariants },
      cityId,
      categoryId,
      deletedAt: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { slug: true },
  });

  const existingSlugSet = new Set(existingSlugs.map((location) => location.slug));

  // Return the first available variant
  const availableVariant = slugVariants.find(
    (variant) => !existingSlugSet.has(variant),
  );
  if (availableVariant) {
    return availableVariant;
  }

  // If no variant is available after maxAttempts, add a timestamp
  const timestamp = Date.now();
  let finalSlug = `${baseSlug}-${timestamp}`;
  if (finalSlug.length > 255) {
    const maxBaseLength = 255 - `-${timestamp}`.length;
    finalSlug = `${baseSlug.slice(0, maxBaseLength)}-${timestamp}`;
  }

  return finalSlug;
};
