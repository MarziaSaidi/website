import { useEffect, useRef } from "react";

/*
 * A full-bleed coded background for the hero section: a faint field of dots
 * that brightens near the cursor anywhere in the hero, then fades back.
 * Sits behind the hero text (pointer-events: none, so it never blocks
 * clicks) and reacts to pointer movement on the section itself, passed in
 * via `sectionRef`. No illustration asset — built, not drawn.
 * Respects prefers-reduced-motion (renders a static field, no animation).
 */
export default function HeroSignature({ sectionRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spacing = 34;
    const interact = 160;
    const rest = 1;

    let w = 0;
    let h = 0;
    let dots = [];
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    function build() {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(2, Math.round(w / spacing));
      const rows = Math.max(2, Math.round(h / spacing));
      const gapX = w / (cols - 1);
      const gapY = h / (rows - 1);
      dots = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({ x: i * gapX, y: j * gapY, s: 0 });
        }
      }
    }

    function paint(animate) {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        let target = 0;
        if (pointer.active) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          if (dist < interact) target = 1 - dist / interact;
        }
        d.s += animate ? (target - d.s) * 0.1 : target - d.s;
        if (d.s < 0.01) continue;
        const radius = rest + d.s * 2.4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        // Teal warming toward gold as the cursor gets closer.
        const alpha = d.s * 0.5;
        ctx.fillStyle = d.s > 0.5
          ? `rgba(197, 155, 83, ${alpha})`
          : `rgba(14, 86, 101, ${alpha})`;
        ctx.fill();
      }
    }

    function loop() {
      paint(true);
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    build();
    if (!reduce) {
      raf = requestAnimationFrame(loop);
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
    }
    const ro = new ResizeObserver(build);
    ro.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
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
