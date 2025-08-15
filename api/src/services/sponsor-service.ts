import env from '../config/env';
import prisma from '../config/prisma';
import { UploadResponseData } from '../types';

export const getAll = () => {
  return prisma.sponsor.findMany({
    include: {
      imageLight: true,
      imageDark: true,
    },
    where: {
      deletedAt: null,
    },
  });
};

export const getById = (id: string) => {
  return prisma.sponsor.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      imageLight: true,
      imageDark: true,
    },
  });
};

const updateWithImages = async (
  sponsorId: string,
  uploadResponseData: UploadResponseData,
  originalFiles:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[],
) => {
  if (!Array.isArray(uploadResponseData.files)) {
    return;
  }

  // Remove existing images (soft delete)
  await prisma.image.updateMany({
    where: {
      OR: [{ sponsorLightId: sponsorId }, { sponsorDarkId: sponsorId }],
    },
    data: { deletedAt: new Date() },
  });

  // Map uploaded files back to their original field names
  const fileMapping: { [key: string]: any } = {};
  let fileIndex = 0;

  if (Array.isArray(originalFiles)) {
    // Fallback: treat first as light, second as dark
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, file] of uploadResponseData.files.entries()) {
      const isLight = index === 0;
      fileMapping[isLight ? 'light' : 'dark'] = file;
    }
  } else {
    // Handle field-based uploads
    if (originalFiles.light_image && originalFiles.light_image.length > 0) {
      fileMapping.light = uploadResponseData.files[fileIndex];
      fileIndex++;
    }
    if (originalFiles.dark_image && originalFiles.dark_image.length > 0) {
      fileMapping.dark = uploadResponseData.files[fileIndex];
      fileIndex++;
    }
  }

  // Create new images with proper light/dark assignment
  const imagePromises = Object.entries(fileMapping).map(([type, file]) => {
    return prisma.image.create({
      data: {
        src: env.STORE_URL + file.path,
        name: file.name || `sponsor-${type}-image`,
        mime: file.fileType,
        sponsorLightId: type === 'light' ? sponsorId : null,
        sponsorDarkId: type === 'dark' ? sponsorId : null,
      },
    });
  });

  await Promise.all(imagePromises);
};

export const create = async (
  name: string,
  alt: string,
  description: string,
  url: string,
  uploadResponseData: UploadResponseData | null,
  weight: number = 0,
) => {
  const sponsor = await prisma.sponsor.create({
    data: {
      name,
      alt,
      description,
      url,
      weight,
    },
  });

  // Handle image uploads if provided
  if (uploadResponseData && Array.isArray(uploadResponseData.files)) {
    await updateWithImages(sponsor.id, uploadResponseData, []);
  }

  return sponsor;
};

export { updateWithImages };

export const update = async (
  id: string,
  name?: string,
  alt?: string,
  description?: string,
  url?: string,
  weight?: number,
) => {
  const updateData: any = { updatedAt: new Date() };

  if (name !== undefined) updateData.name = name;
  if (alt !== undefined) updateData.alt = alt;
  if (description !== undefined) updateData.description = description;
  if (url !== undefined) updateData.url = url;
  if (weight !== undefined) updateData.weight = weight;

  const sponsor = await prisma.sponsor.update({
    where: { id },
    data: updateData,
  });

  return sponsor;
};

export const remove = (id: string) => {
  return prisma.sponsor.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
