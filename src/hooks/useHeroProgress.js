import { useEffect, useRef, useState } from "react";
import { subscribeScrollY } from "./useScrollY";

// Detected once at mount — this only gates *effect creation* (whether the
// hero's scroll listener and Anime.js instances get created at all). It
// intentionally doesn't react to a live OS-setting flip mid-session; a
// reload picks up the change, matching every other reduced-motion check
// already in this codebase (see HeroField.jsx, Hero.jsx).
export function usePrefersReducedMotion() {
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

// Drives the hero storyboard's scroll-scrubbed progress (0 -> 1) across a
// tall wrapper element, the same way lance.live pins its hero video: a
// `position: sticky` viewport inside a tall relative wrapper, with progress
// = how far scrolled through (wrapperHeight - viewportHeight).
//
// Delivered as a plain callback rather than React state — the storyboard
// has ~20 animatable SVG nodes, so `onProgress` is expected to mutate refs
// directly (matching Hero.jsx's existing useHeroMotion pattern) instead of
// triggering a re-render on every scroll tick.
//
// The value handed to onProgress is damped, not the raw scroll-derived
// number — a fast flick or trackpad-momentum scroll can jump the raw ratio
// by 10-20% between two rAF ticks, and every consumer here (opacity
// staggers, the nav's active-stage switch) was built to read as motion
// happening in between, not as a value that teleports. Chasing `target`
// with an exponential lerp every frame (the same trick GSAP's ScrollTrigger
// `scrub` option does) turns that teleport into a short, continuous catch-
// up animation instead — pieces are always seen arriving, never just
// suddenly present. SMOOTH is a per-frame catch-up fraction, not a
// duration: at 60fps it settles within roughly 200-250ms of a scroll
// stopping, quick enough to still feel scroll-driven rather than laggy.
const SMOOTH = 0.16;
const SNAP_EPSILON = 0.0004;

// smooth=false skips the lerp above entirely — onProgress gets the raw,
// instant scroll ratio on every event. Hero.jsx's intro/storyboard
// switch needs this: it's a hard cut (see Hero.jsx's own comment), not
// an eased transition, so it should react the instant the real scroll
// position crosses its threshold. Feeding it the damped value instead
// left a ~200ms window, after a fast scroll, where the damped progress
// was still catching up from the *previous* side of the cut — during
// which the intro view and storyboard view could each be mid-toggle at
// once, since the two hard-cut thresholds (see Hero.jsx's BLANK_GAP)
// were being evaluated against a progress value that hadn't caught up
// to where the page actually was.
export function useHeroScrollProgress(wrapperRef, onProgress, { disabled = false, smooth = true } = {}) {
  const measureRef = useRef({ top: 0, range: 1 });
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);
  const primedRef = useRef(false);

  // A plain effect, deliberately not useLayoutEffect: `wrapperRef` is
  // attached to an ANCESTOR of whatever calls this hook (Hero.jsx's outer
  // section, read from a descendant), and ref attachment + layout effects
  // both run bottom-up within a commit — a descendant's layout effect runs
  // before an ancestor host node's ref has been attached, so wrapper.current
  // would still be null here. A passive effect runs after the whole tree's
  // refs are attached, at the cost of applying the first frame's progress
  // a tick later — which is why the JSX below seeds sketch/paper already
  // visible (matching the true p=0 state) instead of blank, so that one
  // tick is never visible as a flash.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || disabled) return;

    function measure() {
      const rect = wrapper.getBoundingClientRect();
      measureRef.current = {
        top: window.scrollY + rect.top,
        range: Math.max(1, wrapper.offsetHeight - window.innerHeight),
      };
    }

    function tick() {
      const target = targetRef.current;
      const diff = target - currentRef.current;
      if (Math.abs(diff) < SNAP_EPSILON) {
        currentRef.current = target;
        rafRef.current = 0;
        onProgress(currentRef.current);
        return;
      }
      currentRef.current += diff * SMOOTH;
      rafRef.current = requestAnimationFrame(tick);
      onProgress(currentRef.current);
    }

    function ensureTicking() {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    }

    function onScroll(y) {
      const { top, range } = measureRef.current;
      targetRef.current = Math.min(1, Math.max(0, (y - top) / range));
      if (!smooth) {
        currentRef.current = targetRef.current;
        onProgress(currentRef.current);
        return;
      }
      // The very first measurement (page load, or a hash-route remount)
      // should land exactly on the real scroll position — only scroll
      // deltas *after* that get smoothed, so nothing animates in from a
      // stale 0 on first paint.
      if (!primedRef.current) {
        primedRef.current = true;
        currentRef.current = targetRef.current;
        onProgress(currentRef.current);
        return;
      }
      ensureTicking();
    }

    // Re-measuring alone doesn't repaint anything — without also replaying
    // the current scroll position through onScroll, a layout change (web
    // fonts loading in and reflowing the tall wrapper, a window resize)
    // would silently leave the storyboard showing whatever frame the
    // stale range last produced, only correcting itself on the next real
    // scroll event.
    function remeasure() {
      measure();
      onScroll(window.scrollY);
    }

    remeasure();

    const ro = new ResizeObserver(remeasure);
    ro.observe(wrapper);
    window.addEventListener("resize", remeasure, { passive: true });
    const unsubscribe = subscribeScrollY(onScroll);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", remeasure);
      unsubscribe();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [wrapperRef, onProgress, disabled, smooth]);
}
