import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="creos-theme relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-10 lg:px-0">
        <section className="rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl">Contact</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
            Reach our operations team for listing support, booking questions, and platform assistance.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-white/90">Email</div>
              <div className="mt-2 text-sm text-slate-100">SalmanSystemAdmin@creos.example</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-white/90">Phone</div>
              <div className="mt-2 text-sm text-slate-100">+963 938 411 333</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide text-white/90">Hours</div>
              <div className="mt-2 text-sm text-slate-100">Mon - Fri, 9:00 - 18:00</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>For complete policy details:</span>
            <Link
              to="/legal"
              className="underline underline-offset-2 text-white/90 transition hover:text-white/90"
            >
              Terms And Privacy
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-300 md:flex-row lg:px-0">
            <span>© 2025 CREOS. All rights reserved.</span>
            <span className="text-slate-400">Design and development: CREOS Team</span>
          </div>
        </footer>
      </main>
    </div>
  );
}


