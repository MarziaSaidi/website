import { useScrollReveal } from "../hooks/useScrollReveal";
import SkillsCloud from "../components/SkillsCloud";
import HowIWorkMap from "../components/HowIWorkMap";
import { education } from "../data/experience";

// The one section that deliberately breaks from the site's cream palette
// back to a near-black band — a "night" contrast beat, not a leftover from
// the old dark theme. .glow-text (defined in index.css) lives here now,
// recolored for this backdrop, instead of being pure loss from the rebrand.
export default function About() {
  const headingRef = useScrollReveal();
  const bodyRef = useScrollReveal();

  return (
    <section id="about" aria-labelledby="about-heading" className="about-band py-28 md:py-36">
      <div className="max-w-4xl mx-auto px-6 md:px-10 flex flex-col gap-16">
        <div ref={headingRef} className="reveal flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif text-sm tabular-nums" style={{ color: "rgba(244,241,234,0.5)" }} aria-hidden="true">
              03
            </span>
            <span className="block h-px w-6 bg-accent divider-draw" aria-hidden="true" />
            <p className="text-xs tracking-[0.25em] uppercase" style={{ color: "rgba(244,241,234,0.65)" }}>
              So — who builds all this?
            </p>
          </div>

          <h2
            id="about-heading"
            className="glow-text font-serif text-5xl md:text-7xl leading-[1.05]"
            style={{ color: "#f4f1ea" }}
          >
            Design and engineering, one process.
          </h2>

          <p className="font-serif italic text-2xl md:text-3xl leading-snug max-w-2xl" style={{ color: "rgba(244,241,234,0.85)" }}>
            I like taking things apart, understanding how they work, and rebuilding them better.
          </p>

          <p className="text-base leading-relaxed max-w-xl" style={{ color: "rgba(244,241,234,0.65)" }}>
            I work across the full stack of a product decision: understanding the user&rsquo;s problem, designing the
            interface that solves it, and writing the code that ships it. That range comes from internships that put
            me in both seats, UX design and full-stack development, often on the same team, in the same sprint.
          </p>
        </div>

        <HowIWorkMap />

        <div ref={bodyRef} className="reveal flex flex-col gap-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: "rgba(244,241,234,0.5)" }}>
              What I work with
            </p>
            <SkillsCloud />
          </div>

          <div className="border-t pt-6 flex flex-col gap-1" style={{ borderColor: "rgba(244,241,234,0.14)" }}>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(244,241,234,0.5)" }}>
              Education
            </p>
            <h3 className="font-serif text-2xl" style={{ color: "#f4f1ea" }}>
              {education.title}
            </h3>
            <p className="text-sm" style={{ color: "rgba(244,241,234,0.65)" }}>
              {education.school} &middot; {education.meta}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
