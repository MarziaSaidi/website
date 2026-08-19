import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import { education } from "../data/experience";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-24 md:py-32 bg-background-secondary/40">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <SectionHeading
          index="03"
          eyebrow="About Me"
          title="Design and engineering, one process"
          description="I work across the full stack of a product decision: understanding the user’s problem, designing the interface that solves it, and writing the code that ships it. That range comes from internships that put me in both seats, UX design and full-stack development, often on the same team, in the same sprint."
          headingId="about-heading"
        />

        <Reveal className="border-t border-border pt-6 flex flex-col gap-1">
          <p className="text-xs tracking-[0.2em] uppercase text-text-secondary">
            Education
          </p>
          <h3 className="font-serif text-2xl text-text">{education.title}</h3>
          <p className="text-text-secondary text-sm">
            {education.school} &middot; {education.meta}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
