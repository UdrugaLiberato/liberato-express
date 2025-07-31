import { ImageData, ImageUpdateData } from '../types';

export const imageInclude = {
  category: true,
  location: true,
};

export const buildImageData = (data: ImageData) => ({
  src: data.src,
  name: data.name,
  mime: data.mime,
  categoryId: data.categoryId,
  locationId: data.locationId,
  createdAt: new Date(),
});

export const buildImageUpdateData = (data: ImageUpdateData) => ({
  ...data,
  updatedAt: new Date(),
});

export const parseImageId = (id: string): number => {
  return Number.parseInt(id, 10);
};
