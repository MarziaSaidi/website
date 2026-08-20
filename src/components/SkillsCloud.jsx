import { useState } from "react";
import Magnetic from "./ui/Magnetic";
import { skills } from "../data/skills";

// Slight organic vertical offset per chip so the cloud doesn't read as a
// rigid grid. Purely decorative and seeded by index, not randomized per
// mount, so it's stable across renders.
function offsetFor(i) {
  const rad = ((i * 47) % 360) * (Math.PI / 180);
  return Math.sin(rad) * 6;
}

export default function SkillsCloud() {
  const [active, setActive] = useState(null);
  const activeSkill = skills.find((s) => s.name === active);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, i) => (
          <Magnetic key={skill.name} strength={0.3} max={10}>
            <button
              type="button"
              onPointerEnter={() => setActive(skill.name)}
              onPointerLeave={() => setActive((a) => (a === skill.name ? null : a))}
              onFocus={() => setActive(skill.name)}
              onBlur={() => setActive((a) => (a === skill.name ? null : a))}
              style={{ transform: `translateY(${offsetFor(i)}px)`, borderColor: "rgba(244,241,234,0.2)", color: "#f4f1ea" }}
              className="rounded-full border px-4 py-2 text-sm transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {skill.name}
            </button>
          </Magnetic>
        ))}
      </div>
      <p className="min-h-[1.5rem] text-sm" style={{ color: "rgba(244,241,234,0.65)" }} aria-live="polite">
        {activeSkill ? activeSkill.note : "Hover or focus a skill for detail."}
      </p>
    </div>
  );
}
