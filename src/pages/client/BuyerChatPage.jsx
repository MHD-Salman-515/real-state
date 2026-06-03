import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function BuyerChatPage() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/buyer/chat/sessions").then(r => {
      const list = r.data || [];
      setSessions(list);
      if (!activeSession && list.length > 0) {
        const s = sessionId
          ? list.find(x => String(x.id) === String(sessionId)) || list[0]
          : list[0];
        setActiveSession(s);
        loadMessages(s.id);
      }
    }).catch(() => {});
  }, []);

  const loadMessages = (id) => {
    api.get(`/buyer/chat/sessions/${id}/messages`)
      .then(r => setMessages(r.data || []))
      .catch(() => setMessages([]));
  };

  const createSession = async () => {
    try {
      const r = await api.post("/buyer/chat/sessions", { title: "بحث جديد" });
      setSessions(prev => [r.data, ...prev]);
      setActiveSession(r.data);
      setMessages([]);
      nav(`/client/chat/${r.data.id}`);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    setMessages(prev => [...prev, { id: Date.now(), role: "USER", content: text }]);
    try {
      const r = await api.post(`/buyer/chat/sessions/${activeSession.id}/message`, { message: text });
      const reply = r.data?.assistantMessage || r.data?.text_ar || r.data?.message || "";
      const props = r.data?.payloadJson?.recommended_properties || [];
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: reply, properties: props },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: "حدث خطأ، حاول مرة أخرى" },
      ]);
    }
    setSending(false);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div dir="rtl" className="flex h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <div className="w-64 border-l border-white/10 flex flex-col bg-[#111]">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-[#D4AF37] font-bold text-lg mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            مساعد البحث
          </h2>
          <button
            onClick={createSession}
            className="w-full py-2 text-sm font-bold tracking-wider"
            style={{ background: "#D4AF37", color: "#1b1c1c" }}
          >
            + بحث جديد
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSession(s);
                loadMessages(s.id);
                nav(`/client/chat/${s.id}`);
              }}
              className={`w-full text-right px-3 py-2 text-sm mb-1 transition ${
                activeSession?.id === s.id
                  ? "text-[#D4AF37] border-r-2 border-[#D4AF37]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {s.title || "محادثة"}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-[#111]">
          <h1 className="text-white font-bold">🏠 مساعد البحث العقاري</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20 text-white/30">
              <div className="text-5xl mb-4">🏡</div>
              <p>أخبرني عن العقار الذي تبحث عنه</p>
              <div className="mt-6 space-y-2">
                {[
                  "بدي شقة بالمزة ميزانيتي 500 مليون",
                  "أبحث عن بيت بريف دمشق",
                  "ما سعر المتر بالمالكي؟",
                ].map(h => (
                  <button
                    key={h}
                    onClick={() => setInput(h)}
                    className="block w-full max-w-xs mx-auto text-sm py-2 px-4 text-right"
                    style={{ border: "0.5px solid rgba(212,175,55,0.3)", color: "rgba(255,255,255,0.6)" }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "USER" ? "justify-start" : "justify-end"}`}>
              <div
                className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === "USER" ? "#D4AF37" : "rgba(255,255,255,0.06)",
                  border: msg.role === "ASSISTANT" ? "0.5px solid rgba(212,175,55,0.2)" : "none",
                  color: msg.role === "USER" ? "#1b1c1c" : "white",
                }}
              >
                {msg.content}
                {msg.properties?.map(p => (
                  <a
                    key={p.id}
                    href={`/property/${p.id}`}
                    className="block mt-2 p-2 text-xs"
                    style={{ background: "rgba(212,175,55,0.1)", border: "0.5px solid rgba(212,175,55,0.3)" }}
                  >
                    🏠 {p.title} — {p.price?.toLocaleString("ar-SY")} ل.س
                  </a>
                ))}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-end">
              <div className="px-4 py-2 text-sm" style={{ color: "rgba(212,175,55,0.5)" }}>
                جاري الكتابة...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-[#111]">
          <div className="flex gap-3">
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="px-5 py-2 font-bold text-sm disabled:opacity-40 transition"
              style={{ background: "#D4AF37", color: "#1b1c1c" }}
            >
              إرسال
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="أخبرني عن العقار الذي تبحث عنه..."
              className="flex-1 px-4 py-2 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(212,175,55,0.2)",
                color: "#fff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
