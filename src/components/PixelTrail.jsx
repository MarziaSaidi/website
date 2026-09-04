import { useEffect, useRef } from "react";

// Coral trail color, theme-aware — matches --color-trail in index.css.
// Canvas2D's fillStyle needs a literal color string, so this is read live
// off <html data-theme> each frame (same technique as HeroField's
// darkBoost() / FooterSignature's currentDust()) rather than cached once.
const COLOR_LIGHT = "255, 107, 97"; // #FF6B61
const COLOR_DARK = "255, 130, 120"; // #FF8278

function currentTrailColor() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? COLOR_DARK : COLOR_LIGHT;
}
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

// Small pixel-square mouse trail for the whole site — EXCEPT the hero,
// which runs its own falling-icons/MARZIA composition and gets a plain
// native cursor instead (see the `#top` check in onMove below, and
// CustomCursor.jsx's matching exclusion for its ring). Fixed to the
// viewport rather than any one section, mounted once in App.jsx
// alongside CustomCursor so it's present on every route.
// Drawn as flat, unblurred fillRect squares (never arcs — a filled
// circle is the one shape this was explicitly asked not to produce)
// that fade out and disappear on their own short lifetime.
export default function PixelTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      w = window.innerWidth;
      h = window.innerHeight;
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
      // Read once per frame, not per pixel — matches FooterSignature's
      // currentDust() pattern.
      const color = currentTrailColor();
      pixels = pixels.filter((p) => {
        const age = now - p.born;
        if (age >= p.life) return false;
        // Newer pixels near the cursor read as more visible purely
        // because they haven't faded yet — no separate distance-based
        // opacity boost needed on top of the age-based one.
        const alpha = 1 - age / p.life;
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
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
      // The hero runs its own composition and gets a plain cursor — no
      // trail spawns there, matching CustomCursor's own #top exclusion.
      if (e.target.closest?.("#top")) {
        hasLast = false;
        spawnCarry = 0;
        return;
      }
      if (hasLast) spawnAlong(lastX, lastY, e.clientX, e.clientY);
      lastX = e.clientX;
      lastY = e.clientY;
      hasLast = true;
      ensureLoop();
    }

    // Leaving the viewport entirely stops spawning the same way leaving
    // the hero does — hasLast=false means the next pointerenter starts a
    // fresh segment instead of drawing one long spawn line back from
    // wherever the cursor left off. Pixels already in flight keep fading.
    function onLeave() {
      hasLast = false;
      spawnCarry = 0;
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-trail-canvas"
      aria-hidden="true"
    />
  );
}
