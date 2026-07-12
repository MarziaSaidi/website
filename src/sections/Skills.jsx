import SectionHeading from "../components/ui/SectionHeading";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { skillCategories } from "../data/skills";

function SkillColumn({ category, index }) {
  return (
    <div
      className="stagger-item flex flex-col gap-4 py-8 md:py-0 px-0 md:px-10 first:pt-0 md:first:pl-0 last:pb-0 md:last:pr-0"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <h3 className="font-serif text-xl text-text">{category.title}</h3>
      <ul className="flex flex-col gap-2">
        {category.skills.map((skill) => (
          <li key={skill} className="text-sm text-text-secondary">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Skills() {
  const groupRef = useScrollReveal();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative py-24 md:py-32 bg-background-secondary/40 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center mb-14">
          <img
            src="/illustrations/golden-eagle.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="order-first md:order-last w-48 sm:w-56 md:w-56 lg:w-64 h-auto object-contain opacity-90 self-center mx-auto md:mx-0"
          />
          <SectionHeading
            index="05"
            eyebrow="Core Capabilities"
            title="Technical skillset & toolkit"
          />
        </div>

        <div
          ref={groupRef}
          className="reveal-group grid md:grid-cols-3 divide-y divide-border md:divide-y-0 md:divide-x"
        >
          {skillCategories.map((category, i) => (
            <SkillColumn key={category.title} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
