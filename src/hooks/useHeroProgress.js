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
export function useHeroScrollProgress(wrapperRef, onProgress, { disabled = false } = {}) {
  const measureRef = useRef({ top: 0, range: 1 });

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

    function onScroll(y) {
      const { top, range } = measureRef.current;
      onProgress(Math.min(1, Math.max(0, (y - top) / range)));
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
    };
  }, [wrapperRef, onProgress, disabled]);
}
