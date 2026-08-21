import { useScrollReveal } from "../hooks/useScrollReveal";
import { howIWork, workLeadIn, workPhilosophy } from "../data/howIWork";

// Evenly spaced x, alternating high/low y — a wandering route through the
// four steps rather than a flat row. Shared between the node positions
// below and the SVG path that connects them, so the line always meets
// each node exactly. The map stays this same horizontal layout at every
// breakpoint — on narrow viewports it scrolls sideways inside its own
// container rather than collapsing into a stacked list.
const NODE_X = [8, 36, 64, 92];
const NODE_EDGE_PCT = 10; // distance from the container's top (even nodes) or bottom (odd nodes) — close to the edge so each step's paragraph has nearly the full container height to grow into

const ROUTE_PATH = "M8,10 C22,10 22,90 36,90 C50,90 50,10 64,10 C78,10 78,90 92,90";

export default function HowIWork() {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="reveal-group flex flex-col gap-10 md:gap-14">
      <div className="flex flex-col gap-6 md:gap-8 max-w-2xl">
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(244,241,234,0.5)" }}>
          How I work
        </p>
        <p className="text-lg md:text-xl leading-relaxed" style={{ color: "rgba(244,241,234,0.8)" }}>
          {workLeadIn}
        </p>
      </div>

      {/* The philosophy this section exists to explain — everything the
          map lays out below is "how," this is "why." */}
      <blockquote
        className="stagger-item border-l-2 pl-6 md:pl-10 max-w-3xl"
        style={{ borderColor: "var(--color-accent)" }}
      >
        <p className="font-serif italic text-3xl md:text-5xl leading-[1.3]" style={{ color: "#f4f1ea" }}>
          “{workPhilosophy}”
        </p>
      </blockquote>

      <div className="flex flex-col gap-4">
        {/* Swipe hint — only where the map actually overflows and needs
            one; the animated arrow nudges sideways to read as "drag me,"
            not just decoration. */}
        <div
          className="md:hidden inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5"
          style={{ borderColor: "rgba(244,241,234,0.22)", color: "rgba(244,241,234,0.6)" }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="swipe-hint-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h15M13 6l6 6-6 6" />
          </svg>
          <span className="text-[0.65rem] tracking-[0.14em] uppercase">Swipe to explore</span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 pb-2 md:mx-0 md:px-0 md:pb-0 md:overflow-visible">
          <div className="relative h-[460px] md:h-[560px] min-w-[760px] md:min-w-0 md:w-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="var(--color-accent)"
                strokeOpacity="0.4"
                strokeWidth="1.25"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength="1"
                className="route-line"
              />
            </svg>

            {howIWork.map((step, i) => {
              const high = i % 2 === 0;
              return (
                <div
                  key={step.title}
                  className={`stagger-item absolute w-[10rem] md:w-[11rem] flex items-center text-center -translate-x-1/2 ${
                    high ? "flex-col" : "flex-col-reverse"
                  }`}
                  style={{
                    transitionDelay: `${i * 140}ms`,
                    left: `${NODE_X[i]}%`,
                    top: high ? `${NODE_EDGE_PCT}%` : "auto",
                    bottom: high ? "auto" : `${NODE_EDGE_PCT}%`,
                  }}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border shrink-0"
                    style={{
                      borderColor: "rgba(166,121,60,0.6)",
                      backgroundColor: "#101010",
                      boxShadow: "0 0 18px rgba(166,121,60,0.35)",
                      color: "var(--color-accent)",
                    }}
                    aria-hidden="true"
                  >
                    <span className="font-serif text-sm md:text-base tabular-nums">{i + 1}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 md:gap-2.5">
                    <h3 className="font-serif text-lg md:text-2xl" style={{ color: "#f4f1ea" }}>
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-base leading-relaxed" style={{ color: "rgba(244,241,234,0.65)" }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
