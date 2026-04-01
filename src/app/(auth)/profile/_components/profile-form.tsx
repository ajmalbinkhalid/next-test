"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { QUALIFICATION_OPTIONS } from "@/lib/constants";
import { createProfileSchema } from "@/lib/schemas";
import { getApiErrorMessage } from "@/utils/api-error";

type ProfileFormValues = z.infer<typeof createProfileSchema>;

const panelInputClassName =
  "h-[38px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-4 text-[14px] text-[#24384a] outline-none transition placeholder:text-[#c0c5cb] focus:border-[#22384a] focus:ring-4 focus:ring-[rgba(35,56,74,0.1)]";

export function ProfileForm() {
  const router = useRouter();
  const { createProfile, mobile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      qualification: "",
    },
  });

  const selectedFile = useWatch({
    control: form.control,
    name: "profileImage",
  });
  const deferredSelectedFile = useDeferredValue(selectedFile);
  const qualificationValue = useWatch({
    control: form.control,
    name: "qualification",
    defaultValue: "",
  });
  const previewUrl = useMemo(() => {
    if (!deferredSelectedFile) {
      return null;
    }

    return URL.createObjectURL(deferredSelectedFile);
  }, [deferredSelectedFile]);

  useEffect(() => {
    if (!mobile) {
      router.replace("/login");
    }
  }, [mobile, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await createProfile(values);

      startTransition(() => {
        router.push("/instruction");
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Unable to complete your profile. Please try again.",
      );
      toast.error(message);
      console.error("createProfile failed", error);
    }
  });

  return (
    <AuthShell>
      <form className="flex h-full flex-col" onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-3">
          <h1 className="max-w-[300px] text-[24px] font-semibold tracking-[-0.03em] text-[#24384a] sm:text-[28px]">
            Add Your Details
          </h1>

          <div className="flex justify-center">
            <div className="relative">
              <label
                htmlFor="profileImage"
                className="relative flex h-[60px] w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[#d9dde1] bg-[#fbfbfb] transition hover:bg-[#f5f7f8]"
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Image
                      src="/icons/camera.svg"
                      alt=""
                      width={16}
                      height={14}
                      className="h-auto w-4"
                    />
                    <span className="px-1 text-[5px] leading-[8px] text-[#c1c5ca]">
                      Add Your
                      {" "}
                      Profile
                    </span>
                  </div>
                )}
              </label>

              {previewUrl ? (
                <button
                  type="button"
                  className="absolute -right-2 -top-2"
                  onClick={() => {
                    form.resetField("profileImage");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <Image
                    src="/icons/close.svg"
                    alt="Remove profile picture"
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                </button>
              ) : null}

              <input
                ref={fileInputRef}
                id="profileImage"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    form.resetField("profileImage");
                    return;
                  }

                  form.setValue("profileImage", file, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-[10px] font-medium text-[#343330]">
              Name*
            </label>
            <input
              id="name"
              placeholder="Enter your Full Name"
              className={panelInputClassName}
              aria-invalid={form.formState.errors.name ? "true" : "false"}
              aria-describedby="name-error"
              {...form.register("name")}
            />
            <p id="name-error" aria-live="polite" className="mt-0.5 min-h-2.5 text-[10px] leading-[10px] text-rose-500">
              {form.formState.errors.name?.message}
            </p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-[10px] font-medium text-[#343330]">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your Email Address"
              className={panelInputClassName}
              aria-invalid={form.formState.errors.email ? "true" : "false"}
              aria-describedby="email-error"
              {...form.register("email")}
            />
            <p id="email-error" aria-live="polite" className="mt-0.5 min-h-2.5 text-[10px] leading-[10px] text-rose-500">
              {form.formState.errors.email?.message}
            </p>
          </div>

          <div>
            <label
              htmlFor="qualification"
              className="mb-1 block text-[10px] font-medium text-[#343330]"
            >
              Your qualification*
            </label>
            <div className="relative">
              <select
                id="qualification"
                className={`${panelInputClassName} appearance-none pr-10 ${
                  qualificationValue ? "text-[#24384a]" : "text-[#c0c5cb]"
                }`}
                aria-invalid={form.formState.errors.qualification ? "true" : "false"}
                aria-describedby="qualification-error"
                {...form.register("qualification")}
              >
                <option value="">Select your qualification</option>
                {QUALIFICATION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <Image
                  src="/icons/Polygon 3.svg"
                  alt=""
                  width={6}
                  height={12}
                  className="h-3 w-auto invert-[0.75]"
                />
              </span>
            </div>
            <p
              id="qualification-error"
              aria-live="polite"
              className="mt-0.5 min-h-2.5 text-[10px] leading-[10px] text-rose-500"
            >
              {form.formState.errors.qualification?.message}
            </p>
          </div>
        </div>

        <p id="profile-image-error" aria-live="polite" className="mt-0.5 min-h-2.5 text-[10px] leading-[10px] text-rose-500">
          {form.formState.errors.profileImage?.message}
        </p>

        <div className="mt-auto pt-6 sm:pt-8">
          <Button
            type="submit"
            className="h-14 w-full rounded-[10px] bg-[var(--action-primary)] text-[16px] font-semibold text-white shadow-none hover:bg-[var(--action-primary-hover)] lg:h-[45px] lg:w-[339px]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Spinner /> : "Get Started"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
