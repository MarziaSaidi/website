import { useEffect, useRef } from "react";

const PALETTE = [
  "rgba(88, 73, 188, 0.34)",
  "rgba(139, 127, 232, 0.32)",
  "rgba(255, 107, 97, 0.27)",
  "rgba(255, 255, 255, 0.42)",
];

const random = (min, max) => min + Math.random() * (max - min);

function makeParticle() {
  return {
    x: random(-1.16, 1.16),
    y: random(-1.08, 1.08),
    z: random(0.14, 1),
    speed: random(0.00007, 0.00022),
    driftX: random(-0.000012, 0.000012),
    driftY: random(-0.000012, 0.000012),
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    size: random(0.55, 2.15),
    color: PALETTE[(Math.random() * PALETTE.length) | 0],
  };
}

function resetParticle(particle) {
  particle.x = random(-1.16, 1.16);
  particle.y = random(-1.08, 1.08);
  particle.z = 1;
  particle.offsetX = 0;
  particle.offsetY = 0;
  particle.velocityX = 0;
  particle.velocityY = 0;
}

// A Canvas 2D interpretation of Shopify's immersive hero medium. It keeps
// the large DOM typography clean, while the particle depth, pressure wake,
// and passing motion happen in one isolated rendering layer.
export default function HeroLiquidParticleField({ sectionRef, pointerRef, marziaRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = window.innerWidth < 768 ? 7200 : 10000;
    const particles = Array.from({ length: count }, makeParticle);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let lastTime = 0;
    let frame = 0;

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint(time) {
      const delta = lastTime ? Math.min(34, time - lastTime) : 16.7;
      lastTime = time;
      context.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const hasPointer = pointer.active;

      if (hasPointer) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.min(620, width * 0.48));
        glow.addColorStop(0, "rgba(255, 255, 255, 0.075)");
        glow.addColorStop(0.48, "rgba(183, 210, 255, 0.035)");
        glow.addColorStop(1, "rgba(183, 210, 255, 0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      for (const particle of particles) {
        particle.z -= particle.speed * delta;
        particle.x += particle.driftX * delta;
        particle.y += particle.driftY * delta;
        if (particle.z < 0.12 || Math.abs(particle.x) > 1.5 || Math.abs(particle.y) > 1.42) resetParticle(particle);

        const perspective = 0.3 / particle.z;
        let x = width * 0.5 + particle.x * width * perspective + particle.offsetX;
        let y = height * 0.5 + particle.y * height * perspective + particle.offsetY;

        if (hasPointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          // One broad, shared pressure field. Its soft falloff prevents a
          // cursor-sized hole and lets the whole medium stretch together.
          const radius = Math.min(410, Math.max(285, width * 0.27)) + (1 - particle.z) * 48;
          if (distance < radius) {
            const normalizedDistance = distance / radius;
            const force = (1 - normalizedDistance * normalizedDistance) ** 2;
            const radialX = dx / distance;
            const radialY = dy / distance;
            const tangentX = -dy / distance;
            const tangentY = dx / distance;
            const dragX = Math.max(-900, Math.min(900, pointer.vx * 1000));
            const dragY = Math.max(-900, Math.min(900, pointer.vy * 1000));
            const velocity = Math.min(1, pointer.speed * 0.8 + 0.12);
            // Press, then pull the same smooth field in the cursor's travel
            // direction while allowing it to slip sideways around the tip.
            const pressure = (230 + velocity * 210) * force;
            const lateral = (75 + velocity * 110) * force;
            particle.velocityX += (radialX * pressure + tangentX * lateral + dragX * .9 * force) * (delta / 1000);
            particle.velocityY += (radialY * pressure + tangentY * lateral + dragY * .9 * force) * (delta / 1000);
          }
        }

        // Underdamped spring back to each particle's own resting position.
        // This gives the field its delayed wobble and recovery after a drag.
        const seconds = delta / 1000;
        particle.velocityX += (-particle.offsetX * 15.5 - particle.velocityX * 6.1) * seconds;
        particle.velocityY += (-particle.offsetY * 15.5 - particle.velocityY * 6.1) * seconds;
        particle.offsetX += particle.velocityX * seconds;
        particle.offsetY += particle.velocityY * seconds;
        x = width * 0.5 + particle.x * width * perspective + particle.offsetX;
        y = height * 0.5 + particle.y * height * perspective + particle.offsetY;

        if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
        const size = particle.size * (0.52 + (1 - particle.z) * 1.45);
        context.fillStyle = particle.color;
        context.fillRect(x, y, size, size);
      }

      const mark = marziaRef.current;
      if (mark && hasPointer) {
        const markRect = mark.getBoundingClientRect();
        const hostRect = section.getBoundingClientRect();
        const centerX = markRect.left - hostRect.left + markRect.width * 0.5;
        const centerY = markRect.top - hostRect.top + markRect.height * 0.5;
        const dx = centerX - pointer.x;
        const dy = centerY - pointer.y;
        const distance = Math.hypot(dx, dy) || 1;
        const force = Math.max(0, 1 - distance / 145) ** 2;
        mark.style.setProperty("--marzia-ripple-x", `${(dx / distance * force * 3).toFixed(2)}px`);
        mark.style.setProperty("--marzia-ripple-y", `${(dy / distance * force * 3).toFixed(2)}px`);
      } else if (marziaRef.current) {
        marziaRef.current.style.setProperty("--marzia-ripple-x", "0px");
        marziaRef.current.style.setProperty("--marzia-ripple-y", "0px");
      }

      frame = requestAnimationFrame(paint);
    }

    resize();
    if (reduced) {
      for (const particle of particles) {
        const x = width * 0.5 + particle.x * width * (0.3 / particle.z);
        const y = height * 0.5 + particle.y * height * (0.3 / particle.z);
        context.fillStyle = particle.color;
        context.fillRect(x, y, particle.size, particle.size);
      }
    } else {
      frame = requestAnimationFrame(paint);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(section);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [marziaRef, pointerRef, sectionRef]);

  return <canvas ref={canvasRef} className="hero-liquid-particle-field" aria-hidden="true" />;
}
