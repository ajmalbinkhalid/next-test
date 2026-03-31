"use client";

import { EXAM_RESULT_STORAGE_KEY } from "@/lib/constants";
import type { ExamSubmissionResponse } from "@/types/exam";
import { readStorage, removeStorage, writeStorage } from "@/utils/browser-storage";

let latestExamResultCache: ExamSubmissionResponse | null = null;

export function readLatestExamResult() {
  return latestExamResultCache ?? readStorage<ExamSubmissionResponse>(EXAM_RESULT_STORAGE_KEY);
}

export function writeLatestExamResult(result: ExamSubmissionResponse) {
  latestExamResultCache = result;
  writeStorage(EXAM_RESULT_STORAGE_KEY, result);
}

export function clearLatestExamResult() {
  latestExamResultCache = null;
  removeStorage(EXAM_RESULT_STORAGE_KEY);
}
