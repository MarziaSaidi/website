import BrowserChrome from "./BrowserChrome";

// An illustrative recreation of SupportIQ's support-chat surface — not a
// screenshot (there's no public demo tenant to capture one from), but real
// markup built to the actual shape of the feature: a RAG answer that cites
// the order it pulled from the database, not a generic canned reply.
export default function ChatPreview() {
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
      </div>
    </BrowserChrome>
  );
}
