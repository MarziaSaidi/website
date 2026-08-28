import { useEffect, useRef } from "react";
import Button from "../../components/ui/Button";
import Magnetic from "../../components/ui/Magnetic";
import ScrambleText from "../../components/ui/ScrambleText";
import HeroField from "./HeroField";
import HeroObject from "./HeroObject";
import { subscribeScrollY } from "../../hooks/useScrollY";

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
      className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-background"
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
            "radial-gradient(600px circle at var(--sx) var(--sy), color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 60%)",
        }}
      />

      <div
        ref={contentRef}
        className="relative max-w-6xl mx-auto px-6 md:px-10 w-full"
        style={{ willChange: "transform, opacity" }}
      >
        <div
          className="flex flex-col gap-8 md:gap-10 max-w-2xl"
          style={{
            transform: "translate3d(calc(var(--mx) * 16px), calc(var(--my) * 12px), 0)",
            transition: "transform 0.2s ease-out",
          }}
        >
          {/* Timing is deliberately much faster than a "showcase" scramble:
              the last character used to start decoding at 900ms and settle
              around 1.15s, which left the single most important line on the
              site unreadable for over a second. At 18ms/char and 4 ticks the
              whole headline resolves in ~360ms — still reads as a decode,
              but it never delays comprehension. */}
          <ScrambleText
            text="Design Engineer."
            as="h1"
            delay={0}
            charDelay={18}
            scrambleTicks={4}
            className="enter enter-1 font-display font-bold text-6xl md:text-8xl leading-[1.02] tracking-[-0.02em] text-text"
          />

          <p className="enter enter-2 text-xl md:text-2xl text-text-secondary leading-snug max-w-lg">
            Hi I'm Marzia Saidi, a passionate Software Developer &amp; UI/UX Designer.
          </p>

          <div className="enter enter-4 flex flex-wrap items-center gap-4 pt-4">
            <Magnetic>
              <Button href="#/work" variant="primary" icon="down">
                View all works
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>

      <a
        href="#/work"
        aria-label="Go to selected work"
        className="enter enter-5 hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-full"
      >
        <span className="text-[0.65rem] tracking-eyebrow uppercase font-mono">Scroll</span>
        <span className="scroll-cue-dot" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
