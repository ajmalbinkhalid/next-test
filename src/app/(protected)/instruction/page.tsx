import type { Metadata } from "next";
import { ExamInstruction } from "@/app/(protected)/instruction/_components/exam-instruction";

export const metadata: Metadata = {
  title: "Instruction",
  description: "Review your exam details and instructions before starting the test.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InstructionPage() {
  return <ExamInstruction />;
}
