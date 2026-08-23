import { useEffect, useState } from "react";
import ScrambleText from "./ui/ScrambleText";

const SESSION_KEY = "marzia-intro-shown";
// Keep in sync with the .intro-bar-fill animation-duration in index.css.
const BAR_MS = 1400;
const FADE_MS = 550;

// A purely decorative full-screen overlay — it never gates or delays
// mounting the real page underneath, so screen readers reach actual
// content immediately regardless of what's playing out visually here.
// Shows once per browser session (not on every hash-route remount when
// coming back from a case study), and is skipped entirely under
// prefers-reduced-motion rather than shown in some "reduced" form.
export default function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private browsing / storage disabled — treat as not-yet-shown.
    }

    if (reduce || alreadyShown) return;

    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // No persistence available; the intro will just replay next load.
    }

    setVisible(true);
    const fadeTimer = setTimeout(() => setFading(true), BAR_MS);
    const removeTimer = setTimeout(() => setVisible(false), BAR_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[110] flex flex-col items-center justify-center gap-5 bg-background pointer-events-none transition-opacity ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <ScrambleText
        text="Marzia Saidi"
        as="p"
        className="font-display text-xl md:text-2xl tracking-[0.3em] uppercase text-text"
        charDelay={45}
        scrambleTicks={6}
      />
      <div className="w-36 h-px bg-border overflow-hidden">
        <div className="intro-bar-fill h-full bg-accent" />
      </div>
    </div>
  );
}
