import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has(ACCESS_TOKEN_COOKIE);

  redirect(hasToken ? "/home" : "/login");
}
