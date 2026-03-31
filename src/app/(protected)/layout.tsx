import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppBrand } from "@/components/shared/app-brand";
import { UserMenu } from "@/components/shared/user-menu";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has(ACCESS_TOKEN_COOKIE);

  if (!hasToken) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#eef8ff]">
      <header className="border-b border-[#dbe6ec] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <AppBrand className="shrink-0" />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-3 py-4 sm:px-5 sm:py-5">
        {children}
      </div>
    </main>
  );
}
