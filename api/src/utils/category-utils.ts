import prisma from '../config/prisma';
import { CategoryData } from '../types';
import { resetImageSequence } from './location-utils';

export const categoryInclude = {
  questions: true,
  images: true,
};

export const createCategoryImage = async (
  categoryId: string,
  imageUrl: string,
) => {
  await resetImageSequence();
  return prisma.image.create({
    data: {
      src: imageUrl,
      name: 'category-image',
      mime: 'image/jpeg',
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
