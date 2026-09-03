import { useEffect, useRef } from "react";
import { subscribeScrollY } from "../../hooks/useScrollY";

const CELL = 8; // px cell pitch — grid spacing stays fixed, only each cell's square grows
const MIN_SIDE = 0.2; // px — smallest clearly renderable size, per spec's grid "floor"

// Dark-theme hero (#211A4A) grows black squares; light-theme hero
// (#F1F0FF) grows white squares — read live off <html data-theme>
// (cheap DOM attribute read, matches HeroField's darkBoost() pattern)
// rather than cached at mount, so the nav's theme toggle flips it too.
function pixelColor() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "#000000" : "#ffffff";
}

// One fixed, evenly-spaced grid of squares laid out across the hero's own
// ambient background (HeroField's aurora/dots, FallingIcons — not the
// headline/MARZIA/scroll-cue, which sit above this in the DOM and stay
// legible the whole way through). Every cell exists from the start and
// keeps its position for the section's whole lifetime — nothing spawns,
// moves, or disappears; only each square's side length changes, growing
// from a near-invisible 0.2px up to the full cell pitch (at which point
// neighboring squares touch and the grid reads as solid coverage). Side
// length is a pure function of scroll-derived progress, not a per-cell
// random threshold or any animation state, so scrolling backward shrinks
// every square back down smoothly and precisely (recomputed on every
// scroll tick via the same rAF-throttled subscribeScrollY the hero's own
// pointer-parallax pattern is built on).
export default function HeroPixelDissolve({ sectionRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;

    function build() {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      // Grid geometry only — no per-cell state, so there's nothing to
      // regenerate here beyond the column/row count a resize changes.
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
    }

    function paint(progress) {
      ctx.clearRect(0, 0, w, h);
      const side = Math.max(MIN_SIDE, progress * CELL);
      ctx.fillStyle = pixelColor();
      const inset = (CELL - side) / 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          ctx.fillRect(col * CELL + inset, row * CELL + inset, side, side);
        }
      }
    }

    // 0 exactly when the hero fills the viewport top-to-bottom (the next
    // section isn't visible at all yet, so growth hasn't started) up to 1
    // once the next section is HALF visible in the viewport, not fully —
    // i.e. progress runs at 2x the rate of next-section visibility, so the
    // grid finishes covering the hero while the next section is still only
    // 50% into view, per spec, rather than only finishing once it's 100%
    // in view.
    function onScroll() {
      const r = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const nextSectionVisible = Math.min(1, Math.max(0, (viewportH - r.bottom) / viewportH));
      const progress = Math.min(1, nextSectionVisible / 0.5);
      paint(progress);
    }

    build();
    onScroll();
    const ro = new ResizeObserver(() => {
      build();
      onScroll();
    });
    ro.observe(section);
    const unsubscribe = subscribeScrollY(onScroll);

    return () => {
      ro.disconnect();
      unsubscribe();
    };
  }, [sectionRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
