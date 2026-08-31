import { useRef } from "react";
import HeroStoryboard from "./HeroStoryboard";
import HeroStoryNav from "./HeroStoryNav";
import { usePrefersReducedMotion } from "../../hooks/useHeroProgress";
import { PROCESS_SECTION_ID } from "./heroStoryboard.data";

export default function ProcessSection() {
  const wrapperRef = useRef(null);
  const reduced = usePrefersReducedMotion();

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
          </div>

          <HeroStoryboard wrapperRef={wrapperRef} reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
