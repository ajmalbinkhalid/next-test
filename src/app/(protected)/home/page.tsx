import type { Metadata } from "next";
import { ExamHome } from "@/app/(protected)/home/_components/exam-home";

export const metadata: Metadata = {
  title: "Home",
  description: "Review your exam details and instructions before starting the test.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePage() {
  return <ExamHome />;
}
