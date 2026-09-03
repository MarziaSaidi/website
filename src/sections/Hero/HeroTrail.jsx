import { useEffect, useRef } from "react";

const COLOR = "255, 107, 97"; // #FF6B61 as rgb components, for template-literal rgba()
const SIZES = [2, 3, 3, 3, 4]; // weighted toward 3px, per spec ("approximately 3px to start")
// Distance the pointer must travel before the next pixel spawns — this
// (not a fixed per-mousemove-event spawn) is what makes fast movement
// leave more pixels and slow movement leave fewer: both cover more or
// less ground per unit time, and pixels are rationed by ground covered.
const SPAWN_SPACING = 9;
const LIFETIME_MIN = 260;
const LIFETIME_MAX = 480;

function randomSize() {
  return SIZES[(Math.random() * SIZES.length) | 0];
}

// Small pixel-square trail confined to the hero — spawned along the
// pointer's path inside the section only, drawn as flat, unblurred
// fillRect squares (never arcs — a filled circle is the one shape this
// was explicitly asked not to produce) that fade out and disappear.
// Sibling to HeroField/FallingIcons, not layered on top of either: its
// own canvas, own rAF loop, own listeners, scoped to `sectionRef`.
export default function HeroTrail({ sectionRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch has no hover/move-without-press concept to spawn a trail from,
    // and reduced-motion means no continuous decorative animation — both
    // just skip the whole effect rather than render a degraded version.
    if (!fine || reduce) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let pixels = [];
    let raf = 0;
    let looping = false;
    let lastX = 0;
    let lastY = 0;
    let hasLast = false;
    let spawnCarry = 0;

    function resize() {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // No smoothing on a context that only ever draws axis-aligned integer
      // rects would be a no-op anyway, but it's the explicit signal that
      // these squares are meant to stay hard-edged pixels, never softened.
      ctx.imageSmoothingEnabled = false;
    }

    // Places pixels at fixed intervals along the segment just traveled
    // (not at the two endpoints) — a fast, long segment between two
    // mousemove events still leaves an evenly spaced trail rather than
    // one pixel per event, which is what actually ties pixel COUNT to
    // distance covered instead of to how often the browser fired events.
    function spawnAlong(x0, y0, x1, y1) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      if (dist === 0) return;
      spawnCarry += dist;
      const ux = dx / dist;
      const uy = dy / dist;
      let traveled = 0;
      while (spawnCarry >= SPAWN_SPACING) {
        spawnCarry -= SPAWN_SPACING;
        traveled += SPAWN_SPACING;
        const px = x0 + ux * traveled + (Math.random() - 0.5) * 3;
        const py = y0 + uy * traveled + (Math.random() - 0.5) * 3;
        pixels.push({
          // Rounded at spawn time, not draw time — keeps every pixel
          // aligned to the same device-pixel grid its neighbors use.
          x: Math.round(px),
          y: Math.round(py),
          size: randomSize(),
          born: performance.now(),
          life: LIFETIME_MIN + Math.random() * (LIFETIME_MAX - LIFETIME_MIN),
        });
      }
    }

    function step(now) {
      ctx.clearRect(0, 0, w, h);
      pixels = pixels.filter((p) => {
        const age = now - p.born;
        if (age >= p.life) return false;
        // Newer pixels near the cursor read as more visible purely
        // because they haven't faded yet — no separate distance-based
        // opacity boost needed on top of the age-based one.
        const alpha = 1 - age / p.life;
        ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        return true;
      });
      if (pixels.length > 0) {
        raf = requestAnimationFrame(step);
      } else {
        looping = false;
      }
    }

    function ensureLoop() {
      if (!looping) {
        looping = true;
        raf = requestAnimationFrame(step);
      }
    }

    function onMove(e) {
      const r = section.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (hasLast) spawnAlong(lastX, lastY, x, y);
      lastX = x;
      lastY = y;
      hasLast = true;
      ensureLoop();
    }

    // Stops spawning immediately — hasLast=false means the very next
    // pointerenter starts a fresh segment instead of drawing one long
    // spawn line back from wherever the cursor left off outside the hero.
    // Pixels already in flight keep fading via the still-running rAF loop.
    function onLeave() {
      hasLast = false;
      spawnCarry = 0;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
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
