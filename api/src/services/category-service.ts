import { PrismaClient } from '@prisma/client';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getAll = () => {
  return prisma.category.findMany({
    include: {
      question: true,
      location: true,
      image: true,
    },
  });
};

export const getById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      question: true,
      location: true,
      image: true,
    },
  });
};

export const create = async (
  name: string,
  file: Express.Multer.File,
  description?: string,
  questions?: string,
) => {

  const category = await prisma.category.create({
    data: {
      name: name,
      description: description,
      createdAt: new Date(),
    },
  });

  const image = await prisma.image.create({
    data: {
      id: Math.floor(Math.random() * 1_000_000_000),
      src: `https://dev.udruga-liberato.hr/images/category/${file.filename}`,
      name: file.originalname.split('.')[0],
      mime: file.mimetype,
      categoryId: category.id,
    },
  });

  if (questions) {
    const items = questions
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean);
    await prisma.question.createMany({
      data: items.map((question) => ({
        question,
        categoryId: category.id,
        createdAt: new Date(),
      })),
    });
  }

  return category;
};

export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
