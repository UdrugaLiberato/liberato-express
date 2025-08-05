import prisma from '../config/prisma';
import { CategoryData } from '../types';
import { resetImageSequence } from './location-utils';

export const categoryInclude = {
  questions: true,
  images: true,
};

export const createCategoryImage = async (
  categoryId: string,
  image: {
    path: string;
    name?: string;
    size?: number;
    fileType?: string;
  },
) => {
  await resetImageSequence();
  return prisma.image.create({
    data: {
      src: `https://store.udruga-liberato.hr${image.path}`,
      name: image.name || 'category-image',
      mime: image.fileType,
      categoryId,
    },
  });
};

export const createCategoryQuestions = async (
  categoryId: string,
  questions: any[],
) => {
  return Promise.all(
    questions.map((question) =>
      prisma.question.create({
        data: {
          ...question,
          categoryId,
          createdAt: new Date(),
        },
      }),
    ),
  );
};

export const buildCategoryData = (data: CategoryData) => ({
  name: data.name,
  descriptionEN: data.descriptionEN,
  descriptionHR: data.descriptionHR,
  createdAt: new Date(),
});
