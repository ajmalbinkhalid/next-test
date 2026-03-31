import type { Metadata } from "next";
import { ProfileForm } from "@/app/(auth)/profile/_components/profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Complete your NexLearn profile to continue into the exam experience.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompleteProfilePage() {
  return <ProfileForm />;
}
