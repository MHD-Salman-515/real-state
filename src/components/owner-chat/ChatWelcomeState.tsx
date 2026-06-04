import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function ChatWelcomeState() {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-[360px] place-items-center p-6 text-center">
      <motion.div
        className="card-glass max-w-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="badge-creos mx-auto text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          {t("Owner AI")}
        </div>
        <h3 className="mt-4 text-2xl font-medium tracking-tight text-[color:var(--creos-text)]">{t("How can I help today?")}</h3>
        <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.56)]">{t("Type a command or ask a question")}</p>
        <p className="mt-3 text-sm text-[color:rgb(var(--creos-text-rgb)/0.7)]">
          {t("Ask about pricing strategy, valuation changes, market trend risk, or portfolio optimization.")}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="chat-chip">{t("Suggested Price")}</span>
          <span className="chat-chip">{t("District Trend")}</span>
          <span className="chat-chip">{t("Sell vs Wait")}</span>
        </div>
      </motion.div>
    </div>
  );
}
