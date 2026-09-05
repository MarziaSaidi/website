import { useEffect, useRef } from "react";

// Augments the native pointer with a small filled square — never replaces
// it (no cursor: none anywhere). Fine-pointer only; bails entirely on
// touch. A fixed size at all times (no growing on hover/"view" targets —
// that used to happen here, deliberately removed). Under reduced-motion
// it still appears but snaps to position instantly instead of easing,
// since only its rAF batching (not a CSS transition) is what "follows"
// the pointer here. Colored via var(--color-trail) in index.css's
// .custom-cursor rule — the same coral token as PixelTrail.jsx's pixels,
// so the two cursor effects read as one accent instead of each following
// the per-world accent, and both repaint automatically for the theme's
// coral shade (CSS var, not a fixed hex).
export default function CustomCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let pending = null;

    function apply() {
      raf = 0;
      if (!pending) return;
      el.style.setProperty("--cursor-x", `${pending.x}px`);
      el.style.setProperty("--cursor-y", `${pending.y}px`);
    }

    function onMove(e) {
      // The hero runs its own dedicated pixel-trail effect (PixelTrail.jsx)
      // instead — the ring reads as a mismatched leftover cursor style
      // layered on top of it, so it's suppressed for the whole time the
      // pointer is over #top rather than the two effects competing. Same
      // reasoning for the footer's ASCII signature (data-cursor-exempt):
      // it has its own cursor-driven hover-push already.
      if (e.target.closest?.("#top, [data-cursor-exempt]")) {
        el.classList.remove("is-active");
        return;
      }

      el.classList.add("is-active");

      pending = { x: e.clientX, y: e.clientY };
      if (reduce) {
        apply();
      } else if (!raf) {
        raf = requestAnimationFrame(apply);
      }
    }

    function onLeave() {
      el.classList.remove("is-active");
    }

    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="custom-cursor" aria-hidden="true" />;
}
