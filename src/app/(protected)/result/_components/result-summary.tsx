"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { clearLatestExamResult, readLatestExamResult } from "@/utils/exam-storage";

function formatCount(value: number) {
  return String(value).padStart(3, "0");
}

export function ResultSummary() {
  const router = useRouter();
  const mounted = useMounted();
  const result = mounted ? readLatestExamResult() : null;

  useEffect(() => {
    if (mounted && !result) {
      router.replace("/instruction");
    }
  }, [mounted, result, router]);

  if (!mounted || !result) {
    return null;
  }

  const summaryItems = [
    { label: "Total Questions:", value: result.correct + result.wrong + result.not_attended, color: "#e4ac26" },
    { label: "Correct Answers:", value: result.correct, color: "#49b34d" },
    { label: "Incorrect Answers:", value: result.wrong, color: "#ff3b34" },
    { label: "Not Attended Questions:", value: result.not_attended, color: "#5f6368" },
  ];

  return (
    <section className="mx-auto flex w-full max-w-[429px] flex-col items-center px-1 py-4 sm:px-4 sm:py-5">
      <div className="w-full rounded-[14px] bg-[linear-gradient(180deg,#1f87ac_0%,#2d5f88_100%)] px-6 py-4 text-center text-white shadow-[0_18px_32px_rgba(35,56,74,0.12)]">
        <p className="text-[16px] font-medium sm:text-[18px]">Marks Obtained:</p>
        <p className="mt-1 text-[48px] font-light tracking-[-0.06em] sm:text-[62px]">
          {result.score} / {result.correct + result.wrong + result.not_attended}
        </p>
      </div>

      <div className="mt-4 w-full space-y-4">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-[#24384a]">
            <div className="flex items-center gap-4">
              <span
                className="grid h-7 w-7 place-items-center rounded-[4px] text-white"
                style={{ backgroundColor: item.color }}
              >
                <Image src="/icons/help.svg" alt="" width={12} height={12} className="h-3 w-3" />
              </span>
              <span className="text-[14px] sm:text-[16px]">{item.label}</span>
            </div>
            <span className="text-[14px] font-semibold sm:text-[16px]">{formatCount(item.value)}</span>
          </div>
        ))}
      </div>

      <Button
        className="mt-6 h-[42px] w-full rounded-[6px] bg-[var(--action-primary)] text-[16px] font-medium text-white shadow-none hover:bg-[var(--action-primary-hover)]"
        onClick={() => {
          clearLatestExamResult();
          router.push("/instruction");
        }}
      >
        Done
      </Button>
    </section>
  );
}
