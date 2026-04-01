import { z } from "zod";

export const sendOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .length(10, "Enter a valid 10-digit mobile number")
    .regex(/^\d+$/, "Only digits are allowed"),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "Only digits are allowed"),
});

export const createProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  qualification: z.string().trim().min(1, "Qualification is required"),
  profileImage: z
    .instanceof(File, { message: "Profile image is required" })
    .refine((file) => file.size > 0, "Profile image is required"),
});
