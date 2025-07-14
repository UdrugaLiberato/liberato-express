import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAll = () => {
  return prisma.category.findMany({
    include: {
      question: true,
      location: true,
      category_image: true
    }
  })
}

export const getById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      question: true,
      location: true,
      category_image: true
    }
  })
}

export const create = async (data: {
  name: string;
  description?: string;
  questions?: string;
  category_image: string;
}) => {
  const { name, description, questions, category_image } = data;

  const image = await prisma.category_image.create({
    data: {
      src: category_image,
      created_at: new Date(),
    },
  });

  const category = await prisma.category.create({
    data: {
      name,
      description,
      created_at: new Date(),
      category_image: {
        connect: { id: image.id },
      },
    },
  });

  if (questions) {
    const items = questions.split(',').map(q => q.trim()).filter(Boolean);
    await prisma.question.createMany({
      data: items.map(question => ({
        question,
        category_id: category.id,
        created_at: new Date(),
      })),
    });
  }

  return category;
};


export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deleted_at: new Date() }
  })
}