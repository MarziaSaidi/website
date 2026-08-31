import { useMemo, useRef } from "react";
import Button from "../../components/ui/Button";
import Magnetic from "../../components/ui/Magnetic";
import HeroStoryboard from "./HeroStoryboard";
import HeroStoryNav from "./HeroStoryNav";
import { usePrefersReducedMotion, useHeroScrollProgress } from "../../hooks/useHeroProgress";
import { PROCESS_SECTION_ID } from "./heroStoryboard.data";

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}
function smoothstep(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}

// "View all works" is independent of the stage nav/card and the art —
// both of those are driven by HeroStoryNav's and HeroStoryboard's own
// separate subscriptions to this same section's scroll progress. This
// one just waits for SHIP near the very end before revealing itself.
function useFinalCta(wrapperRef, finalCtaRef, reduced) {
  const applyProgress = useMemo(
    () => (progress) => {
      const CTA_START = 0.9;
      const ctaIn = smoothstep((progress - CTA_START) / (1 - CTA_START));
      if (finalCtaRef.current) {
        finalCtaRef.current.style.opacity = String(ctaIn);
        // Collapses the row itself (grid-template-rows: 0fr -> 1fr), not
        // just its opacity — on the mobile stacked layout, an opacity-
        // only hide still reserved this button's full height the entire
        // time it was invisible, shoving the storyboard art down by a
        // fixed dead gap for 90% of the scroll. Desktop's side-by-side
        // layout never showed this (the art sits in its own flex column,
        // unaffected by the nav/card column's height).
        finalCtaRef.current.style.gridTemplateRows = `${ctaIn}fr`;
        finalCtaRef.current.style.pointerEvents = ctaIn > 0.5 ? "auto" : "none";
      }
    },
    []
  );

  useHeroScrollProgress(wrapperRef, applyProgress, { disabled: reduced });
}

export default function ProcessSection() {
  const wrapperRef = useRef(null);
  const finalCtaRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  useFinalCta(wrapperRef, finalCtaRef, reduced);

  return (
    // Tall so scrolling through it drives the storyboard's five stages one
    // at a time — the same pinned-viewport technique lance.live uses for
    // its scroll-scrubbed hero video: a `sticky` inner pane holds still
    // while the wrapper's extra height supplies the scroll distance.
    // `motion-reduce:` collapses it back to a normal, non-pinned section —
    // see HeroStoryboard's own reduced-motion branch for the accompanying
    // static composition. A separate section from Hero now (not stacked
    // in the same viewport), so there's no hard-cut/blank-gap handoff to
    // manage here — normal document flow already keeps the two from ever
    // overlapping, and this section simply rests on its own opening frame
    // (Discover, just the character) until scrolling actually reaches it.
    <section
      ref={wrapperRef}
      id={PROCESS_SECTION_ID}
      aria-label="How I work"
      className="relative h-[240vh] md:h-[320vh] lg:h-[420vh] motion-reduce:h-auto bg-background"
    >
      <div className="sticky top-0 h-screen motion-reduce:static motion-reduce:h-auto flex items-center pt-32 pb-20 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full lg:flex lg:items-center lg:justify-between lg:gap-12 xl:gap-20">
          <div className="flex flex-col gap-6 md:gap-7 max-w-2xl">
            <HeroStoryNav wrapperRef={wrapperRef} reduced={reduced} />

            <div
              ref={finalCtaRef}
              className="grid pt-1"
              style={reduced ? { gridTemplateRows: "1fr", opacity: 1 } : { gridTemplateRows: "0fr", opacity: 0, pointerEvents: "none" }}
            >
              <div className="overflow-hidden flex flex-wrap items-center gap-4">
                <Magnetic>
                  <Button href="#/work" variant="primary" icon="down">
                    View all works
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>

          <HeroStoryboard wrapperRef={wrapperRef} reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
