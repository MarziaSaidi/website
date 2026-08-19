import { useEffect } from "react";

// Keeps the URL hash matching the given active section id via
// history.replaceState — no new history entries, no scroll jump, and no
// "hashchange" event (so it never fights useHashRoute). Without this, the
// hash only changes on click, so scrolling back to the hero by hand leaves
// a stale hash in the address bar and a reload jumps you back to wherever
// you last clicked instead of where you actually are.
export function useHashSync(activeId) {
  useEffect(() => {
    if (!activeId) return;
    const nextHash = activeId === "top" ? "" : `#${activeId}`;
    if (window.location.hash !== nextHash) {
      const url = `${window.location.pathname}${window.location.search}${nextHash}`;
      window.history.replaceState(null, "", url);
    }
  }, [activeId]);
}
