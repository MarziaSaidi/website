import { useEffect, useRef } from "react";

/*
 * Wraps a single child and nudges it toward the cursor within a radius,
 * springing back on leave. Skipped for touch pointers (no hover to chase)
 * and reduced-motion users.
 */
export default function Magnetic({ children, strength = 0.35, max = 14 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const x = Math.max(-max, Math.min(max, dx * strength));
      const y = Math.max(-max, Math.min(max, dy * strength));
      el.style.transform = `translate(${x}px, ${y}px)`;
    }

    function onLeave() {
      el.style.transform = "translate(0, 0)";
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, max]);

  return (
    <div ref={ref} className="magnetic inline-flex">
      {children}
    </div>
  );
}
