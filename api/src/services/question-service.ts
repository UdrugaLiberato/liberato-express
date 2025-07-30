import prisma from '../config/prisma';
import {
  questionInclude,
  buildQuestionData,
  buildQuestionUpdateData,
  buildQuestionDeleteData,
} from '../utils/question-utils';

export const getAll = () => {
  return prisma.question.findMany({
    where: { deletedAt: null },
    include: questionInclude,
  });
};

export const getById = (id: string) => {
  return prisma.question.findUnique({
    where: { id },
    include: questionInclude,
  });
};

export const create = (data: any) => {
  return prisma.question.create({
    data: buildQuestionData(data),
  });
};

export const update = (id: string, data: any) => {
  return prisma.question.update({
    where: { id },
    data: buildQuestionUpdateData(data),
  });
};

export const remove = (id: string) => {
  return prisma.question.update({
    where: { id },
    data: buildQuestionDeleteData(),
  });
};
