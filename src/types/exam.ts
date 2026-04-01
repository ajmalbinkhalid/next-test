export interface QuestionOption {
  id: number;
  option: string;
}

export interface ExamQuestion {
  id: number;
  number?: number;
  question: string;
  comprehension?: string | null;
  image?: string | null;
  options: QuestionOption[];
}

export interface ExamListResponse {
  success: boolean;
  questions_count: number;
  total_marks: number;
  total_time: number;
  time_for_each_question: number;
  mark_per_each_answer: number;
  instruction: string;
  questions: ExamQuestion[];
}

export interface SubmittedAnswerPayload {
  question_id: number;
  selected_option_id: number | null;
}

export interface ExamResultDetail {
  question_id: number;
  selected_option_id: number | null;
  correct_option_id?: number | null;
  is_correct?: boolean;
}

export interface ExamSubmissionResponse {
  success: boolean;
  exam_history_id: string;
  score: number;
  correct: number;
  wrong: number;
  not_attended: number;
  submitted_at: string;
  details: ExamResultDetail[];
}
