import type { Metadata } from "next";
import { ResultSummary } from "@/app/(protected)/result/_components/result-summary";

export const metadata: Metadata = {
  title: "Result",
  description: "Review your NexLearn exam score summary and question statistics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultPage() {
  return <ResultSummary />;
}
