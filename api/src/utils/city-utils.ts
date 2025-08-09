import prisma from '../config/prisma';
import { CityData, CityUpdateData } from '../types';
import env from '../config/env';

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
  excludeId?: string,
): Promise<string> => {
  const baseSlug = generateSlug(name);

  // First, check if the base slug is available
  const baseSlugExists = await prisma.city.findUnique({
    where: { slug: baseSlug },
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
  const existingSlugs = await prisma.city.findMany({
    where: {
      slug: { in: slugVariants },
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { slug: true },
  });

  const existingSlugSet = new Set(existingSlugs.map((city) => city.slug));

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

export const buildCityData = async (data: CityData) => ({
  name: data.name,
  slug: await getUniqueSlug(data.name),
  descriptionEN: data.descriptionEN,
  descriptionHR: data.descriptionHR,
  latitude: data.latitude,
  longitude: data.longitude,
  radiusInKm: data.radiusInKm ?? 1,
  createdAt: new Date(),
});

export const buildCityUpdateData = async (
  data: CityUpdateData,
  excludeId?: string,
) => ({
  ...data,
  ...(data.name && { slug: await getUniqueSlug(data.name, excludeId) }),
  updatedAt: new Date(),
});

export const validateCityDeletion = async (id: string) => {
  const city = await prisma.city.findUnique({
    where: { id },
    include: { location: true },
  });

  if (!city) {
    throw new Error('City not found');
  }

  if (city.location.length > 0) {
    throw new Error('City has linked locations and cannot be deleted');
  }

  return city;
};

export const createCityImage = async (
  cityId: string,
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
      name: image.name || 'city-image',
      mime: image.fileType || 'application/octet-stream',
      cityId,
    },
  });
};
