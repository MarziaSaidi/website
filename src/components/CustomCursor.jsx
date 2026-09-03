import { useEffect, useRef } from "react";

// Augments the native pointer with a small ring — never replaces it (no
// cursor: none anywhere). Fine-pointer only; bails entirely on touch. Under
// reduced-motion the ring still appears but snaps to position instantly
// instead of easing, since only its rAF batching (not a CSS transition) is
// what "follows" the pointer here.
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
      // The hero runs its own dedicated pixel-trail effect (HeroTrail.jsx)
      // instead — the ring reads as a mismatched leftover cursor style
      // layered on top of it, so it's suppressed for the whole time the
      // pointer is over #top rather than the two effects competing.
      if (e.target.closest?.("#top")) {
        el.classList.remove("is-active");
        return;
      }

      el.classList.add("is-active");

      // World-aware color: CSS cascade can't reach a fixed-position element
      // outside the hovered subtree, so read the nearest [data-world] in JS
      // and set the cursor's own color directly.
      const worldEl = e.target.closest?.("[data-world]");
      const world = worldEl?.getAttribute("data-world");
      el.style.setProperty(
        "--cursor-color",
        world === "green" ? "var(--color-accent-alt)" : "var(--color-accent)"
      );

      const interactive = e.target.closest?.(
        'a, button, [role="button"], input, textarea, [data-cursor]'
      );
      // "view" targets (project previews) get their own bigger ring with a
      // label riding inside it — a plain link/button just grows, this one
      // becomes a small button of its own, since it's the thing being
      // looked at rather than a generic clickable.
      const cursorValue = e.target.closest?.("[data-cursor]")?.getAttribute("data-cursor");
      el.style.setProperty("--cursor-scale", cursorValue === "view" ? "2.4" : interactive ? "1.7" : "1");
      el.style.setProperty("--cursor-label", cursorValue === "view" ? '"VIEW"' : '""');

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
