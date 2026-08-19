import { useEffect, useRef } from "react";

const TEXT = "Marzia Saidi";
// A darker gold scoped to this signature only — not the shared
// --color-gold token used elsewhere on the site (project labels, etc.).
const FOOTER_GOLD = "#b8912e";
const DUST = "184, 145, 46"; // FOOTER_GOLD, as an rgba() component string

// Roughly the sequence described: dust gathers in the space around the
// letters, drifts inward, fades as it blends into the glyphs, and the
// gold color follows just behind it rather than snapping on with the
// cursor. Reversing is deliberately slower and softer — an afterglow,
// not a light switch.
const HOVER_IN_MS = 850;
const HOVER_OUT_MS = 1250;
const MAX_PARTICLES = 280;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Renders the wordmark to an offscreen canvas at its real on-screen size
// (replicating the SVG's textLength stretch by scaling horizontally after
// measuring) and samples non-transparent pixels into a point cloud —
// so particles can converge on the actual glyph shapes, not a guess.
function sampleGlyphPoints(width, height) {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(width));
  off.height = Math.max(1, Math.round(height));
  const ctx = off.getContext("2d");

  const fontSize = height * 0.62;
  ctx.font = `600 ${fontSize}px "Space Grotesk", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const naturalWidth = ctx.measureText(TEXT).width || 1;
  const desiredWidth = width * 0.94;
  const scaleX = desiredWidth / naturalWidth;

  ctx.save();
  ctx.translate((width - desiredWidth) / 2, height * 0.54);
  ctx.scale(scaleX, 1);
  ctx.fillStyle = "#fff";
  ctx.fillText(TEXT, 0, 0);
  ctx.restore();

  const { data } = ctx.getImageData(0, 0, off.width, off.height);
  const points = [];
  const step = 3;
  for (let y = 0; y < off.height; y += step) {
    for (let x = 0; x < off.width; x += step) {
      if (data[(y * off.width + x) * 4 + 3] > 128) points.push({ x, y });
    }
  }
  return points;
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export default function FooterSignature() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const outlineTextRef = useRef(null);
  const goldTextRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Reduced motion: a quiet color crossfade, no particles, no motion.
    if (reduce) {
      const outline = outlineTextRef.current;
      const gold = goldTextRef.current;
      outline.style.transition = "opacity 0.3s ease";
      gold.style.transition = "opacity 0.3s ease";
      const onEnter = () => {
        outline.style.opacity = "0";
        gold.style.opacity = "1";
      };
      const onLeave = () => {
        outline.style.opacity = "1";
        gold.style.opacity = "0";
      };
      wrap.addEventListener("pointerenter", onEnter);
      wrap.addEventListener("pointerleave", onLeave);
      return () => {
        wrap.removeEventListener("pointerenter", onEnter);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    }

    // Touch/coarse pointers: no hover concept — leave it static, still a
    // working link with its default (outline) appearance.
    if (coarse) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let glyphPoints = [];
    let particles = [];
    let hovering = false;
    let colorProgress = 0; // 0 = dark/outline, 1 = full gold
    let raf = 0;
    let spawnAccumulator = 0;
    let pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      glyphPoints = sampleGlyphPoints(width, height);
    }

    // A point in the "halo" around the letters — not the cursor, not the
    // glyphs themselves, the quiet space the dust drifts in from.
    function haloPoint() {
      const gp = glyphPoints[(Math.random() * glyphPoints.length) | 0] || { x: width / 2, y: height / 2 };
      const angle = Math.random() * Math.PI * 2;
      const dist = randRange(10, 34);
      return {
        x: gp.x + Math.cos(angle) * dist,
        y: gp.y + Math.sin(angle) * dist * 0.6,
      };
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
      if (particles.length >= MAX_PARTICLES || glyphPoints.length === 0) return;
      const target = glyphPoints[(Math.random() * glyphPoints.length) | 0];
      const start = haloPoint();
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
        size: randRange(0.35, 1.4),
        peak: randRange(0.15, 0.7),
        vanishAt: vanishEarly ? randRange(0.35, 0.8) : 1,
      });
    }

    function spawnOutbound() {
      if (particles.length >= MAX_PARTICLES || glyphPoints.length === 0) return;
      const origin = glyphPoints[(Math.random() * glyphPoints.length) | 0];
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
        size: randRange(0.35, 1.4),
        peak: randRange(0.12, 0.55),
        vanishAt: 1,
      });
    }

    function step(dt) {
      // Color eases toward its target; the "in" direction is a touch
      // quicker than "out" so the gold visibly trails the dust on the way
      // in, and lingers as an afterglow on the way out.
      const target = hovering ? 1 : 0;
      const rate = hovering ? dt / HOVER_IN_MS : dt / HOVER_OUT_MS;
      colorProgress += (target - colorProgress) * Math.min(1, rate * 2.2);
      if (Math.abs(target - colorProgress) < 0.001) colorProgress = target;

      const eased = easeInOutSine(colorProgress);
      outlineTextRef.current.style.opacity = String(1 - eased);
      goldTextRef.current.style.opacity = String(eased);

      // Ambient trickle while hovering — a dense field, like grains
      // stirred up and never quite settling while the current runs.
      if (hovering) {
        spawnAccumulator += dt;
        const interval = 20;
        while (spawnAccumulator > interval) {
          spawnAccumulator -= interval;
          spawnInbound();
          if (Math.random() < 0.5) spawnInbound();
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

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
          ctx.fillStyle = `rgba(${DUST}, ${alpha})`;
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
      const settled = Math.abs((hovering ? 1 : 0) - colorProgress) < 0.001 && particles.length === 0;
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
      const r = wrap.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      for (let i = 0; i < 60; i++) spawnInbound();
      ensureLoop();
    }
    function onMove(e) {
      const r = wrap.getBoundingClientRect();
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
      const count = 45 + ((Math.random() * 20) | 0);
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
    ro.observe(wrap);

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("focus", onFocus);
    wrap.addEventListener("blur", onBlur);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("focus", onFocus);
      wrap.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <a
      ref={wrapRef}
      href="#top"
      aria-label="Back to top"
      className="relative block w-full pb-6 md:pb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-md"
    >
      <svg viewBox="0 0 1000 200" className="relative z-0 w-full h-auto block" role="presentation" aria-hidden="true">
        <text
          ref={outlineTextRef}
          x="500"
          y="52%"
          textAnchor="middle"
          dominantBaseline="central"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          fontSize="170"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeOpacity="0.55"
          strokeWidth="1.25"
          className="font-display font-semibold"
        >
          {TEXT}
        </text>
        <text
          ref={goldTextRef}
          x="500"
          y="52%"
          textAnchor="middle"
          dominantBaseline="central"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          fontSize="170"
          fill={FOOTER_GOLD}
          className="font-display font-semibold"
          style={{ opacity: 0 }}
        >
          {TEXT}
        </text>
      </svg>
      <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" aria-hidden="true" />
    </a>
  );
}
