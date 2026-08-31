import { useEffect, useRef } from "react";
import ScrambleText from "../../components/ui/ScrambleText";
import HeroField from "./HeroField";
import { PROCESS_SECTION_ID } from "./heroStoryboard.data";

// Pointer parallax + spotlight only — driven by CSS custom properties set
// directly on refs (no React re-renders per frame). The scroll-scrubbed
// storyboard used to live inside this same section (see git history);
// it's its own section now, immediately after this one, so Hero itself
// is just a normal, single-viewport intro again — no pinning, no shared-
// space view switching, no scroll-progress hook here at all.
function usePointerParallax(paneRef) {
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let pending = null;

    function onMove(e) {
      const r = pane.getBoundingClientRect();
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
      pane.style.setProperty("--mx", pending.mx.toFixed(3));
      pane.style.setProperty("--my", pending.my.toFixed(3));
      pane.style.setProperty("--sx", `${pending.sx}px`);
      pane.style.setProperty("--sy", `${pending.sy}px`);
    }

    pane.addEventListener("pointermove", onMove);
    return () => {
      pane.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [paneRef]);
}

export default function Hero() {
  const paneRef = useRef(null);
  usePointerParallax(paneRef);

  function scrollIntoStory() {
    document.getElementById(PROCESS_SECTION_ID)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      ref={paneRef}
      id="top"
      aria-label="Introduction"
      style={{ "--mx": 0, "--my": 0, "--sx": "50%", "--sy": "50%" }}
      className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-background"
    >
      <HeroField sectionRef={paneRef} />

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

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full">
        <div
          className="flex flex-col gap-6 md:gap-7 max-w-2xl"
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
            className="enter enter-1 font-display font-bold text-5xl md:text-7xl leading-[1.02] tracking-[-0.02em] text-text"
          />

          <p className="enter enter-2 text-lg md:text-xl text-text-secondary leading-snug max-w-lg">
            Hi I'm Marzia Saidi, a passionate Software Developer &amp; UI/UX Designer.
          </p>

          {/* A guidance cue, not a CTA — no pill, no fill, no hover
              sweep. The arrow is the part doing the work (it's the
              thing that keeps moving), the text is just there to say
              why; reversed weighting from every other button on the
              site, which is why this isn't built on top of Button. */}
          <button
            type="button"
            onClick={scrollIntoStory}
            className="enter enter-4 flex items-center gap-3 pt-1 text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            <span className="text-sm md:text-base tracking-wide">Scroll to see how I work</span>
            <svg
              className="scroll-prompt-arrow"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
