import { useEffect, useRef, useState } from "react";
import { ArrowUp, BarChart3, Lightbulb, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface OwnerChatComposerProps {
  sending: boolean;
  onSend: (text: string) => Promise<void> | void;
}

export default function OwnerChatComposer({ sending, onSend }: OwnerChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText("");
    await onSend(value);
  };

  const quickActions = [
    {
      label: "Evaluate Price",
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      prompt: "Evaluate the expected listing price for my property based on current market conditions.",
    },
    {
      label: "Market Snapshot",
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      prompt: "Give me a concise market snapshot and price trend for this area.",
    },
    {
      label: "Strategy Advice",
      icon: <Lightbulb className="h-3.5 w-3.5" />,
      prompt: "Recommend a pricing and negotiation strategy to improve conversion for my listing.",
    },
  ];

  return (
    <div className="border-t border-white/10 bg-black/40 p-4">
      <div className="rounded-3xl border border-white/10 bg-black/60 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Ask about valuation, market trends, pricing strategy, or your portfolio performance..."
          className="min-h-[58px] resize-none border-none bg-transparent px-2 py-2 text-[15px] leading-6 placeholder:text-white/40 focus-visible:ring-0"
          disabled={sending}
        />

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={sending}
                onClick={() => setText(action.prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={sending || !text.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
