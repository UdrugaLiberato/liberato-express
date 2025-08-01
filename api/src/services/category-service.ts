import prisma from '../config/prisma';
import { Express } from 'express';
import {
  createCategoryImage,
  createCategoryQuestions,
  buildCategoryData,
} from '../utils/category-utils';

interface CategoryFilters {
  name?: string;
}

export const getAll = () => {
  return prisma.category.findMany({
    include: {
      question: true,
      image: true,
    },
  });
};

export const getById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      question: true,
      image: true,
    },
  });
};

export const getByName = (filters: CategoryFilters) => {
  let { name } = filters;
  if (name && name.includes('-')) {
    name = name.replaceAll('-', ' ');
  }

  if (!name) return null;

  return prisma.category.findFirst({
    where: { name: { mode: 'insensitive', contains: name } },
    include: {
      question: true,
      image: true,
    },
  });
};

export const create = async (
  name: string,
  file: Express.Multer.File,
  descriptionEN?: string,
  descriptionHR?: string,
  questions?: string,
) => {
  const category = await prisma.category.create({
    data: buildCategoryData({ name, descriptionEN, descriptionHR }),
  });

  await createCategoryImage(
    category.id,
    `https://dev.udruga-liberato.hr/images/category/${file.filename}`,
  );

  if (questions) {
    const questionItems = questions
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean)
      .map((question) => ({ question }));
    await createCategoryQuestions(category.id, questionItems);
  }

  return category;
};

export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
