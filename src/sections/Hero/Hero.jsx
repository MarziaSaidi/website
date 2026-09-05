import { useEffect, useRef } from "react";
import ScrambleText from "../../components/ui/ScrambleText";
import HeroField from "./HeroField";
import FallingIcons from "./FallingIcons";
import HeroPixelDissolve from "./HeroPixelDissolve";

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
  usePointerParallax(paneRef);

  return (
    <section
      ref={paneRef}
      id="top"
      aria-label="Introduction"
      style={{
        "--mx": 0,
        "--my": 0,
        // Hero's own left content edge, expressed as the closed form of
        // the site's shared container (max-w-6xl mx-auto px-6 md:px-10 —
        // see Navbar.jsx / FeaturedWork.jsx / Experience.jsx /
        // Contact.jsx / Footer.jsx): flat 40px from md up to the 1152px
        // cap, then grows in lockstep with that centered container
        // beyond it. Both constants (40px, 1152px) are the site's
        // existing px-10 / max-w-6xl tokens, not new values.
        // Hero used to derive its left inset from the MARZIA mark's own
        // right-side formula (min(114px, 7.9167vw)) instead, which
        // coincides with this one only by accident near a ~1280px
        // viewport and diverges without bound above it (measured up to
        // 630px apart at 2560px wide). This custom property is now the
        // single source of truth for Hero's left edge; the mark keeps
        // its own independent right-side formula in .hero-marzia-mark
        // below, untouched.
        "--hero-left-inset": "max(40px, calc((100vw - 1152px) / 2 + 40px))",
        // How far Hero's copy must stay clear of the MARZIA mark's own
        // left edge, in absolute viewport terms: the mark's own right
        // inset (min(114px, 7.9167vw)) + the mark's own rendered width,
        // which in vertical-rl equals its font-size
        // (min(220px, (100vh-112px)/4.46) — confirmed 1:1 against the
        // mark's real getBoundingClientRect() at 1920x1080) + 32px
        // (gap-8) of breathing room. Applied as right-side padding to
        // content that would otherwise grow to fill its container (the
        // eyebrow row's flex-1 paragraph); the headline never needs it
        // because its own max-w-2xl column already stops 200px+ short
        // of the mark at every tested viewport.
        "--hero-mark-clearance":
          "calc(min(114px, 7.9167vw) + min(220px, calc((100vh - 112px) / 4.46)) + 32px)",
      }}
      className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-hero-bg"
    >
      <HeroField sectionRef={paneRef} />
      <FallingIcons />

      <span className="hero-marzia-mark" aria-hidden="true">
        MARZIA
      </span>

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
          // Left edge: px-6 below md, then --hero-left-inset from md up —
          // the same equation the site's shared container produces, so
          // this row starts at the identical x as the Navbar logo and the
          // Featured Work heading (see the section's own style prop
          // above). Right edge: --hero-mark-clearance keeps the row (and
          // its flex-1 paragraph, which would otherwise grow to fill
          // whatever space it's given) clear of MARZIA, independent of
          // the row's own left position — two self-contained formulas
          // instead of one formula doing both jobs, which is what made
          // Hero's left edge drift from the rest of the site in the first
          // place. Below sm, only the eyebrow lives here (the paragraph
          // moves to its own bottom-pinned block — see below), and its
          // own hard line break already keeps it clear of MARZIA, so
          // pr only needs to engage from sm up.
          className="px-6 md:pl-[var(--hero-left-inset)] sm:pr-[var(--hero-mark-clearance)] flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
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

      <div className="relative max-w-6xl px-6 md:pl-[var(--hero-left-inset)] md:pr-10 w-full">
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
          // From md up, max-w-2xl (672px) is the safety net that keeps
          // this column well clear of MARZIA regardless of the outer
          // wrapper's own --hero-left-inset (verified: 200px+ of
          // clearance at every tested desktop viewport), so the outer
          // wrapper's md:pr-10 only needs to match the site's standard
          // right padding, not a mark-derived one.
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
