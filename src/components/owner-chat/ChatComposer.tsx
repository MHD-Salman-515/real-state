import { useEffect, useRef, useState } from "react";
import { Command, LoaderIcon, Paperclip, SendIcon, Sparkles, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  sending: boolean;
  onSend: (text: string) => Promise<void> | void;
  onFocusChange?: (focused: boolean) => void;
};

type CommandSuggestion = {
  label: string;
  prefix: string;
};

const COMMANDS: CommandSuggestion[] = [
  { label: "Clone UI", prefix: "/clone" },
  { label: "Import Figma", prefix: "/figma" },
  { label: "Create Page", prefix: "/page" },
  { label: "Improve", prefix: "/improve" },
];

export default function ChatComposer({ sending, onSend, onFocusChange }: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  useEffect(() => {
    if (text.startsWith("/") && !text.includes(" ")) {
      setShowCommandPalette(true);
      const i = COMMANDS.findIndex((c) => c.prefix.startsWith(text));
      setActiveSuggestion(i);
    } else {
      setShowCommandPalette(false);
    }
  }, [text]);

  const submit = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setText("");
    await onSend(value);
  };

  const selectCommand = (i: number) => {
    if (i < 0 || i >= COMMANDS.length) return;
    setText(`${COMMANDS[i].prefix} `);
    setShowCommandPalette(false);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const attachMock = () => {
    const file = `attachment-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, file]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative border-t border-white/[0.05] p-3">
      <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-2xl backdrop-blur-2xl">
        <AnimatePresence>
          {showCommandPalette ? (
            <motion.div
              className="absolute inset-x-4 bottom-full z-20 mb-2 overflow-hidden rounded-lg border border-white/10 bg-black/90 shadow-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
            >
              <div className="py-1">
                {COMMANDS.map((cmd, i) => (
                  <button
                    key={cmd.prefix}
                    type="button"
                    onClick={() => selectCommand(i)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                      activeSuggestion === i ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <span>{cmd.label}</span>
                    <span className="text-white/40">{cmd.prefix}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="p-4">
          <Textarea
          ref={ref}
          value={text}
          rows={2}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          onKeyDown={(e) => {
            if (showCommandPalette) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev < COMMANDS.length - 1 ? prev + 1 : 0));
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : COMMANDS.length - 1));
                return;
              }
              if ((e.key === "Enter" || e.key === "Tab") && activeSuggestion >= 0) {
                e.preventDefault();
                selectCommand(activeSuggestion);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setShowCommandPalette(false);
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/20 focus:border-none"
          placeholder="Ask zap a question..."
        />
        </div>

        <AnimatePresence>
          {attachments.length ? (
            <motion.div
              className="flex flex-wrap gap-2 px-4 pb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {attachments.map((file, i) => (
                <motion.div
                  key={`${file}-${i}`}
                  className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs text-white/70"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <span>{file}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-white/40 hover:text-white">
                    <XIcon className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.05] p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={attachMock}
              className="rounded-lg p-2 text-white/40 transition-colors hover:text-white/90"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowCommandPalette((prev) => !prev)}
              className={cn(
                "rounded-lg p-2 text-white/40 transition-colors hover:text-white/90",
                showCommandPalette && "bg-white/10 text-white/90"
              )}
              aria-label="Command palette"
            >
              <Command className="h-4 w-4" />
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/60">
              <Sparkles className="h-3.5 w-3.5" /> AI
            </span>
          </div>

          <motion.button
            type="button"
            onClick={submit}
            disabled={sending || !text.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              text.trim() ? "bg-white text-[#0A0A0B] shadow-lg shadow-white/10" : "bg-white/[0.05] text-white/40"
            )}
          >
            {sending ? <LoaderIcon className="h-4 w-4 animate-[spin_2s_linear_infinite]" /> : <SendIcon className="h-4 w-4" />}
            <span>Send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
