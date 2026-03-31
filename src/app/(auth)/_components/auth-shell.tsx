import Image from "next/image";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full max-w-[980px]">
      <div className="overflow-hidden rounded-[12px] border border-[#496170] bg-[#24384a] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <div className="grid min-h-[540px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#263b4d_0%,#24384a_100%)] px-5 py-6 text-white sm:px-8 sm:py-7 lg:px-10 lg:py-8">
            <div className="flex items-center gap-4">
              <Image
                src="/icons/capwhite.svg"
                alt="NexLearn"
                width={72}
                height={68}
                className="h-auto w-[58px] sm:w-[72px]"
                priority
              />
              <div className="leading-none">
                <p className="font-[var(--font-poppins)] text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
                  NexLearn
                </p>
                <p className="mt-2 text-[12px] font-normal text-white/78">
                  futuristic learning
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[420px] justify-center py-6 sm:py-8 lg:py-0">
              <Image
                src="/icons/hero.svg"
                alt="Students learning"
                width={336}
                height={261}
                className="h-auto w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[336px]"
                priority
              />
            </div>
          </div>

          <div className="bg-[#f8f8f7] p-1.5">
            <div className="flex h-full min-h-[460px] flex-col rounded-[4px] bg-white px-5 py-6 text-[#24384a] sm:min-h-[520px] sm:px-8 sm:py-7 lg:min-h-[540px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
