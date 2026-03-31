"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import examApi from "@/api/exam-api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { splitInstructionText } from "@/utils/format";

function formatExamDuration(totalMinutes: number) {
  return `${String(totalMinutes).padStart(2, "0")}:00`;
}

export function ExamHome() {
  const router = useRouter();
  const examQuery = useQuery({
    queryKey: ["exam-questions"],
    queryFn: examApi.getQuestions,
  });

  if (examQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-[#51606d]">
          <Spinner />
          Loading exam overview...
        </div>
      </div>
    );
  }

  if (examQuery.isError || !examQuery.data) {
    return (
      <div className="mx-auto max-w-3xl rounded-[20px] border border-[#d8e1e8] bg-white px-6 py-10 text-center shadow-[0_18px_40px_rgba(24,44,66,0.08)]">
        <h1 className="text-2xl font-semibold text-[#24384a]">Unable to load the exam</h1>
        <p className="mt-3 text-sm text-[#60707d]">
          Please make sure the API is available, then try again.
        </p>
        <Button className="mt-6" onClick={() => void examQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const exam = examQuery.data;
  const stats = [
    { label: "Total MCQ's:", value: exam.questions_count },
    { label: "Total marks:", value: exam.total_marks },
    { label: "Total time:", value: formatExamDuration(exam.total_time) },
  ];

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center px-1 py-3 sm:px-4 sm:py-5">
      <h1 className="text-center text-[18px] font-medium text-[#24384a] sm:text-[22px]">
        Ancient Indian History MCQ
      </h1>

      <div className="mt-5 grid w-full max-w-[682px] grid-cols-1 overflow-hidden rounded-[6px] bg-[#24384a] text-white sm:mt-7 sm:grid-cols-3">
        {stats.map((item, index) => (
          <div
            key={item.label}
            className={`px-5 py-4 text-center ${
              index < stats.length - 1
                ? "border-b border-white/35 sm:border-b-0 sm:border-r"
                : ""
            }`}
          >
            <p className="text-[13px] font-semibold">{item.label}</p>
            <p className="mt-2 text-[28px] font-light tracking-[-0.04em] sm:text-[30px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 w-full max-w-[682px] text-[#42627f]">
        <p className="text-[14px] font-semibold underline underline-offset-2">Instructions:</p>
        <ol className="mt-2 space-y-1 text-[14px] leading-6">
          {splitInstructionText(exam.instruction).map((item, index) => (
            <li key={item}>
              <span className="mr-1 text-[#60707d]">{index + 1}.</span>
              <span className="underline decoration-[#3f84b5] decoration-[1.5px] underline-offset-2">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Button
        className="mt-6 h-[42px] min-w-[230px] rounded-[6px] bg-[#24384a] px-8 text-[16px] font-medium shadow-none hover:bg-[#1d2f3d]"
        onClick={() => router.push("/exam")}
      >
        Start Test
      </Button>
    </section>
  );
}
