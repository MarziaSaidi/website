import { useScrollReveal } from "../hooks/useScrollReveal";
import { howIWork } from "../data/howIWork";

// Evenly spaced x, alternating high/low y — a wandering route through the
// four steps rather than a flat row, so it reads as a map rather than a
// numbered list. Shared between the node positions below and the SVG path
// that connects them, so the line always meets each node exactly.
const NODE_X = [10, 36.67, 63.33, 90];
const NODE_EDGE_PCT = 18; // distance from the container's top (even nodes) or bottom (odd nodes)

const ROUTE_PATH =
  "M10,18 C23.33,18 23.33,82 36.67,82 C50,82 50,18 63.33,18 C76.67,18 76.67,82 90,82";

export default function HowIWorkMap() {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className="reveal-group flex flex-col gap-8">
      <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(244,241,234,0.5)" }}>
        How I work
      </p>

      <div className="relative flex flex-col gap-8 md:block md:h-[400px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="hidden md:block absolute inset-0 w-full h-full"
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
              className={`stagger-item flex flex-row items-start gap-4 md:absolute md:w-[13rem] md:items-center md:text-center md:-translate-x-1/2 ${
                high ? "md:flex-col" : "md:flex-col-reverse"
              }`}
              style={{
                transitionDelay: `${i * 140}ms`,
                left: `${NODE_X[i]}%`,
                top: high ? `${NODE_EDGE_PCT}%` : "auto",
                bottom: high ? "auto" : `${NODE_EDGE_PCT}%`,
              }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full border shrink-0"
                style={{
                  borderColor: "rgba(166,121,60,0.6)",
                  backgroundColor: "#101010",
                  boxShadow: "0 0 18px rgba(166,121,60,0.35)",
                  color: "var(--color-accent)",
                }}
                aria-hidden="true"
              >
                <span className="font-serif text-sm tabular-nums">{i + 1}</span>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2">
                <h3 className="font-serif text-lg md:text-xl" style={{ color: "#f4f1ea" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(244,241,234,0.65)" }}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
