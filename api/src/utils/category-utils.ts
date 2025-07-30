import prisma from '../config/prisma';
import { Express } from 'express';

export interface CategoryFilters {
  name?: string;
  description?: string;
}

export const categoryInclude = {
  question: true,
  location: true,
  image: true,
};

export const createCategoryImage = async (
  file: Express.Multer.File,
  categoryId: string,
) => {
  return prisma.image.create({
    data: {
      id: Math.floor(Math.random() * 1_000_000_000),
      src: `https://dev.udruga-liberato.hr/images/category/${file.filename}`,
      name: file.originalname.split('.')[0],
      mime: file.mimetype,
      categoryId,
    },
  });
};

export const createCategoryQuestions = async (
  questions: string,
  categoryId: string,
) => {
  if (!questions) return;

  const items = questions
    .split(',')
    .map((q) => q.trim())
    .filter(Boolean);

  await prisma.question.createMany({
    data: items.map((question) => ({
      question,
      categoryId,
      createdAt: new Date(),
    })),
  });
};

export const buildCategoryData = (name: string, description?: string) => ({
  name,
  description,
  createdAt: new Date(),
});
