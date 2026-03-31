export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03031b] px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,68,122,0.18),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_20%_0%,rgba(0,163,255,0.06),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(0,163,255,0.08),transparent_20%),repeating-radial-gradient(circle_at_50%_50%,transparent_0,transparent_42px,rgba(16,91,148,0.08)_43px,transparent_88px)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
        {children}
      </div>
    </main>
  );
}
