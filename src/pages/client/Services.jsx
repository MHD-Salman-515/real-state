import { Link } from "react-router-dom";

export default function Services() {
  return (
    <div className="creos-theme relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-10 lg:px-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Services</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
            CREOS helps users move from property discovery to booking and follow-up with clear, trackable workflows.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/20 via-black/40 to-black/60 p-5">
            <h3 className="mb-2 font-semibold text-white/90">Booking And Usage Guidance</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-200">
              <li>Booking data should be accurate and kept up to date.</li>
              <li>Fake or misleading requests may lead to account restrictions.</li>
              <li>Visit confirmation depends on property availability and agent approval.</li>
              <li>Some listings may require deposit verification steps.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/20 via-black/40 to-black/60 p-5">
            <h3 className="mb-2 font-semibold text-white/90">Privacy And Support</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-200">
              <li>Contact details are used only for booking and offer communication.</li>
              <li>Your data is not shared with unauthorized third parties.</li>
              <li>Support requests can be tracked through in-app channels.</li>
              <li>Platform usage implies agreement with policy and terms.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
          <p className="text-sm text-slate-300">
            Need a full legal breakdown? Review the complete policy documentation.
          </p>
          <Link
            to="/legal"
            className="mt-3 inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
          >
            Terms And Privacy
          </Link>
        </div>
      </main>
    </div>
  );
}

