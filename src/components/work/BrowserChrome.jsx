// Shared "this is a real interface" framing device for project previews —
// a minimal macOS-style window chrome. Purely decorative (aria-hidden);
// the meaningful content is whatever's passed as children.
export default function BrowserChrome({ url, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-border bg-paper shadow-soft overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 sm:gap-4 px-2.5 py-1.5 sm:px-4 sm:py-2.5 border-b border-border bg-background-secondary/40">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-text-secondary/25" />
          <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-text-secondary/25" />
          <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-text-secondary/25" />
        </div>
        {url && (
          <span className="text-[0.6rem] sm:text-[0.7rem] font-mono text-text-secondary/70 truncate" aria-hidden="true">
            {url}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
