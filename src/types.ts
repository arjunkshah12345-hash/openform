export type QuestionType =
  | "short-text"
  | "long-text"
  | "email"
  | "multiple-choice"
  | "rating"
  | "number"
  | "yes-no";
export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[];
};
export type Form = {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published";
  theme: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  trashed: boolean;
};
export type Submission = {
  id: string;
  formId: string;
  answers: Record<string, string | number>;
  questions?: Question[];
  createdAt: string;
};
