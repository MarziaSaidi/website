import { useEffect, useRef } from "react";

// Canvas particles' fillStyle needs a literal color string (Canvas2D can't
// consume a CSS var), so DUST is read live from the current theme (same
// technique as HeroField's darkBoost()) — light and dark need different
// lightness values to read as a solid dust color: the light-mode
// accent-secondary is a lavender that reads clearly on white, the
// dark-mode accent is a lighter lavender that reads clearly on
// near-black, and no single hex does both.
const DUST_LIGHT = "139, 127, 232"; // light --color-accent-secondary (#8B7FE8), as rgb components
const DUST_DARK = "175, 167, 255"; // dark --color-accent (#AFA7FF), as rgb components

function currentDust() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? DUST_DARK : DUST_LIGHT;
}

// The particle field spans the whole footer, and reads as sparse/uniform
// at low counts with a narrow size range — pushed up for a denser,
// more "conjured dust" field with real size variety (a few bright,
// bigger embers among a lot of fine motes, not a flat grain size).
const MAX_PARTICLES = 900;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// A uniform point cloud filling a soft circle — the "bubble" the dust
// converges into. Same role the old letterform sampling played (a set of
// {x,y} targets in the wordmark's box for particles to aim at), just a
// plain round shape instead of glyph pixels, so the cloud doesn't spell
// anything out.
function sampleBubblePoints(width, height) {
  const cx = width / 2;
  const cy = height / 2;
  // Sized off height only (and capped so it never outgrows a narrow
  // width) so the circle stays comfortably inside the wordmark link's
  // own box instead of bleeding into the copyright line above it.
  const radius = Math.min(width * 0.5, height * 0.42);
  const points = [];
  const count = 2200;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // sqrt(random) keeps the cloud uniformly dense rather than bunched
    // at the center — a plain `Math.random() * radius` radius biases
    // points toward the middle since area grows with r².
    const r = radius * Math.sqrt(Math.random());
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

// Right-skewed: mostly fine dust, occasional larger glowing ember — a
// flat random range reads as uniform grain, this reads as conjured.
function randSize() {
  return 0.4 + Math.pow(Math.random(), 2.3) * 3.6;
}

export default function FooterSignature() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // Hovering anywhere in the footer triggers the effect now, not just
    // the small wordmark link — found once, DOM structure is static.
    // Falls back to the immediate parent if footer isn't found.
    const footer = wrap.closest("footer") || wrap.parentElement;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Reduced motion: this effect is pure decorative motion with nothing
    // else to fall back to (no text to crossfade a color on anymore), so
    // it's skipped entirely, matching FallingIcons/PixelTrail's own
    // reduced-motion convention of bailing rather than showing a
    // stripped-down version.
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let bubblePoints = [];
    let particles = [];
    let hovering = false;
    let raf = 0;
    let spawnAccumulator = 0;
    let pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      const footerRect = footer.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      width = footerRect.width;
      height = footerRect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The bubble is still sampled within the wordmark link's own box
      // (same calibration as before), then shifted into footer-local
      // coordinates so particles anywhere in the footer can target it.
      const offsetX = wrapRect.left - footerRect.left;
      const offsetY = wrapRect.top - footerRect.top;
      bubblePoints = sampleBubblePoints(wrapRect.width, wrapRect.height).map((p) => ({
        x: p.x + offsetX,
        y: p.y + offsetY,
      }));
    }

    // A point anywhere in the footer — used as a fallback origin when
    // there's no real cursor position to anchor to (keyboard focus).
    function haloPoint() {
      return { x: randRange(0, width), y: randRange(0, height) };
    }

    // True only for a genuine on-canvas pointer position, not the fake
    // off-screen coordinates onFocus feeds in for keyboard users.
    function pointerOnCanvas() {
      return pointer.active && pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
    }

    // A jittered point around the actual cursor — dust should gather
    // wherever the pointer currently is, not anywhere in the footer, so
    // it visibly follows the cursor as it moves before streaming into
    // the bubble.
    function cursorPoint() {
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(0, 60);
      return {
        x: pointer.x + Math.cos(angle) * dist,
        y: pointer.y + Math.sin(angle) * dist,
      };
    }

    function spawnOrigin() {
      return pointerOnCanvas() ? cursorPoint() : haloPoint();
    }

    // Perpendicular unit vector to a path, so a particle can sway across
    // its own line of travel — the difference between "sliding on a rail"
    // and "carried by a current."
    function perp(fromX, fromY, toX, toY) {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const d = Math.hypot(dx, dy) || 1;
      return { nx: -dy / d, ny: dx / d };
    }

    function spawnInbound() {
      if (particles.length >= MAX_PARTICLES || bubblePoints.length === 0) return;
      const target = bubblePoints[(Math.random() * bubblePoints.length) | 0];
      const start = spawnOrigin();
      const vanishEarly = Math.random() < 0.3;
      const { nx, ny } = perp(start.x, start.y, target.x, target.y);
      particles.push({
        mode: "in",
        x: start.x,
        y: start.y,
        sx: start.x,
        sy: start.y,
        tx: target.x,
        ty: target.y,
        nx,
        ny,
        wobbleAmp: randRange(2, 9),
        wobbleFreq: randRange(1.2, 3.2),
        wobblePhase: Math.random() * Math.PI * 2,
        t: 0,
        duration: randRange(1000, 2300),
        size: randSize(),
        peak: randRange(0.18, 0.85),
        vanishAt: vanishEarly ? randRange(0.35, 0.8) : 1,
      });
    }

    function spawnOutbound() {
      if (particles.length >= MAX_PARTICLES || bubblePoints.length === 0) return;
      const origin = bubblePoints[(Math.random() * bubblePoints.length) | 0];
      const end = haloPoint();
      const { nx, ny } = perp(origin.x, origin.y, end.x, end.y);
      particles.push({
        mode: "out",
        x: origin.x,
        y: origin.y,
        sx: origin.x,
        sy: origin.y,
        tx: end.x,
        ty: end.y,
        nx,
        ny,
        wobbleAmp: randRange(2, 9),
        wobbleFreq: randRange(1.2, 3.2),
        wobblePhase: Math.random() * Math.PI * 2,
        t: 0,
        duration: randRange(1300, 2600),
        size: randSize(),
        peak: randRange(0.14, 0.65),
        vanishAt: 1,
      });
    }

    function step(dt) {
      // Ambient trickle while hovering — a dense field, like grains
      // stirred up and never quite settling while the current runs.
      if (hovering) {
        spawnAccumulator += dt;
        const interval = 16;
        while (spawnAccumulator > interval) {
          spawnAccumulator -= interval;
          spawnInbound();
          spawnInbound();
          if (Math.random() < 0.7) spawnInbound();
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // Read once per frame, not per particle — cheap either way, but no
      // reason to read it hundreds of times when it can't change mid-frame.
      const dust = currentDust();

      particles = particles.filter((p) => {
        p.t += dt / p.duration;
        if (p.t >= p.vanishAt) return false;

        const progress = p.mode === "in" ? easeOutCubic(Math.min(1, p.t)) : p.t;
        const baseX = p.sx + (p.tx - p.sx) * progress;
        const baseY = p.sy + (p.ty - p.sy) * progress;

        // A grain doesn't slide in on rails — it sways across its own
        // path as if nudged by a current, settling down as it arrives
        // (inbound) or swaying wider as it scatters away (outbound).
        const wobbleEnvelope = p.mode === "in" ? 1 - progress * 0.7 : 0.3 + progress * 0.9;
        const wobble = Math.sin(progress * Math.PI * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp * wobbleEnvelope;
        p.x = baseX + p.nx * wobble;
        p.y = baseY + p.ny * wobble;

        // Gentle cursor influence: nearby particles brighten slightly —
        // they don't change course, they just catch a bit more light.
        let boost = 0;
        if (pointer.active) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d < 55) boost = (1 - d / 55) * 0.25;
        }

        const lifeShape = p.mode === "in"
          ? Math.sin(Math.min(1, p.t / p.vanishAt) * Math.PI)
          : 1 - p.t;
        const alpha = Math.max(0, p.peak * lifeShape + boost) * 0.9;

        if (alpha > 0.015) {
          ctx.fillStyle = `rgba(${dust}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        return true;
      });
    }

    let last = performance.now();
    let idle = true;
    function loop(now) {
      const dt = Math.min(48, now - last);
      last = now;
      step(dt);
      const settled = !hovering && particles.length === 0;
      if (!settled) {
        raf = requestAnimationFrame(loop);
      } else {
        idle = true;
      }
    }
    function ensureLoop() {
      if (idle) {
        idle = false;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    }

    function onEnter(e) {
      hovering = true;
      pointer.active = true;
      const r = footer.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      for (let i = 0; i < 160; i++) spawnInbound();
      ensureLoop();
    }
    function onMove(e) {
      const r = footer.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }
    function onLeave() {
      hovering = false;
      pointer.active = false;
      // Any particles still mid-flight toward a target reverse into
      // outbound drift instead of snapping away.
      particles.forEach((p) => {
        if (p.mode === "in") {
          p.mode = "out";
          p.sx = p.x;
          p.sy = p.y;
          const halo = haloPoint();
          p.tx = halo.x;
          p.ty = halo.y;
          p.t = 0;
          p.duration = randRange(900, 1600);
        }
      });
      const count = 130 + ((Math.random() * 50) | 0);
      for (let i = 0; i < count; i++) spawnOutbound();
      ensureLoop();
    }
    function onFocus() {
      onEnter({ clientX: -9999, clientY: -9999 });
    }
    function onBlur() {
      onLeave();
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(footer);

    // Coarse (touch) pointers have no hover concept, so there's nothing
    // to move the cursor and trigger it — instead the bubble streams in
    // once, automatically, the moment the footer scrolls into view, and
    // simply keeps trickling rather than reversing back out.
    let io = null;
    if (coarse) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            hovering = true;
            for (let i = 0; i < 160; i++) spawnInbound();
            ensureLoop();
            io.disconnect();
          }
        },
        { threshold: 0.5 }
      );
      io.observe(footer);
    } else {
      // Hover trigger is the whole footer (dust should react anywhere in
      // it); focus/blur stay on the wordmark link itself since that's the
      // only focusable element in here — a keyboard user tabs to the link,
      // not the footer as a whole.
      footer.addEventListener("pointerenter", onEnter);
      footer.addEventListener("pointermove", onMove);
      footer.addEventListener("pointerleave", onLeave);
      wrap.addEventListener("focus", onFocus);
      wrap.addEventListener("blur", onBlur);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (io) io.disconnect();
      footer.removeEventListener("pointerenter", onEnter);
      footer.removeEventListener("pointermove", onMove);
      footer.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("focus", onFocus);
      wrap.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <>
      {/* No visible wordmark — this is now a plain, unlabeled-on-screen
          hit area anchored to the footer's bottom edge (the footer above
          centers its own text content independently of this), sized to
          give the particle bubble a comfortable band to converge in.
          aria-label carries the same "back to home" meaning a sighted
          user would otherwise read off a visible logo/wordmark. */}
      <a
        ref={wrapRef}
        href="#/"
        aria-label="Back to home"
        className="absolute inset-x-0 bottom-0 z-0 h-40 md:h-56 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-md"
      />
      {/* Covers the whole footer (not just the link above) — sized and
          positioned against the <footer> ancestor by the effect above,
          since the footer itself is the nearest positioned parent. */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true" />
    </>
  );
}
