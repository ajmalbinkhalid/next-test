"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sendOtpSchema, verifyOtpSchema } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";
import { normalizeIndianMobile, toNationalMobile } from "@/utils/format";

type MobileFormValues = {
  mobile: string;
};

type OtpFormValues = {
  otp: string;
};

const panelInputClassName =
  "h-14 w-full rounded-xl border border-[#d8dbdf] bg-white px-4 text-[15px] text-[#24384a] outline-none transition placeholder:text-[#96a0aa] focus:border-[#22384a] focus:ring-4 focus:ring-[rgba(35,56,74,0.1)]";

function formatOtp(value: string) {
  const cleanValue = value.replace(/\D/g, "").slice(0, 6);

  if (cleanValue.length <= 3) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, 3)} ${cleanValue.slice(3)}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export function AuthFlow() {
  const router = useRouter();
  const { mobile, sendOtp, status, verifyOtp } = useAuth();
  const [currentMobile, setCurrentMobile] = useState(mobile ?? "");
  const [otpSent, setOtpSent] = useState(status === "otp-sent" || status === "needs-profile");

  const mobileForm = useForm<MobileFormValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      mobile: toNationalMobile(currentMobile),
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = useWatch({
    control: otpForm.control,
    name: "otp",
    defaultValue: "",
  });
  const isOtpStep = otpSent && currentMobile.length > 0;

  const handleSendOtp = mobileForm.handleSubmit(async ({ mobile: nextMobile }) => {
    const normalizedMobile = normalizeIndianMobile(nextMobile);

    try {
      const response = await sendOtp({ mobile: normalizedMobile });
      setCurrentMobile(normalizedMobile);
      setOtpSent(true);
      mobileForm.reset({ mobile: toNationalMobile(normalizedMobile) });
      otpForm.reset({ otp: "" });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to send OTP. Please try again.");
      toast.error(message);
      console.error("sendOtp failed", error);
    }
  });

  const handleResendCode = async () => {
    if (!currentMobile) {
      return;
    }

    try {
      await sendOtp({ mobile: currentMobile });
      toast.success("OTP resent successfully.");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to resend OTP. Please try again.");
      toast.error(message);
      console.error("resendOtp failed", error);
    }
  };

  const handleVerifyOtp = otpForm.handleSubmit(async ({ otp }) => {
    try {
      const response = await verifyOtp({ mobile: currentMobile, otp });

      startTransition(() => {
        router.push(response.login ? "/home" : "/profile");
      });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to verify OTP. Please try again.");
      toast.error(message);
      console.error("verifyOtp failed", error);
    }
  });

  return (
    <AuthShell>
      {!isOtpStep ? (
        <form className="flex h-full flex-col" onSubmit={(event) => void handleSendOtp(event)}>
          <div className="space-y-3">
            <h1 className="max-w-[300px] text-[24px] font-semibold tracking-[-0.03em] text-[#24384a] sm:text-[28px]">
              Enter your phone number
            </h1>
            <p className="max-w-[300px] text-[14px] leading-6 text-[#3f5160] sm:text-[15px]">
              We use your mobile number to identify your account
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <label
              htmlFor="mobile"
              className="mb-2 block text-[12px] font-medium text-[#7b8792]"
            >
              Phone number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[14px] font-medium text-[#4d5e6b]">
                +91
              </span>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="1234 567891"
                className={`${panelInputClassName} pl-14`}
                aria-invalid={mobileForm.formState.errors.mobile ? "true" : "false"}
                aria-describedby="mobile-error"
                {...mobileForm.register("mobile")}
              />
            </div>
            <p id="mobile-error" aria-live="polite" className="mt-2 min-h-5 text-xs text-rose-500">
              {mobileForm.formState.errors.mobile?.message}
            </p>
          </div>

          <p className="mt-1 text-[11px] leading-5 text-[#7f8791]">
            By tapping Get started, you agree to the Terms & Conditions
          </p>

          <div className="mt-auto pt-6 sm:pt-8">
            <Button
              type="submit"
              className="h-14 w-full rounded-[10px] bg-[#24384a] text-[16px] font-semibold text-white shadow-none hover:bg-[#1d2f3d]"
              disabled={mobileForm.formState.isSubmitting}
            >
              {mobileForm.formState.isSubmitting ? <Spinner /> : "Get Started"}
            </Button>
          </div>
        </form>
      ) : (
        <form className="flex h-full flex-col" onSubmit={(event) => void handleVerifyOtp(event)}>
          <div className="space-y-3">
            <h1 className="max-w-[300px] text-[24px] font-semibold tracking-[-0.03em] text-[#24384a] sm:text-[28px]">
              Enter the code we texted you
            </h1>
            <p className="max-w-[300px] text-[14px] leading-6 break-words text-[#3f5160] sm:text-[15px]">
              We&apos;ve sent an SMS to {currentMobile}
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <label
              htmlFor="otp"
              className="mb-2 block text-[12px] font-medium text-[#7b8792]"
            >
              SMS code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123 456"
              maxLength={7}
              value={formatOtp(otpValue)}
              className={`${panelInputClassName} tracking-[0.04em]`}
              aria-invalid={otpForm.formState.errors.otp ? "true" : "false"}
              aria-describedby="otp-help otp-error"
              onChange={(event) => {
                otpForm.setValue(
                  "otp",
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                  { shouldDirty: true, shouldTouch: true, shouldValidate: true },
                );
              }}
            />
            <p id="otp-help" className="mt-3 max-w-[300px] text-[11px] leading-5 text-[#7f8791]">
              Your 6 digit code is on its way. This can sometimes take a few
              moments to arrive.
            </p>
            <button
              type="button"
              className="mt-4 text-[13px] font-semibold text-[#24384a] underline underline-offset-2"
              onClick={() => void handleResendCode()}
            >
              Resend code
            </button>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p id="otp-error" aria-live="polite" className="min-h-5 text-xs text-rose-500">
                {otpForm.formState.errors.otp?.message}
              </p>
              <button
                type="button"
                className="text-xs font-medium text-[#4d5e6b]"
                onClick={() => {
                  setOtpSent(false);
                  otpForm.reset({ otp: "" });
                }}
              >
                Change number
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 sm:pt-8">
            <Button
              type="submit"
              className="h-14 w-full rounded-[10px] bg-[#24384a] text-[16px] font-semibold text-white shadow-none hover:bg-[#1d2f3d]"
              disabled={otpForm.formState.isSubmitting}
            >
              {otpForm.formState.isSubmitting ? <Spinner /> : "Get Started"}
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
