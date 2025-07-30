export interface QuestionData {
  question: string;
  categoryId?: string;
}

export interface QuestionUpdateData {
  question?: string;
  categoryId?: string;
}

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
