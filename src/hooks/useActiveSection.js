import { useEffect, useState } from "react";

const SECTION_IDS = ["top", "selected-work", "experience", "about", "contact"];

// Single IntersectionObserver shared by anything that needs to know which
// section is currently in view — the nav's active-state indicator and the
// URL hash sync both consume this instead of each running their own
// scroll-driven observer.
export function useActiveSection() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
        setActive(top.target.id);
      },
      // threshold is a fraction of the *target's own* area, not the root's —
      // against a band this thin, a tall section can never fill 25%+ of
      // itself inside it, so anything above 0 would almost never fire.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}
