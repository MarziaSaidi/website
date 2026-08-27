import { useEffect, useRef, useState } from "react";
import Magnetic from "./ui/Magnetic";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I’m Marzia’s assistant. Ask me anything about her experience, projects, or skills.",
};

const SUGGESTIONS = [
  "What’s her experience?",
  "What projects has she built?",
  "What tech does she use?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);

  // Keep the message list scrolled to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input when the panel opens; close on Escape and hand focus
  // back to the toggle button, so a keyboard user isn't dropped onto <body>.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      const reply = res.ok
        ? data.reply
        : data.error || "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn’t reach the assistant. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Backdrop — mobile only, where the panel docks as a full-width
          sheet rather than floating beside the toggle, so a scrim makes
          it read as a modal and gives a tap-outside-to-close target. */}
      <div
        className={`fixed inset-0 z-[69] bg-black/50 transition-opacity duration-300 sm:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Chat panel — a bottom sheet docked to the viewport edge on
          mobile (full width, capped height so it never eats the whole
          screen); the original floating card beside the toggle from
          sm upward. */}
      <div
        className={`fixed z-[70] inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-24 sm:right-4 md:right-6 w-full sm:w-[calc(100vw-2rem)] sm:max-w-sm origin-bottom sm:origin-bottom-right transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        role="dialog"
        aria-modal={open}
        aria-label="Chat with Marzia’s assistant"
        aria-hidden={!open}
      >
        <div
          className="flex flex-col h-[min(30rem,75vh)] sm:h-[28rem] sm:max-h-[70vh] bg-paper border-x border-t sm:border border-border rounded-t-2xl sm:rounded-lg shadow-soft-lg overflow-hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background-secondary/40">
            <div className="flex flex-col">
              <span className="font-serif text-lg text-text leading-none">Ask about Marzia</span>
              <span className="text-xs text-text-secondary mt-1">Powered by AI · answers about her work</span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close chat"
              className="text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-md p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7L7 17" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "self-end bg-accent text-accent-contrast rounded-br-sm"
                    : "self-start bg-background-secondary/60 text-text rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="self-start bg-background-secondary/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5" aria-label="Assistant is typing">
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}

            {/* Suggestion chips — only before the first question */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 mt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-xs text-text-secondary border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border p-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Type your question"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-secondary/70 focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-button-primary-bg text-button-primary-text transition-colors hover:bg-button-primary-hover disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Floating toggle button — a magnetic pull (same system as Hero's
          CTA) carries the whole button toward the cursor within its
          radius; the icon and label each carry their own smaller, faster
          motion on top of that so the content doesn't move as one flat
          slab. All three transitions spring back on their own terms when
          the cursor leaves, rather than snapping to rest. */}
      <Magnetic strength={0.3} max={10} className="fixed z-[70] bottom-5 right-4 md:right-6">
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close chat" : "Ask about Marzia"}
          aria-expanded={open}
          className="group/fab inline-flex items-center justify-center gap-2 h-12 w-12 sm:w-auto px-0 sm:pl-4 sm:pr-5 rounded-full bg-button-primary-bg text-button-primary-text shadow-soft-lg hover:bg-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-[280ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/fab:scale-110 group-hover/fab:-translate-y-px group-focus-visible/fab:scale-110 group-focus-visible/fab:-translate-y-px motion-reduce:transition-none motion-reduce:group-hover/fab:scale-100 motion-reduce:group-hover/fab:translate-y-0"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7L7 17" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5M21 12a8 8 0 01-11.5 7.2L4 20l1-4.2A8 8 0 1121 12z" />
            )}
          </svg>
          <span className="hidden sm:inline text-sm tracking-wide transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/fab:translate-x-0.5 group-focus-visible/fab:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/fab:translate-x-0">
            {open ? "Close" : "Ask about me"}
          </span>
        </button>
      </Magnetic>
    </>
  );
}
