import prisma from '../config/prisma';
import { CategoryFilters } from '../types';

export const categoryInclude = {
  questions: true,
  images: true,
};

export const createCategoryImage = async (
  categoryId: string,
  imageUrl: string,
) => {
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
        },
      }),
    ),
  );
};

export const buildCategoryData = (data: any) => ({
  name: data.name,
  description: data.description,
  color: data.color,
  icon: data.icon,
  createdAt: new Date(),
});
