import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { subscribeScrollY } from "../../hooks/useScrollY";
import { howIWork, workLeadIn, workPhilosophy } from "../../data/howIWork";

// One continuous progress value (0-1) for the whole steps list, derived
// from the list's position in the viewport: 0 when its top reaches the
// vertical center of the screen, 1 when its bottom does. Set imperatively
// as a CSS custom property on the track (same technique as Hero's scroll
// parallax — see useScrollY) so the line-fill and travelling point repaint
// every frame without a React render; `activeIndex` is real state because
// it only changes four times across the whole scroll range.
function useStepProgress(trackRef, count) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      const rect = track.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      const progress = Math.min(1, Math.max(0, (viewportCenter - rect.top) / rect.height));
      track.style.setProperty("--path-progress", progress.toFixed(4));

      const idx = progress <= 0 ? -1 : Math.min(count - 1, Math.floor(progress * count));
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    }

    onScroll();
    return subscribeScrollY(onScroll);
  }, [trackRef, count]);

  return activeIndex;
}

// Pointer-follow glow local to whichever step is under the cursor — the
// same --sx/--sy-driven radial gradient Hero uses for its spotlight, just
// delegated to one listener on the track instead of one per step. Skipped
// for touch pointers and reduced-motion, matching Magnetic/CustomCursor.
function useStepPointerGlow(trackRef) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    function onMove(e) {
      const stepEl = e.target.closest("[data-step]");
      if (!stepEl) return;
      const r = stepEl.getBoundingClientRect();
      stepEl.style.setProperty("--sx", `${e.clientX - r.left}px`);
      stepEl.style.setProperty("--sy", `${e.clientY - r.top}px`);
    }

    track.addEventListener("pointermove", onMove);
    return () => track.removeEventListener("pointermove", onMove);
  }, [trackRef]);
}

// Three-tier emphasis rather than a plain on/off active state: the step
// just ahead of the active one stays legible as a preview of what's next,
// while everything else (already passed, or further out) quiets down
// further. Keeps the whole process readable at a glance instead of
// spotlighting one step and hiding the rest.
const TONE = {
  active: {
    number: "text-accent",
    rule: "bg-accent w-8",
    title: "text-text",
    body: "text-text-secondary",
    marker: "border-accent bg-accent marker-active-glow",
  },
  next: {
    number: "text-text-secondary",
    rule: "bg-border w-5",
    title: "text-text-secondary",
    body: "text-text-secondary/60",
    marker: "border-text-secondary/50 bg-background",
  },
  quiet: {
    number: "text-text-secondary/45",
    rule: "bg-border w-4",
    title: "text-text-secondary/45",
    body: "text-text-secondary/30",
    marker: "border-border bg-background",
  },
};

function toneFor(index, activeIndex) {
  if (index === activeIndex) return TONE.active;
  if (activeIndex === -1) return index === 0 ? TONE.next : TONE.quiet;
  if (index === activeIndex + 1) return TONE.next;
  return TONE.quiet;
}

export default function HowIWork() {
  const ref = useScrollReveal();
  const trackRef = useRef(null);
  const activeIndex = useStepProgress(trackRef, howIWork.length);
  useStepPointerGlow(trackRef);

  return (
    <div ref={ref} className="reveal-group flex flex-col gap-16 md:gap-24">
      <div className="flex flex-col gap-6 md:gap-8 max-w-2xl">
        <p className="text-xs tracking-eyebrow uppercase text-text-secondary">How I work</p>
        <p className="stagger-item text-lg md:text-xl leading-relaxed text-text">{workLeadIn}</p>
      </div>

      {/* The philosophy this section exists to explain — everything the
          journey below lays out is "how," this is "why." */}
      <blockquote className="stagger-item border-l-2 pl-6 md:pl-10 max-w-3xl" style={{ borderColor: "var(--color-accent)" }}>
        <p className="font-serif italic text-3xl md:text-5xl leading-[1.3] text-text">"{workPhilosophy}"</p>
      </blockquote>

      <div ref={trackRef} className="relative" style={{ "--path-progress": 0 }}>
        {/* Rail: a plain track, an accent fill that draws in with scroll
            progress, and a soft point riding at the leading edge of that
            fill — decorative, so screen readers skip straight to the
            <ol>'s own steps for the process itself. */}
        <div className="absolute left-[5px] md:left-[7px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />
        <div
          className="absolute left-[5px] md:left-[7px] top-0 w-px origin-top"
          style={{
            height: "100%",
            transform: "scaleY(var(--path-progress, 0))",
            background: "linear-gradient(to bottom, var(--color-accent), var(--color-accent-secondary))",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute left-[5px] md:left-[7px] path-dot"
          style={{ top: "calc(var(--path-progress, 0) * 100%)" }}
          aria-hidden="true"
        />

        <ol className="relative flex flex-col">
          {howIWork.map((step, i) => {
            const tone = toneFor(i, activeIndex);
            const stepDelay = i * 220;
            return (
              <li
                key={step.title}
                data-step="true"
                className={`group relative pl-8 md:pl-12 py-14 md:py-24 ${i % 2 === 1 ? "md:pl-16 lg:pl-20" : ""}`}
              >
                {/* Cursor-follow glow, this step only */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(280px circle at var(--sx, 50%) var(--sy, 50%), color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 65%)",
                  }}
                />

                {/* Marker on the rail, aligned to this step's number row */}
                <span
                  className={`absolute left-[5px] md:left-[7px] top-[64px] md:top-[104px] -translate-x-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full border transition-all duration-500 group-hover:scale-125 ${tone.marker}`}
                  aria-hidden="true"
                />

                <div className="stagger-item flex items-center gap-3" style={{ transitionDelay: `${stepDelay}ms` }}>
                  <span className={`font-mono text-xs tracking-meta tabular-nums transition-colors duration-500 ${tone.number}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`h-px transition-all duration-500 ${tone.rule}`} aria-hidden="true" />
                </div>

                <h3
                  className={`stagger-item font-serif text-3xl md:text-5xl leading-[1.08] mt-3 md:mt-4 transition-all duration-500 group-hover:translate-x-1 ${tone.title}`}
                  style={{ transitionDelay: `${stepDelay + 90}ms` }}
                >
                  {step.title}
                </h3>

                <p
                  className={`stagger-item mt-4 md:mt-5 max-w-md text-[0.95rem] md:text-base leading-relaxed transition-colors duration-500 ${tone.body}`}
                  style={{ transitionDelay: `${stepDelay + 170}ms` }}
                >
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
