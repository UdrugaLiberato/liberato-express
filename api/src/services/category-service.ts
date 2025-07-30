import prisma from '../config/prisma';
import { Express } from 'express';
import { categoryInclude, createCategoryImage, createCategoryQuestions, buildCategoryData } from '../utils/category-utils';

export const getAll = () => {
  return prisma.category.findMany({
    include: categoryInclude,
  });
};

export const getById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: categoryInclude,
  });
};

export const create = async (
  name: string,
  file: Express.Multer.File,
  description?: string,
  questions?: string,
) => {
  const category = await prisma.category.create({
    data: buildCategoryData(name, description),
  });

  await createCategoryImage(file, category.id);

  if (questions) {
    await createCategoryQuestions(questions, category.id);
  }

  return category;
};

export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
