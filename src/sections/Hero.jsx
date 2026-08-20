import { useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import Magnetic from "../components/ui/Magnetic";
import HeroField from "../components/HeroField";
import HeroObject from "../components/HeroObject";
import ScrambleText from "../components/ScrambleText";
import { subscribeScrollY } from "../hooks/useScrollY";

// Pointer parallax + spotlight, and scroll-out fade — all driven by CSS
// custom properties set directly on refs (no React re-renders per frame).
// The scroll portion subscribes to the app's one shared scroll listener
// rather than registering its own.
function useHeroMotion(sectionRef, contentRef) {
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let pending = null;

    function onMove(e) {
      const r = section.getBoundingClientRect();
      pending = {
        mx: (e.clientX - r.left) / r.width - 0.5,
        my: (e.clientY - r.top) / r.height - 0.5,
        sx: e.clientX - r.left,
        sy: e.clientY - r.top,
      };
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function apply() {
      raf = 0;
      if (!pending) return;
      section.style.setProperty("--mx", pending.mx.toFixed(3));
      section.style.setProperty("--my", pending.my.toFixed(3));
      section.style.setProperty("--sx", `${pending.sx}px`);
      section.style.setProperty("--sy", `${pending.sy}px`);
    }

    function onScroll(y) {
      const progress = Math.min(1, Math.max(0, y / section.offsetHeight));
      content.style.opacity = String(1 - progress * 0.7);
      content.style.transform = `translateY(${progress * 36}px)`;
    }

    section.addEventListener("pointermove", onMove);
    const unsubscribe = subscribeScrollY(onScroll);
    return () => {
      section.removeEventListener("pointermove", onMove);
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, contentRef]);
}

export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  useHeroMotion(sectionRef, contentRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      style={{ "--mx": 0, "--my": 0, "--sx": "50%", "--sy": "50%" }}
      className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-background"
    >
      <HeroField sectionRef={sectionRef} />
      <HeroObject />

      {/* Cursor spotlight — a soft glow that follows the pointer, layered
          above the aurora/dot field. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(600px circle at var(--sx) var(--sy), rgba(166, 121, 60, 0.06), transparent 60%)",
        }}
      />

      <div
        ref={contentRef}
        className="relative max-w-6xl mx-auto px-6 md:px-10 w-full"
        style={{ willChange: "transform, opacity" }}
      >
        <div
          className="flex flex-col gap-6 max-w-2xl"
          style={{
            transform: "translate3d(calc(var(--mx) * 16px), calc(var(--my) * 12px), 0)",
            transition: "transform 0.2s ease-out",
          }}
        >
          <p className="enter enter-1 font-mono text-xs uppercase tracking-[0.22em] text-accent flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(166,121,60,0.7)]" aria-hidden="true" />
            Design Engineer
            <span className="caret-blink text-text-secondary" aria-hidden="true">_</span>
          </p>

          <ScrambleText
            text="Marzia Saidi"
            as="h1"
            delay={150}
            className="enter enter-1 font-display text-6xl md:text-8xl leading-[1.02] tracking-[-0.02em] text-text"
          />

          <p className="enter enter-2 font-serif italic text-2xl md:text-3xl text-text leading-snug max-w-lg">
            I design and build polished interfaces for complex products.
          </p>
          <p className="enter enter-3 font-mono text-xs tracking-[0.18em] uppercase text-label">
            Product design · Frontend engineering · Prototyping
          </p>
          <div className="enter enter-4 flex flex-wrap items-center gap-4 pt-2">
            <Magnetic>
              <Button href="#selected-work" variant="primary">
                View Selected Work ↓
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="#contact" variant="secondary">
                Get in Touch
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>

      <a
        href="#selected-work"
        aria-label="Scroll to selected work"
        className="enter enter-5 hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-full"
      >
        <span className="text-[0.65rem] tracking-[0.25em] uppercase font-mono">Scroll</span>
        <span className="scroll-cue-dot" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
