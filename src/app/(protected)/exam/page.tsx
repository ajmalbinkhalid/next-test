import type { Metadata } from "next";
import { ExamShell } from "@/app/(protected)/exam/_components/exam-shell";

export const metadata: Metadata = {
  title: "Exam",
  description: "Take the NexLearn exam with question navigation, timer, and submission flow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExamPage() {
  return <ExamShell />;
}
