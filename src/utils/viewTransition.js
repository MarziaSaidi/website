// Navigates to a new hash inside a native View Transition, so the clicked
// project's title (tagged with a matching `viewTransitionName` on both
// sides) morphs into the case-study hero instead of hard-cutting. Falls
// back to a plain hash change when the API isn't supported or the user
// prefers reduced motion — no library, no fallback polyfill.
let activeTransition = null;

export function navigateWithTransition(hash) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !document.startViewTransition || activeTransition) {
    // Reduced motion, unsupported browser, or a transition already in
    // flight (e.g. a fast double-click) — just land the hash change
    // instantly rather than racing a second transition against the first,
    // which the API rejects with an InvalidStateError.
    window.location.hash = hash;
    return;
  }

  activeTransition = document.startViewTransition(() => {
    window.location.hash = hash;
    // The hashchange listener updates React state asynchronously; give it
    // two frames to flush and paint before the API captures the "after"
    // snapshot. A fixed short wait, not a polling loop — this is a
    // portfolio nicety, not something that needs to be bulletproof.
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  });

  // startViewTransition() returns several promises (ready,
  // updateCallbackDone, finished); an aborted transition can reject more
  // than one of them, and an unhandled rejection on any of them surfaces
  // as an uncaught console error even though navigation itself already
  // succeeded. Swallow all three — this is cosmetic motion, not
  // functionality, so a failed transition should never be user-visible.
  activeTransition.ready.catch(() => {});
  activeTransition.updateCallbackDone.catch(() => {});
  activeTransition.finished
    .catch(() => {})
    .finally(() => {
      activeTransition = null;
    });
}
