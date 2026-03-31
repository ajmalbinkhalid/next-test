import type { Metadata } from "next";
import { AuthFlow } from "@/app/(auth)/login/_components/auth-flow";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to NexLearn using your mobile number and one-time password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <AuthFlow />;
}
