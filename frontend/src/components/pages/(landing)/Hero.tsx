import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-16">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/Assets/Animation/silk-bg.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <div className="mb-16">
          <Image
            src="/Assets/Images/Logo/sommemo-logo.png"
            alt="SomMemo"
            width={100}
            height={100}
            priority
          />
        </div>

        <h1 className="mb-5 text-center text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
          Automated crypto inheritance powered by cron.
        </h1>

        <p className="mb-12 max-w-2xl text-center text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] sm:text-base">
          Built with <span className="inline-flex items-center gap-1 font-semibold text-white">
            <Image
              src="/Assets/Images/Logo/somnia-reactivity-logo.avif"
              alt="Somnia Reactivity"
              width={14}
              height={14}
              className="inline-block"
            />
            Somnia Reactivity
          </span>, SomMemo uses <span className="font-semibold text-white">cron subscriptions</span> to automatically transfer your digital asset in Somnia network to trusted beneficiaries if you become inactive. Fully on-chain, trustless, and transparent.
        </p>

        <div className="mb-24 flex items-center gap-3">
          <Link
            href="/main"
            className="cursor-pointer rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/40"
          >
            Launch App
          </Link>
          <button
            type="button"
            className="group cursor-pointer rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
          >
            <span className="flex items-center gap-1.5">
              Learn More
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-white/60">Built with Somnia</p>
          <div className="opacity-60 transition-opacity hover:opacity-100">
            <Image
              src="/Assets/Images/Logo/somnia-logo.webp"
              alt="Somnia"
              width={25}
              height={25}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/50">
            Automate transfer your Somnia assets to trusted beneficiaries
          </p>
          <p className="mt-2 text-xs text-white/40">
            © 2026 SomMemo. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
