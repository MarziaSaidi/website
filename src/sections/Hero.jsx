import { useRef } from "react";
import Button from "../components/ui/Button";
import HeroSignature from "../components/HeroSignature";

export default function Hero() {
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      className="relative pt-40 pb-16 md:pt-48 md:pb-24 overflow-hidden"
    >
      <HeroSignature sectionRef={sectionRef} />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-6 max-w-2xl">
          <p className="enter enter-1 font-mono text-xs uppercase tracking-[0.22em] text-label">
            Design Engineer
          </p>
          <h1 className="enter enter-1 text-6xl md:text-7xl leading-[1.03] tracking-[-0.01em] text-text">
            Marzia Saidi
          </h1>
          <p className="enter enter-2 font-serif text-2xl md:text-3xl text-text leading-snug max-w-lg">
            I design and build polished interfaces for complex products.
          </p>
          <p className="enter enter-3 text-text-secondary text-sm tracking-wide uppercase">
            Product design · Frontend engineering · Prototyping
          </p>
          <div className="enter enter-4 flex flex-wrap items-center gap-4 pt-2">
            <Button href="#selected-work" variant="primary">
              View Selected Work ↓
            </Button>
            <Button
              href="#contact"
              variant="secondary"
              className="!bg-background"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#selected-work"
        aria-label="Scroll to selected work"
        className="enter enter-5 hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-full"
      >
        <span className="text-[0.65rem] tracking-[0.25em] uppercase">Scroll</span>
        <span className="scroll-cue-dot" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
