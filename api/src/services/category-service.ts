import prisma from '../config/prisma';
import {
  createCategoryImage,
  createCategoryQuestions,
  buildCategoryData,
} from '../utils/category-utils';
import { UploadResponseData } from '../types';

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
  uploadResponseData: UploadResponseData | null,
  descriptionEN?: string,
  descriptionHR?: string,
  questions?: string,
) => {
  const category = await prisma.category.create({
    data: buildCategoryData({ name, descriptionEN, descriptionHR }),
  });

  if (uploadResponseData && uploadResponseData.files[0].path) {
    await createCategoryImage(category.id, uploadResponseData.files[0]);
  }

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

export const updateWithImage = async (
  categoryId: string,
  uploadResponseData: UploadResponseData,
) => {
  if (uploadResponseData && uploadResponseData.files[0].path) {
    await createCategoryImage(categoryId, uploadResponseData.files[0]);
  }
};

export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
