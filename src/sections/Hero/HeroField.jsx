import { useEffect, useRef } from "react";

// Both drawn from the site's four-color foundation: a warm taupe glow and
// a cooler olive-gray counterpart, rather than an unrelated amber/violet
// pairing — see src/index.css's --color-accent / --color-gold for the
// same hues used as solid UI color.
const GLOW = "124, 109, 80";
const GLOW_OLIVE = "122, 122, 82";

/*
 * Full-bleed hero backdrop: ambient aurora — a few large, softly blurred
 * blobs drifting on slow independent sine paths. Runs continuously, with
 * no user input, so the hero never sits fully still.
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

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;

    const blobs = [
      { rx: 0.28, ry: 0.32, r: 0.42, color: GLOW, period: 22, phase: 0 },
      { rx: 0.72, ry: 0.28, r: 0.36, color: GLOW_OLIVE, period: 27, phase: 2.1 },
      { rx: 0.5, ry: 0.75, r: 0.4, color: GLOW_OLIVE, period: 31, phase: 4.4 },
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
    }

    // The alpha stops below are tuned for the light theme's cream backdrop.
    // Read live (cheap DOM attribute read, once per frame) rather than
    // cached at mount, since the nav's theme toggle can flip this mid-
    // session — a "lighter" blend needs real presence to read against a
    // near-black backdrop, so dark mode gets a multiplier instead of a
    // separate hardcoded set of stops.
    function darkBoost() {
      return document.documentElement.getAttribute("data-theme") === "dark" ? 2.4 : 1;
    }

    function paintAurora(time) {
      // No canvas blur filter here on purpose: `ctx.filter = "blur(Npx)"`
      // re-blurs the full canvas every frame and is expensive enough to
      // stall the render thread on a continuous rAF loop. A radial
      // gradient with several soft-falloff stops reads as blurred without
      // the per-frame cost.
      const boost = darkBoost();
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const angle = (time / (b.period * 1000)) * Math.PI * 2 + b.phase;
        const cx = w * b.rx + Math.cos(angle) * w * 0.12;
        const cy = h * b.ry + Math.sin(angle * 0.8) * h * 0.14;
        const radius = Math.max(w, h) * b.r;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${b.color}, ${0.05 * boost})`);
        grad.addColorStop(0.4, `rgba(${b.color}, ${0.03 * boost})`);
        grad.addColorStop(0.75, `rgba(${b.color}, ${0.01 * boost})`);
        grad.addColorStop(1, `rgba(${b.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function paint(time) {
      ctx.clearRect(0, 0, w, h);
      paintAurora(time);
    }

    function loop(time) {
      t = time;
      paint(t);
      raf = requestAnimationFrame(loop);
    }

    build();
    if (!reduce) {
      raf = requestAnimationFrame(loop);
    } else {
      paint(0);
    }
    const ro = new ResizeObserver(() => {
      build();
      if (reduce) paint(0);
    });
    ro.observe(section);

    return () => {
      cancelAnimationFrame(raf);
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
