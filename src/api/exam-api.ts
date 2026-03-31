"use client";

import axiosClient from "@/api/config/axios-client";
import type { ExamListResponse, ExamSubmissionResponse, SubmittedAnswerPayload } from "@/types/exam";

function buildJsonStringFormData(answers: SubmittedAnswerPayload[]) {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));
  return formData;
}

function buildNestedFormData(answers: SubmittedAnswerPayload[]) {
  const formData = new FormData();

  answers.forEach((answer, index) => {
    formData.append(`answers[${index}][question_id]`, String(answer.question_id));
    formData.append(
      `answers[${index}][selected_option_id]`,
      String(answer.selected_option_id ?? ""),
    );
  });

  return formData;
}

export const examApi = {
  getQuestions: async (): Promise<ExamListResponse> => {
    const response = await axiosClient.get("/question/list");
    return response.data;
  },

  submitAnswers: async (answers: SubmittedAnswerPayload[]): Promise<ExamSubmissionResponse> => {
    const attempts = [
      () => axiosClient.post("/answers/submit", buildJsonStringFormData(answers)),
      () => axiosClient.post("/answers/submit", buildNestedFormData(answers)),
      () => axiosClient.post("/answers/submit", { answers }),
    ];

    let lastError: unknown;

    for (const attempt of attempts) {
      try {
        const response = await attempt();
        return response.data;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  },
};

export default examApi;
