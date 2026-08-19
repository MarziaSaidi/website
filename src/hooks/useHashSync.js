import { useEffect } from "react";

const SECTION_IDS = ["top", "selected-work", "experience", "about", "contact"];

// Keeps the URL hash in sync with whichever section is actually in view as
// the user scrolls, via history.replaceState — no new history entries, no
// scroll jump, and no "hashchange" event (so it never fights useHashRoute).
// Without this, the hash only changes on click, so scrolling back to the
// hero by hand leaves a stale hash in the address bar and a reload jumps
// you back to wherever you last clicked instead of where you actually are.
export function useHashSync() {
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        const top = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
        const nextHash = top.target.id === "top" ? "" : `#${top.target.id}`;

        if (window.location.hash !== nextHash) {
          const url = `${window.location.pathname}${window.location.search}${nextHash}`;
          window.history.replaceState(null, "", url);
        }
      },
      // threshold is a fraction of the *target's own* area, not the root's —
      // against a band this thin, a tall section can never fill 25%+ of
      // itself inside it, so anything above 0 would almost never fire.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
}
