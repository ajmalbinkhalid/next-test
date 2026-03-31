"use client";

import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import examApi from "@/api/exam-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { SubmittedAnswerPayload } from "@/types/exam";
import { writeLatestExamResult } from "@/utils/exam-storage";
import { formatSeconds } from "@/utils/format";
import { toast } from "sonner";
import type { ExamSubmissionResponse } from "@/types/exam";

const paragraphText = `Ancient Indian history spans several millennia and offers a profound glimpse into the origins of one of the world's oldest and most diverse civilizations. It begins with the Indus Valley Civilization (c. 2500-1500 BCE), which is renowned for its advanced urban planning, architecture, and water management systems. Cities like Harappa and Mohenjo-Daro were highly developed, with sophisticated drainage systems and well-organized streets, showcasing the early brilliance of Indian civilization. The decline of this civilization remains a mystery, but it marks the transition to the next significant phase in Indian history.

Following the Indus Valley Civilization, the Vedic Period (c. 1500-600 BCE) saw the arrival of the Aryans in northern India. This period is characterized by the early composition of the Vedas, which laid the foundations of Hinduism and early Indian society.

It was during this time that the varna system (social hierarchy) began to develop, which later evolved into the caste system. The Vedic Age also witnessed the rise of important kingdoms and the spread of agricultural practices across the region, significantly impacting the social and cultural fabric of ancient India.

The 6th century BCE marked a turning point with the emergence of new religious and philosophical movements. Buddhism and Jainism, led by Gautama Buddha and Mahavira, challenged the existing Vedic orthodoxy and offered alternative paths to spiritual enlightenment. These movements gained widespread popularity and had a lasting influence on Indian society and culture. During this time, the kingdom of Magadha became one of the most powerful, laying the groundwork for future empires.

The Maurya Empire (c. 322-185 BCE), founded by Chandragupta Maurya, became the first large empire to unify much of the Indian subcontinent. Under Ashoka the Great, the empire reached its zenith, and Buddhism flourished both in India and abroad. Ashoka's support for non-violence, his spread of Buddhist teachings, and his contributions to governance and infrastructure had a lasting legacy on Indian history. His reign marks one of the earliest and most notable examples of state-sponsored religious tolerance and moral governance.`;

export function ExamShell() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [visitedIndexes, setVisitedIndexes] = useState<number[]>([]);
  const [reviewIndexes, setReviewIndexes] = useState<number[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isParagraphOpen, setIsParagraphOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const examQuery = useQuery({
    queryKey: ["exam-questions"],
    queryFn: examApi.getQuestions,
  });

  const fallbackRemainingTime = examQuery.data ? examQuery.data.total_time * 60 : null;
  const effectiveRemainingTime = remainingTime ?? fallbackRemainingTime;
  const questions = useMemo(() => examQuery.data?.questions ?? [], [examQuery.data?.questions]);
  const activeQuestion = questions[activeIndex];

  useEffect(() => {
    if (!examQuery.data || effectiveRemainingTime === null || effectiveRemainingTime <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingTime((current) => {
        if (current === null) {
          return Math.max((examQuery.data.total_time * 60) - 1, 0);
        }

        return current > 0 ? current - 1 : 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [effectiveRemainingTime, examQuery.data]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers],
  );
  const questionTotal = questions.length;
  const skippedCount = Math.max(questionTotal - answeredCount, 0);
  const firstUnansweredIndex = useMemo(
    () =>
      questions.findIndex((question) => {
        const selected = answers[questions.indexOf(question)];
        return selected === null || selected === undefined;
      }),
    [answers, questions],
  );

  const finalizeResult = (result: ExamSubmissionResponse) => {
    const normalizedResult: ExamSubmissionResponse = {
      ...result,
      not_attended: Math.max(result.not_attended ?? 0, skippedCount),
    };

    writeLatestExamResult(normalizedResult);
    return normalizedResult;
  };

  const submitMutation = useMutation({
    mutationFn: examApi.submitAnswers,
    onSuccess: (result) => {
      finalizeResult(result);
      startTransition(() => {
        router.push("/result");
      });
    },
    onError: (error) => {
      const hasSkippedQuestions = skippedCount > 0;
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number"
          ? error.statusCode
          : undefined;
      const message =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unable to submit the test. Please try again.";

      toast.error(
        hasSkippedQuestions
          ? "Skipped questions could not be submitted in the current format. We saved your answered questions and are retrying."
          : statusCode === 500
            ? "We couldn't finish submitting your test right now. Your answers are still here, so please try again in a moment."
          : message,
      );
      console.warn("submitExam failed", error);
    },
  });

  const payload = useMemo<SubmittedAnswerPayload[]>(
    () =>
      questions.map((question) => ({
        question_id: question.id,
        selected_option_id: answers[questions.indexOf(question)] ?? null,
      })),
    [answers, questions],
  );

  const submissionPayload = useMemo<SubmittedAnswerPayload[]>(
    () => payload.filter((item) => item.selected_option_id !== null),
    [payload],
  );

  useEffect(() => {
    if (effectiveRemainingTime === 0 && questions.length > 0 && !submitMutation.isPending) {
      submitMutation.mutate(submissionPayload);
    }
  }, [effectiveRemainingTime, questions.length, submissionPayload, submitMutation]);

  const reviewCount = reviewIndexes.length;
  const timeLabel = formatSeconds(effectiveRemainingTime ?? 0);

  const submitExam = () => {
    if (!submissionPayload.length) {
      toast.error("Answer at least one question before submitting the test.");
      setIsSubmitOpen(false);
      return;
    }

    if (skippedCount > 0) {
      setIsSubmitOpen(false);
      toast.error(
        skippedCount === 1
          ? "1 question is still unanswered. Please answer it before submitting."
          : `${skippedCount} questions are still unanswered. Please answer them before submitting.`,
      );

      if (firstUnansweredIndex >= 0) {
        moveToQuestion(firstUnansweredIndex);
      }

      return;
    }

    submitMutation.mutate(submissionPayload);
  };

  const moveToQuestion = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, Math.max(questions.length - 1, 0)));
    setVisitedIndexes((current) =>
      current.includes(nextIndex) ? current : [...current, nextIndex],
    );

    setActiveIndex(nextIndex);
  };

  const selectAnswer = (questionIndex: number, optionId: number) => {
    setAnswers((current) => ({
      ...current,
      [questionIndex]: optionId,
    }));
  };

  const toggleReview = () => {
    if (!activeQuestion) {
      return;
    }

    setReviewIndexes((current) =>
      current.includes(activeIndex)
        ? current.filter((questionIndex) => questionIndex !== activeIndex)
        : [...current, activeIndex],
    );
  };

  if (examQuery.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-[#51606d]">
          <Spinner />
          Loading exam questions...
        </div>
      </div>
    );
  }

  if (examQuery.isError || !examQuery.data || !activeQuestion) {
    return (
      <div className="rounded-[12px] border border-[#d8e1e8] bg-white px-6 py-10 text-center shadow-[0_18px_40px_rgba(24,44,66,0.08)]">
        <h2 className="text-2xl font-semibold text-[#24384a]">Unable to load the exam</h2>
        <p className="mt-3 text-sm text-[#60707d]">
          Please confirm the proxy and API are reachable, then try again.
        </p>
        <Button className="mt-6" onClick={() => void examQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="text-[24px] font-medium leading-tight text-[#24384a] sm:text-[28px] lg:text-[32px]">
              Ancient Indian History MCQ
            </h1>
            <div className="w-fit rounded-[4px] bg-white px-3 py-2 text-[13px] font-medium text-[#51606d] shadow-[0_8px_20px_rgba(24,44,66,0.06)]">
              {String(activeIndex + 1).padStart(2, "0")}/{String(questionTotal).padStart(2, "0")}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#deebf2] bg-white p-3 shadow-[0_12px_26px_rgba(24,44,66,0.06)] sm:p-4">
            <button
              type="button"
              className="inline-flex min-h-[34px] max-w-full items-center gap-2 rounded-[4px] bg-[#1d8cbc] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#1678a2] sm:h-[34px] sm:px-4 sm:py-0 sm:text-[13px]"
              onClick={() => setIsParagraphOpen(true)}
            >
              <Image src="/icons/ArticleNyTimes.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
              <span className="truncate">Read Comprehensive Paragraph</span>
              <Image src="/icons/Polygon 3.svg" alt="" width={6} height={12} className="h-3 w-auto" />
            </button>

            <div className="mt-4">
              <p className="text-[15px] font-medium leading-6 text-[#24384a] sm:text-[16px] sm:leading-7">
                {activeIndex + 1}. {activeQuestion.question}
              </p>
              <div className="mt-4 overflow-hidden rounded-[2px] border border-[#d8dde3]">
                <Image
                  src="/icons/indus-site.svg"
                  alt="Ancient city illustration"
                  width={320}
                  height={170}
                  className="h-auto w-full max-w-[320px]"
                />
              </div>
            </div>
          </div>

          <p id="answer-group-label" className="mt-3 text-[14px] text-[#5c6f7e]">
            Choose the answer:
          </p>

          <div className="mt-3 space-y-3" role="radiogroup" aria-labelledby="answer-group-label">
            {activeQuestion.options.map((option, optionIndex) => {
              const isSelected = answers[activeIndex] === option.id;
              const optionLabel = String.fromCharCode(65 + optionIndex);

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${optionLabel}. ${option.option}`}
                  className="flex w-full items-center justify-between gap-4 rounded-[8px] border border-[#cfe0ea] bg-white px-4 py-4 text-left text-[15px] text-[#24384a] transition hover:border-[#9ec4d6] sm:text-[16px]"
                  onClick={() => selectAnswer(activeIndex, option.id)}
                >
                  <span className="min-w-0 flex-1">
                    {optionLabel}. {option.option}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-[16px] w-[16px] rounded-full border ${isSelected ? "border-[#24384a] bg-[#24384a] shadow-[inset_0_0_0_3px_white]" : "border-[#24384a] bg-white"}`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Button
              className="h-[42px] rounded-[4px] bg-[#8c0d94] text-[14px] font-medium text-white shadow-none hover:bg-[#740b7b] sm:text-[15px]"
              onClick={toggleReview}
            >
              Mark for review
            </Button>
            <Button
              variant="secondary"
              className="h-[42px] rounded-[4px] border-0 bg-[#d9d9d9] text-[14px] font-medium text-[#24384a] shadow-none hover:bg-[#cfcfcf] sm:text-[15px]"
              disabled={activeIndex === 0}
              onClick={() => moveToQuestion(activeIndex - 1)}
            >
              Previous
            </Button>
            {activeIndex === questionTotal - 1 ? (
              <Button
                className="h-[42px] rounded-[4px] bg-[#24384a] text-[14px] font-medium text-white shadow-none hover:bg-[#1d2f3d] sm:text-[15px]"
                onClick={() => setIsSubmitOpen(true)}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                className="h-[42px] rounded-[4px] bg-[#24384a] text-[14px] font-medium text-white shadow-none hover:bg-[#1d2f3d] sm:text-[15px]"
                onClick={() => moveToQuestion(activeIndex + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#deebf2] bg-white p-4 shadow-[0_12px_26px_rgba(24,44,66,0.06)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#24384a]">Question No. Sheet:</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[14px] font-medium text-[#24384a]">Remaining Time:</p>
              <div className="mt-1 inline-flex items-center gap-2 rounded-[4px] bg-[#24384a] px-3 py-2 text-[14px] font-medium text-white">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-white/14">o</span>
                {timeLabel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-3 xl:grid-cols-5">
            {questions.map((question, index) => {
              const isVisited = visitedIndexes.includes(index) || index === activeIndex;
              const isAnswered = answers[index] !== undefined && answers[index] !== null;
              const isMarked = reviewIndexes.includes(index);

              const classes = isAnswered && isMarked
                ? "bg-[#49b34d] text-white ring-2 ring-[#8c0d94]"
                : isMarked
                  ? "bg-[#8c0d94] text-white"
                  : isAnswered
                    ? "bg-[#49b34d] text-white"
                    : isVisited
                      ? "bg-[#ff3b34] text-white"
                      : "bg-white text-[#24384a] ring-1 ring-[#d4e0e7]";

              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  aria-label={`Go to question ${index + 1}`}
                  className={`h-[36px] rounded-[4px] text-[14px] font-medium transition hover:opacity-90 sm:h-[38px] sm:text-[16px] ${classes}`}
                  onClick={() => moveToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#24384a]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[2px] bg-[#49b34d]" />
              Attended
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[2px] bg-[#ff3b34]" />
              Not Attended
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[2px] bg-[#8c0d94]" />
              Marked For Review
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[2px] border-2 border-[#8c0d94] bg-[#49b34d]" />
              Answered and Marked For Review
            </div>
          </div>
        </aside>
      </section>

      <Dialog open={isParagraphOpen} onOpenChange={setIsParagraphOpen}>
        <DialogContent className="max-w-[calc(100vw-1.5rem)] rounded-[14px] px-0 py-0 sm:max-w-[950px]">
          <div className="border-b border-[#dfe6eb] px-4 py-3">
            <DialogTitle className="text-[18px] font-medium text-[#24384a] sm:text-[20px]">
              Comprehensive Paragraph
            </DialogTitle>
          </div>
          <div className="max-h-[65vh] overflow-y-auto px-4 py-5 text-[14px] leading-6 text-[#24384a] sm:text-[15px] sm:leading-7">
            {paragraphText.split("\n\n").map((item) => (
              <p key={item} className="mb-6 last:mb-0">
                {item}
              </p>
            ))}
          </div>
          <div className="flex justify-end px-4 pb-4">
            <DialogClose asChild>
              <Button className="h-[42px] w-full rounded-[6px] bg-[#24384a] text-[15px] font-medium text-white shadow-none hover:bg-[#1d2f3d] sm:min-w-[244px] sm:w-auto sm:text-[16px]">
                Minimize
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="max-w-[calc(100vw-1.5rem)] rounded-[16px] px-0 py-0 sm:w-[393px] sm:max-w-[393px]">
          <div className="flex items-center justify-between border-b border-[#e6ecef] px-4 py-3">
            <DialogTitle className="text-[16px] font-medium text-[#24384a]">
              Are you sure you want to submit the test?
            </DialogTitle>
            <DialogClose aria-label="Close submit dialog" className="text-[18px] leading-none text-[#51606d]">
              x
            </DialogClose>
          </div>

          <div className="space-y-4 px-4 py-4 text-[14px] text-[#24384a] sm:min-h-[244px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-[#24384a] text-white">o</span>
                <span>Remaining Time:</span>
              </div>
              <span className="font-semibold">{timeLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-[#e4ac26] text-white">□</span>
                <span>Total Questions:</span>
              </div>
              <span className="font-semibold">{String(questionTotal).padStart(3, "0")}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-[#49b34d] text-white">✓</span>
                <span>Questions Answered:</span>
              </div>
              <span className="font-semibold">{String(answeredCount).padStart(3, "0")}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-[#8c0d94] text-white">?</span>
                <span>Marked for review:</span>
              </div>
              <span className="font-semibold">{String(reviewCount).padStart(3, "0")}</span>
            </div>
          </div>

          <div className="px-4 pb-4">
            <Button
              className="h-[42px] w-full rounded-[6px] bg-[#24384a] text-[16px] font-medium text-white shadow-none hover:bg-[#1d2f3d]"
              disabled={submitMutation.isPending}
              onClick={submitExam}
            >
              {submitMutation.isPending ? <Spinner /> : "Submit Test"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
