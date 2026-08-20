import { useEffect, useState } from "react";
import ScrambleText from "./ScrambleText";

// A slim, real-content status strip between Hero and Selected Work — doubles
// as the transition beat between the two sections rather than a second
// bespoke scroll-transition mechanism. The rotating clause is genuinely
// meaningful (not decorative), so it's never aria-hidden; it just re-decodes
// via the existing ScrambleText component each time it changes.
const ROTATIONS = ["shipping", "designing interfaces", "writing TypeScript", "reviewing a PR"];

export default function SystemStatusBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ROTATIONS.length);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-y border-border bg-background-secondary/50">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-secondary">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
        <span className="text-text">MARZIA.OS</span>
        <span aria-hidden="true">&middot;</span>
        <span>Status: open to work</span>
        <span aria-hidden="true">&middot;</span>
        <span>
          currently:{" "}
          <ScrambleText
            key={ROTATIONS[index]}
            text={ROTATIONS[index]}
            as="span"
            className="text-text"
            charDelay={18}
            scrambleTicks={5}
          />
        </span>
      </div>
    </div>
  );
}
