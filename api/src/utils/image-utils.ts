export interface ImageData {
  src: string;
  name: string;
  mime: string;
  categoryId?: string;
  locationId?: string;
}

export interface ImageUpdateData {
  src?: string;
  name?: string;
  mime?: string;
}

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
});

export const buildImageUpdateData = (data: ImageUpdateData) => ({
  ...data,
  updatedAt: new Date(),
});

export const parseImageId = (id: string): number => {
  return Number.parseInt(id, 10);
};
