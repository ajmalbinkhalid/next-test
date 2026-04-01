"use client";

import axiosClient from "@/api/config/axios-client";
import type { ExamListResponse, ExamSubmissionResponse, SubmittedAnswerPayload } from "@/types/exam";

function buildSubmitPayload(answers: SubmittedAnswerPayload[]) {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));
  return formData;
}

export const examApi = {
  getQuestions: async (): Promise<ExamListResponse> => {
    const response = await axiosClient.get("/question/list");
    const data = response.data as ExamListResponse & {
      questions: Array<{
        question_id?: number;
        id?: number;
        number?: number;
        question: string;
        comprehension?: string | null;
        image?: string | null;
        options: Array<{
          id: number;
          option: string;
        }>;
      }>;
    };

    return {
      ...data,
      questions: data.questions.map((question) => ({
        id: question.id ?? question.question_id ?? 0,
        number: question.number,
        question: question.question,
        comprehension: question.comprehension ?? null,
        image: question.image ?? null,
        options: question.options.map((option) => ({
          id: option.id,
          option: option.option,
        })),
      })),
    };
  },

  submitAnswers: async (answers: SubmittedAnswerPayload[]): Promise<ExamSubmissionResponse> => {
    const response = await axiosClient.post("/answers/submit", buildSubmitPayload(answers));
    return response.data;
  },
};

export default examApi;
