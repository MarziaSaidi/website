import { useState } from "react";
import BrowserChrome from "./BrowserChrome";

// A real markup recreation of SupportIQ's support-chat surface, built to
// the actual shape of the feature — not a static screenshot, and not
// decorative motion either: clicking the suggested follow-up actually
// drives a second real exchange, so the RAG behavior (a specific answer
// grounded in a specific order) is something you interact with, not just
// read about.
const FOLLOW_UP = "Can I get a refund instead?";

export default function ChatPreview() {
  const [expanded, setExpanded] = useState(false);
  const [typing, setTyping] = useState(false);

  const handleFollowUp = () => {
    if (expanded || typing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setExpanded(true);
      return;
    }
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setExpanded(true);
    }, 900);
  };

  return (
    <BrowserChrome url="app.supportiq.dev/tickets/4521">
      <div className="p-4 md:p-5 flex flex-col gap-3 bg-background">
        <div className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-accent text-text text-sm px-4 py-2.5">
          My order hasn't arrived yet — it's been a week.
        </div>
        <div className="self-start max-w-[85%] flex flex-col gap-2">
          <div className="rounded-2xl rounded-bl-sm bg-paper border border-border text-text text-sm px-4 py-2.5 leading-relaxed">
            I see order #4521 shipped Tuesday and is currently in transit —
            expected Thursday. Want me to send the tracking link?
          </div>
          <div className="flex items-center gap-1.5 pl-1 text-[0.65rem] font-mono uppercase tracking-[0.1em] text-label">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />
            Cited order #4521 · RAG
          </div>
        </div>

        {!expanded && (
          <button
            type="button"
            onClick={handleFollowUp}
            disabled={typing}
            className="self-end mt-1 text-xs text-text-secondary border border-border rounded-full px-3 py-1.5 hover:border-accent hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze disabled:opacity-60"
          >
            {typing ? "…" : FOLLOW_UP}
          </button>
        )}

        {typing && (
          <div className="self-start bg-paper border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5" aria-label="Assistant is typing">
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        {expanded && (
          <>
            <div className="self-end max-w-[80%] rounded-2xl rounded-br-sm bg-accent text-text text-sm px-4 py-2.5">
              {FOLLOW_UP}
            </div>
            <div className="self-start max-w-[85%] flex flex-col gap-2">
              <div className="rounded-2xl rounded-bl-sm bg-paper border border-border text-text text-sm px-4 py-2.5 leading-relaxed">
                Since it's still in transit rather than lost, I'd hold off on a
                refund for now — I can start one automatically if it doesn't
                arrive by Friday. Sound okay?
              </div>
              <div className="flex items-center gap-1.5 pl-1 text-[0.65rem] font-mono uppercase tracking-[0.1em] text-label">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden="true" />
                Refund policy · shipping status · RAG
              </div>
            </div>
          </>
        )}
      </div>
    </BrowserChrome>
  );
}
