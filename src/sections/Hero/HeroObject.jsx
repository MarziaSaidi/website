import { useState } from "react";

// A small floating "interface window" beside the hero copy — decorative,
// but built out of real UI vocabulary (a titlebar, hoverable rows that
// expand into a real breakdown of what each word means) rather than a
// generic illustration, so it demonstrates the craft it's describing.
// Purely a sighted-mouse embellishment: aria-hidden, no keyboard path,
// since none of its content is unique (it's covered by Selected Work and
// the About section's skills list).
const ITEMS = [
  { key: "design", label: "DESIGN", detail: ["layout", "motion", "typography", "interaction"] },
  { key: "build", label: "BUILD", detail: ["React", "TypeScript", "APIs"] },
  { key: "ship", label: "SHIP", detail: ["review", "test", "deploy"] },
];

export default function HeroObject() {
  const [active, setActive] = useState(null);

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute right-10 top-1/2 w-72"
      style={{
        transform: "translate3d(calc(var(--mx) * -22px), calc(-50% + var(--my) * -16px), 0)",
        transition: "transform 0.2s ease-out",
      }}
    >
      <div className="rounded-lg border border-border bg-paper shadow-soft-lg overflow-hidden font-mono text-xs">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-background-secondary/60">
          <span className="w-2 h-2 rounded-full bg-accent/70" />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 70%, transparent)" }} />
          <span className="w-2 h-2 rounded-full bg-accent-alt/70" />
          <span className="ml-2 text-text-secondary tracking-widest">MARZIA.UI</span>
        </div>

        <div className="p-4 flex flex-col gap-1">
          {ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <div
                key={item.key}
                onPointerEnter={() => setActive(item.key)}
                onPointerLeave={() => setActive((a) => (a === item.key ? null : a))}
                className="rounded-md px-3 py-2 -mx-1 transition-colors duration-300 hover:bg-background-secondary"
              >
                <div className="flex items-center justify-between text-text tracking-widest">
                  <span>{item.label}</span>
                  <span className="text-text-secondary">{isActive ? "▾" : "▸"}</span>
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isActive ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <ul className="pt-1.5 flex flex-col gap-0.5 text-text-secondary">
                      {item.detail.map((d) => (
                        <li key={d} className="flex items-center gap-1.5">
                          <span className="text-accent">&rarr;</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-text-secondary">
          <span>STATUS</span>
          <span className="text-accent">[ 98% ]</span>
        </div>
      </div>
    </div>
  );
}
