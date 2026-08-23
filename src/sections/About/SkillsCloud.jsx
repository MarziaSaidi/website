import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { skillGroups } from "../../data/skills";

const DEFAULT_SKILL = "React";

// A single skill is "active" globally (not per-group) and its explanation
// lives in one fixed panel below all three groups — never inline, never
// reflowing the groups beneath it — so switching skills is a pure repaint,
// not a layout shift. A small arrow slides along the top of that panel to
// whichever chip is active, by hand-measuring its position (the same
// technique HowIWork's scroll rail uses): no shared-layout animation
// library needed for one sliding indicator.
export default function SkillsCloud() {
  const ref = useScrollReveal();
  const panelRef = useRef(null);
  const caretRef = useRef(null);
  const chipRefs = useRef(new Map());
  const [activeName, setActiveName] = useState(DEFAULT_SKILL);

  const active =
    skillGroups.flatMap((g) => g.skills.map((s) => ({ ...s, group: g.label }))).find((s) => s.name === activeName) ??
    null;

  useEffect(() => {
    function positionCaret() {
      const panel = panelRef.current;
      const caret = caretRef.current;
      const chip = chipRefs.current.get(activeName);
      if (!panel || !caret || !chip) return;
      const panelRect = panel.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      caret.style.left = `${chipRect.left + chipRect.width / 2 - panelRect.left}px`;
    }

    positionCaret();
    window.addEventListener("resize", positionCaret);
    return () => window.removeEventListener("resize", positionCaret);
  }, [activeName]);

  return (
    <div ref={ref} className="reveal-group flex flex-col gap-10 md:gap-12">
      <div className="flex flex-col gap-8 md:gap-9">
        {skillGroups.map((group, gi) => (
          <div
            key={group.id}
            className="stagger-item flex flex-col gap-3.5 md:flex-row md:items-baseline md:gap-8"
            style={{ transitionDelay: `${gi * 130}ms` }}
          >
            <div className="flex items-center gap-2.5 shrink-0 md:w-24">
              <span className="block h-px w-4 bg-border" aria-hidden="true" />
              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-secondary/70">
                {group.label}
              </p>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label={`${group.label} skills`}>
              {group.skills.map((skill) => {
                const isActive = skill.name === activeName;
                return (
                  <button
                    key={skill.name}
                    ref={(el) => {
                      if (el) chipRefs.current.set(skill.name, el);
                    }}
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveName(skill.name)}
                    onFocus={() => setActiveName(skill.name)}
                    onClick={() => setActiveName(skill.name)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze ${
                      isActive
                        ? "border-accent text-text bg-accent/[0.07] -translate-y-0.5"
                        : "border-border/70 text-text-secondary/55 hover:text-text-secondary hover:border-text-secondary/40"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="stagger-item relative" style={{ transitionDelay: "420ms" }}>
        <span
          ref={caretRef}
          aria-hidden="true"
          className="absolute -top-[7px] w-3 h-3 -translate-x-1/2 rotate-45 border-t border-l border-accent/50 bg-background transition-[left] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: 0 }}
        />
        <div ref={panelRef} className="border-t border-accent/30 pt-6 min-h-[100px] md:min-h-[78px]" aria-live="polite">
          {active && (
            <div key={active.name} className="skill-detail-enter flex flex-col gap-1.5 max-w-lg">
              <p className="font-serif text-xl md:text-2xl text-text">{active.name}</p>
              <p className="text-sm md:text-[0.95rem] leading-relaxed text-text-secondary">{active.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
