import { useEffect, useRef } from "react";

const GLOW = "166, 121, 60";
const GLOW_VIOLET = "75, 107, 78";

/*
 * Full-bleed hero backdrop: two layers on one canvas.
 *  1. Ambient aurora — a few large, softly blurred blobs drifting on slow
 *     independent sine paths. Runs continuously, with no user input, so the
 *     hero never sits fully still.
 *  2. Reactive dot grid — a faint field that brightens near the cursor,
 *     carried over from the previous version and re-themed for the dark
 *     palette.
 * Sits behind hero text (pointer-events: none) and respects
 * prefers-reduced-motion by drawing one static frame instead of looping.
 */
export default function HeroField({ sectionRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const spacing = 36;
    const interact = 170;
    const rest = 1;

    let w = 0;
    let h = 0;
    let dots = [];
    let raf = 0;
    let t = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const blobs = [
      { rx: 0.28, ry: 0.32, r: 0.42, color: GLOW, period: 22, phase: 0 },
      { rx: 0.72, ry: 0.28, r: 0.36, color: GLOW_VIOLET, period: 27, phase: 2.1 },
      { rx: 0.5, ry: 0.75, r: 0.4, color: GLOW_VIOLET, period: 31, phase: 4.4 },
    ];

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

    function paintAurora(time) {
      // No canvas blur filter here on purpose: `ctx.filter = "blur(Npx)"`
      // re-blurs the full canvas every frame and is expensive enough to
      // stall the render thread on a continuous rAF loop. A radial
      // gradient with several soft-falloff stops reads as blurred without
      // the per-frame cost.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const angle = (time / (b.period * 1000)) * Math.PI * 2 + b.phase;
        const cx = w * b.rx + Math.cos(angle) * w * 0.12;
        const cy = h * b.ry + Math.sin(angle * 0.8) * h * 0.14;
        const radius = Math.max(w, h) * b.r;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${b.color}, 0.05)`);
        grad.addColorStop(0.4, `rgba(${b.color}, 0.03)`);
        grad.addColorStop(0.75, `rgba(${b.color}, 0.01)`);
        grad.addColorStop(1, `rgba(${b.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function paintDots(animate) {
      for (const d of dots) {
        let target = 0;
        if (pointer.active) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          if (dist < interact) target = 1 - dist / interact;
        }
        d.s += animate ? (target - d.s) * 0.1 : target - d.s;
        if (d.s < 0.01) continue;
        const radius = rest + d.s * 2.2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        const alpha = 0.1 + d.s * 0.4;
        ctx.fillStyle = d.s > 0.5
          ? `rgba(${GLOW_VIOLET}, ${alpha})`
          : `rgba(${GLOW}, ${alpha})`;
        ctx.fill();
      }
    }

    function paint(time, animate) {
      ctx.clearRect(0, 0, w, h);
      paintAurora(time);
      paintDots(animate);
    }

    function loop(time) {
      t = time;
      paint(t, true);
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
    } else {
      paint(0, false);
    }
    const ro = new ResizeObserver(() => {
      build();
      if (reduce) paint(0, false);
    });
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
