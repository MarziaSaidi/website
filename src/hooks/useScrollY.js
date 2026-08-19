import { useEffect, useSyncExternalStore } from "react";

// One shared, rAF-throttled `scroll` listener for the whole app, instead of
// each component (nav, scroll-progress bar, hero) registering its own.
// Two ways to consume it:
//  - subscribeScrollY(cb): raw callback, no React re-render — for consumers
//    that mutate the DOM directly for performance (the hero's parallax).
//  - useScrollY(): React-state version for consumers that are fine
//    re-rendering on scroll (already throttled to once per frame).
const listeners = new Set();
let currentY = typeof window !== "undefined" ? window.scrollY : 0;
let rafId = 0;
let attached = false;

function tick() {
  rafId = 0;
  currentY = window.scrollY;
  listeners.forEach((l) => l(currentY));
}

function handleScroll() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return;
  window.addEventListener("scroll", handleScroll, { passive: true });
  attached = true;
}

export function subscribeScrollY(callback) {
  ensureAttached();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useScrollY() {
  useEffect(ensureAttached, []);
  return useSyncExternalStore(
    (cb) => {
      const wrapped = () => cb();
      listeners.add(wrapped);
      return () => listeners.delete(wrapped);
    },
    () => currentY,
    () => 0
  );
}
