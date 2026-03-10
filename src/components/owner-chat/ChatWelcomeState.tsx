import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatWelcomeState() {
  return (
    <div className="grid min-h-[360px] place-items-center p-6 text-center">
      <motion.div
        className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
          <Sparkles className="h-3.5 w-3.5" />
          Owner AI
        </div>
        <h3 className="mt-4 text-2xl font-medium tracking-tight text-white">How can I help today?</h3>
        <p className="mt-2 text-sm text-white/40">Type a command or ask a question</p>
        <p className="mt-3 text-sm text-white/60">
          Ask about pricing strategy, valuation changes, market trend risk, or portfolio optimization.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1">Suggested Price</span>
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1">District Trend</span>
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1">Sell vs Wait</span>
        </div>
      </motion.div>
    </div>
  );
}
