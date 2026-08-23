import { useScrollReveal } from "../../hooks/useScrollReveal";
import SkillsCloud from "./SkillsCloud";
import HowIWork from "./HowIWork";
import { education } from "../../data/experience";

export default function About() {
  const headingRef = useScrollReveal();
  const bodyRef = useScrollReveal();

  return (
    <section id="about" aria-labelledby="about-heading" className="py-28 md:py-44">
      <div className="max-w-4xl mx-auto px-6 md:px-10 flex flex-col gap-24 md:gap-36">
        <div ref={headingRef} className="reveal flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm tabular-nums text-text-secondary" aria-hidden="true">
              03
            </span>
            <span className="block h-px w-6 bg-accent divider-draw" aria-hidden="true" />
            <p className="text-xs tracking-[0.25em] uppercase text-text-secondary">
              So — who builds all this?
            </p>
          </div>

          <h2
            id="about-heading"
            className="glow-text font-serif text-5xl md:text-7xl leading-[1.05] text-text"
          >
            Design and engineering, one process.
          </h2>

          <p className="font-serif italic text-2xl md:text-3xl leading-snug max-w-2xl text-text">
            I like taking things apart, understanding how they work, and rebuilding them better.
          </p>

          <p className="text-base leading-relaxed max-w-xl text-text-secondary">
            I work across the full stack of a product decision: understanding the user&rsquo;s problem, designing the
            interface that solves it, and writing the code that ships it. That range comes from internships that put
            me in both seats, UX design and full-stack development, often on the same team, in the same sprint.
          </p>
        </div>

        <HowIWork />

        <div ref={bodyRef} className="reveal flex flex-col gap-12">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-6 text-text-secondary">
              What I work with
            </p>
            <SkillsCloud />
          </div>

          <div className="border-t border-border pt-8 flex flex-col gap-2">
            <p className="text-xs tracking-[0.2em] uppercase text-text-secondary">
              Education
            </p>
            <h3 className="font-serif text-2xl text-text">
              {education.title}
            </h3>
            <p className="text-sm text-text-secondary">
              {education.school} &middot; {education.meta}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
