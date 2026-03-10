export default function About() {
  return (
    <div className="creos-theme relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-10 lg:px-0">
        <section className="pt-2">
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-l from-white/20 via-white/10 to-white/10 opacity-60 blur-[2px]" />
            <div className="relative space-y-5 rounded-3xl border border-white/15 bg-black/60 p-5 shadow-xl shadow-black/40 md:p-7">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/90">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white/10" />
                  <span>Platform Rights And Operating Standards</span>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Safe And Transparent Usage For <span className="text-white/90">CREOS</span>
                </h1>
                <p className="max-w-3xl text-sm text-slate-300 md:text-base">
                  Before browsing, booking, or submitting requests, users should understand the core principles that keep
                  the platform fair and reliable for clients, agents, and property owners.
                </p>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-white/15 bg-gradient-to-b from-white/20 via-black/40 to-black/60 p-4">
                  <h3 className="font-semibold text-white/90">User Rights</h3>
                  <ul className="list-inside list-disc space-y-1.5 text-slate-200">
                    <li>Review listing details before requesting a visit.</li>
                    <li>Cancel or update a request within allowed windows.</li>
                    <li>Protect personal contact data and communication privacy.</li>
                    <li>Receive clear updates on booking and request status.</li>
                  </ul>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/15 bg-black/35 p-4">
                  <h3 className="font-semibold text-white">About The System</h3>
                  <p className="text-slate-300">
                    CREOS is designed as a centralized real estate operations system to align discovery, visits, support,
                    and operational communication in one experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

