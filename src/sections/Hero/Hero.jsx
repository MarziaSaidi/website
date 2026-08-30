import { useEffect, useMemo, useRef } from "react";
import Button from "../../components/ui/Button";
import Magnetic from "../../components/ui/Magnetic";
import ScrambleText from "../../components/ui/ScrambleText";
import HeroField from "./HeroField";
import HeroStoryboard from "./HeroStoryboard";
import HeroStoryNav from "./HeroStoryNav";
import { usePrefersReducedMotion, useHeroScrollProgress } from "../../hooks/useHeroProgress";

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}
function smoothstep(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}

// The hero opens on just the headline, copy, and a "scroll to see how I
// work" prompt — the storyboard (nav/card + art) isn't part of that view
// at all, not even hidden-but-present, and the reverse is true once
// scrolling starts: the headline/copy view disappears completely rather
// than lingering alongside the storyboard. introView and storyboardView
// are two full views stacked in the same grid cell (see Hero()'s JSX),
// cross-fading into each other over a short window. The prompt button
// lives inside introView (it just fades with its parent, no separate
// timing of its own); "View all works" lives inside storyboardView but
// still needs its own ref, since it appears partway through — long after
// storyboardView itself is already fully visible. A third, independent
// subscription to the same shared progress the art and nav/card already
// use, matching this file's existing pattern rather than threading state
// between three separate components.
function useHeroIntroReveal(wrapperRef, refs, reduced) {
  const { finalCtaRef, introViewRef, storyboardViewRef } = refs;

  const applyProgress = useMemo(
    () => (progress) => {
      const REVEAL_END = 0.05;
      const CTA_START = 0.9;
      const storyIn = smoothstep(progress / REVEAL_END);
      const ctaIn = smoothstep((progress - CTA_START) / (1 - CTA_START));

      if (finalCtaRef.current) {
        finalCtaRef.current.style.opacity = String(ctaIn);
        finalCtaRef.current.style.pointerEvents = ctaIn > 0.5 ? "auto" : "none";
      }
      if (introViewRef.current) {
        introViewRef.current.style.opacity = String(1 - storyIn);
        introViewRef.current.style.pointerEvents = storyIn > 0.5 ? "none" : "auto";
      }
      if (storyboardViewRef.current) {
        storyboardViewRef.current.style.opacity = String(storyIn);
        storyboardViewRef.current.style.pointerEvents = storyIn > 0.5 ? "auto" : "none";
      }
    },
    []
  );

  // Disabled entirely under reduced motion — the hook never subscribes,
  // so applyProgress above never runs. The matching finished state (no
  // prompt, storyboard + "View all works" visible) is instead seeded
  // directly in each element's own JSX-authored initial style, the same
  // convention HeroStoryboard/HeroStoryNav's reduced-motion branches use.
  useHeroScrollProgress(wrapperRef, applyProgress, { disabled: reduced });
}

// Pointer parallax + spotlight only — driven by CSS custom properties set
// directly on refs (no React re-renders per frame). The scroll-driven part
// of the hero now lives in HeroStoryboard's own scroll-scrubbed progress
// (see useHeroProgress.js); this hook no longer fades the copy out on
// scroll, since the hero is a long pinned section now, not a short one
// being scrolled past — see Hero()'s comment below for why.
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
  const wrapperRef = useRef(null);
  const paneRef = useRef(null);
  const finalCtaRef = useRef(null);
  const introViewRef = useRef(null);
  const storyboardViewRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  usePointerParallax(paneRef);
  useHeroIntroReveal(wrapperRef, { finalCtaRef, introViewRef, storyboardViewRef }, reduced);

  function scrollIntoStory() {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  }

  return (
    // The wrapper is tall (desktop: 420vh) so scrolling through it drives
    // the storyboard's five stages one at a time, the same pinned-viewport
    // technique lance.live uses for its scroll-scrubbed hero video: a
    // `sticky` inner pane holds still while the wrapper's extra height
    // supplies the scroll distance. `motion-reduce:` collapses the wrapper
    // back to a normal, non-pinned hero — see HeroStoryboard's own reduced-
    // motion branch for the accompanying static composition.
    <section
      ref={wrapperRef}
      id="top"
      aria-label="Introduction"
      className="relative h-[240vh] md:h-[320vh] lg:h-[420vh] motion-reduce:h-auto bg-background"
    >
      <div
        ref={paneRef}
        style={{ "--mx": 0, "--my": 0, "--sx": "50%", "--sy": "50%" }}
        className="sticky top-0 h-screen motion-reduce:static motion-reduce:h-auto flex items-center pt-32 pb-20 overflow-hidden"
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

        {/* introView and storyboardView are two whole, mutually-exclusive
            views of the hero — not "storyboard sitting there at 0
            opacity, still reserving its layout space" but genuinely not
            part of the page until scroll reveals it. Stacking them in the
            same CSS grid cell (both get gridArea "1 / 1" below) is what
            gets that for free: the grid sizes itself to whichever view is
            larger (storyboardView, with its nav/card/art), and either
            view can be shown/hidden without the other fighting it for
            layout space the way two ordinary flow siblings would.
            introView is centered (not top-aligned) within that shared
            box specifically — it's much shorter than storyboardView, and
            top-aligning it against a box sized for the taller sibling
            would leave a big dead gap below the paragraph. Each view
            carries its own CTA rather than sharing one slot below the
            grid, for the same reason: a slot positioned after a box
            that's sized for storyboardView would land far below intro's
            actual content while intro is the one showing. */}
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full">
          <div className="grid">
            <div
              ref={introViewRef}
              className="self-center flex flex-col gap-6 md:gap-7 max-w-2xl"
              style={{
                gridArea: "1 / 1",
                opacity: reduced ? 0 : 1,
                pointerEvents: reduced ? "none" : "auto",
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

              <div className="enter enter-4 flex flex-wrap items-center gap-4 pt-1">
                <Magnetic>
                  <Button
                    as="button"
                    type="button"
                    onClick={scrollIntoStory}
                    variant="primary"
                    icon="down"
                    className="scroll-prompt-btn"
                  >
                    Scroll to see how I work
                  </Button>
                </Magnetic>
              </div>
            </div>

            <div
              ref={storyboardViewRef}
              className="self-start lg:flex lg:items-center lg:justify-between lg:gap-12 xl:gap-20"
              style={{ gridArea: "1 / 1", opacity: reduced ? 1 : 0, pointerEvents: reduced ? "auto" : "none" }}
            >
              <div className="flex flex-col gap-6 md:gap-7 max-w-2xl">
                <HeroStoryNav wrapperRef={wrapperRef} reduced={reduced} />

                {/* Independent of storyboardView's own fade — storyboardView
                    is already fully visible for most of the scroll range;
                    this specifically waits for SHIP near the very end. */}
                <div
                  ref={finalCtaRef}
                  className="flex flex-wrap items-center gap-4 pt-1"
                  style={reduced ? { opacity: 1 } : { opacity: 0, pointerEvents: "none" }}
                >
                  <Magnetic>
                    <Button href="#/work" variant="primary" icon="down">
                      View all works
                    </Button>
                  </Magnetic>
                </div>
              </div>

              <HeroStoryboard wrapperRef={wrapperRef} reduced={reduced} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
