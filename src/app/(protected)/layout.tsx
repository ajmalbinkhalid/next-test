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
        <div className="relative flex w-full items-center justify-end px-4 py-3 sm:px-5 lg:h-[90px] lg:py-0">
          <AppBrand className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0" />
          <div className="lg:mr-[28px]">
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="flex w-full flex-col px-3 py-4 sm:px-5 sm:py-5">
        {children}
      </div>
    </main>
  );
}
