import { useEffect, useRef } from "react";
import ScrambleText from "../../components/ui/ScrambleText";
import HeroField from "./HeroField";
import FallingIcons from "./FallingIcons";
import HeroPixelDissolve from "./HeroPixelDissolve";
import SoftBodyMarzia from "./SoftBodyMarzia";

// Pointer parallax only — driven by CSS custom properties set directly on
// refs (no React re-renders per frame). The scroll-scrubbed storyboard
// used to live inside this same section (see git history); it's its own
// section now, immediately after this one, so Hero itself is just a
// normal, single-viewport intro again — no pinning, no shared-space view
// switching, no scroll-progress hook here at all.
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
      };
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function apply() {
      raf = 0;
      if (!pending) return;
      pane.style.setProperty("--mx", pending.mx.toFixed(3));
      pane.style.setProperty("--my", pending.my.toFixed(3));
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
  const markRef = useRef(null);
  usePointerParallax(paneRef);

  return (
    <section
      ref={paneRef}
      id="top"
      aria-label="Introduction"
      style={{ "--mx": 0, "--my": 0 }}
      className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-hero-bg"
    >
      <HeroField sectionRef={paneRef} />
      <FallingIcons />

      {/* Kept in the DOM purely as the authoritative source for both
          layout (its own live getBoundingClientRect) and rasterization
          (its own computed style) — see SoftBodyMarzia.jsx. Never
          painted itself, so the CSS position/size formula above stays
          the single source of truth instead of being duplicated in JS. */}
      <span ref={markRef} className="hero-marzia-mark" aria-hidden="true" style={{ visibility: "hidden" }}>
        MARZIA
      </span>
      <SoftBodyMarzia markRef={markRef} />

      {/* Above the ambient background layers and MARZIA (HeroField,
          FallingIcons, the mark) so it can visually replace all of them
          with pixels — below the headline copy (later in this DOM =
          higher default stacking), which stays fully legible through the
          whole scroll. "The hero BACKGROUND dissolves," MARZIA included,
          not the headline sitting on it. */}
      <HeroPixelDissolve sectionRef={paneRef} />

      {/* Pinned near the section's own top edge, independent of the
          vertically-centered headline column below — same placement
          pattern as .hero-marzia-mark (top: 96px), so this row and MARZIA
          start at roughly the same height. */}
      <div className="absolute inset-x-0 top-24 md:top-28">
        <div
          // Below sm, only the eyebrow lives here (the paragraph moves to
          // its own bottom-pinned block — see below), and its own hard
          // line break already keeps it clear of MARZIA, so no width cap
          // is needed at that size. From sm up, the paragraph rejoins this
          // row and needs the same right-edge clearance formula as the
          // headline column below (see its own comment) — without it "in
          // the middle" would still end up crowding MARZIA, since
          // max-w-6xl alone runs right up to it. From md up, left edge is
          // pinned to the same 114px/7.9167vw MARZIA itself uses on the
          // right (see .hero-marzia-mark), instead of being centered.
          className="sm:max-w-[calc(92.0833vw-19vh-40px)] md:max-w-[min(72rem,calc(100vw-19vh-96px))] px-6 md:pl-[min(114px,7.9167vw)] md:pr-10 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
        >
          <p
            className="enter font-bold text-text"
            style={{ fontSize: "24px", lineHeight: 1.2 }}
          >
            Design &<br />Engineering
          </p>

          {/* Below sm, this copy moves down to sit under the headline
              instead (see the hidden sm:block/sm:hidden pair below) — up
              here it would run into MARZIA at narrow widths. Centered in
              the remaining width after the eyebrow, not pinned to the
              row's right edge, so it sits in the middle rather than
              crowding MARZIA. */}
          <p className="hidden sm:block flex-1 enter enter-2 text-lg md:text-xl text-text-secondary leading-snug text-center">
            I'm Marzia Saidi. I design interfaces and
            <br />
            ship the production code behind them.
          </p>
        </div>
      </div>

      <div className="relative max-w-6xl px-6 md:pl-[min(114px,7.9167vw)] md:pr-10 w-full">
        <div
          // Below md, this replaces the plain max-w-2xl with a width that
          // mirrors the "MARZIA" mark's own position formula (see
          // .hero-marzia-mark in index.css: right = min(114px, 7.9167vw),
          // font-size = min(180px, 19vh), so its left edge sits at
          // 100vw - 7.9167vw - 19vh on any viewport narrower than md) —
          // minus 24px for the section's own left padding and another
          // 16px of breathing room. Without it the copy just wraps to
          // fill the available width like any block text and runs into
          // MARZIA, which needs to stay full desktop-height on mobile
          // rather than shrinking to get out of the way itself.
          className="flex flex-col gap-6 md:gap-7 max-w-[calc(92.0833vw-19vh-40px)] md:max-w-2xl"
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
            text="I bring craft, taste & code to digital products."
            as="h1"
            delay={0}
            charDelay={18}
            scrambleTicks={4}
            className="enter enter-1 font-display font-bold uppercase text-4xl sm:text-5xl md:text-7xl leading-[1.02] tracking-[-0.02em] text-text md:translate-y-[10px]"
          />
        </div>
      </div>

      {/* Mobile-only counterpart to the top row's paragraph (see
          hidden sm:block above) — pinned to the section's own bottom edge
          rather than flowing right after the headline, so there's a big
          gap between the two instead of them sitting close together. */}
      <div className="sm:hidden absolute inset-x-0 bottom-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="enter enter-2 text-lg text-text-secondary leading-snug max-w-[85%]">
            I'm Marzia Saidi. I design interfaces and ship the production code behind them.
          </p>
        </div>
      </div>
    </section>
  );
}
