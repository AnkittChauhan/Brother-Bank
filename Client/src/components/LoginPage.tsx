import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_52%,_#e3ecfb_100%)] px-6 py-10 md:px-10 md:py-14">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center justify-center rounded-[2rem] border border-white/70 bg-white/90 px-6 py-12 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:px-10">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <div className="mb-10 flex size-28 items-center justify-center rounded-full bg-[#dceaff] shadow-[0_16px_40px_-24px_rgba(37,99,235,0.6)]">
            <span className="text-5xl" aria-hidden="true">
              ⏰
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-800 sm:text-6xl">
              Shift Tracker
            </h1>
            <p className="text-xl text-slate-500 sm:text-2xl">
              Manage your shifts efficiently
            </p>
          </div>

          <div className="mt-16 space-y-4">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-800 sm:text-5xl">
              Welcome Back
            </h2>
            <p className="text-xl text-slate-500 sm:text-2xl">
              Please sign in to access your dashboard
            </p>
          </div>

          <Button
            size="lg"
            className="mt-12 h-18 w-full rounded-3xl bg-[#2563eb] px-6 text-2xl font-semibold text-white shadow-[0_20px_35px_-22px_rgba(37,99,235,0.9)] hover:bg-[#1d4ed8]"
          >
            <LogIn className="size-7" />
            Sign in
          </Button>

          <div className="mt-12 h-px w-full bg-slate-200" />

          <p className="mt-10 text-lg text-slate-400 sm:text-xl">
            Secure authentication powered by Clerk
          </p>
        </div>
      </section>
    </main>
  )
}
