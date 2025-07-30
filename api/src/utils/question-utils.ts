import { QuestionData, QuestionUpdateData } from '../types';

export const questionInclude = {
  answer: true,
  category: true,
};

export const buildQuestionData = (data: QuestionData) => ({
  ...data,
  createdAt: new Date(),
});

export const buildQuestionUpdateData = (data: QuestionUpdateData) => ({
  ...data,
  updatedAt: new Date(),
});

export const buildQuestionDeleteData = () => ({
  deletedAt: new Date(),
});
