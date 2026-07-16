import SectionHeading from "../components/ui/SectionHeading";
import Illustration from "../components/ui/Illustration";
import { education } from "../data/experience";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-24 md:py-32 bg-background-secondary/40">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <SectionHeading
          index="01"
          eyebrow="About Me"
          title="I enjoy building software where engineering and product decisions meet"
          description="My background is a mix of software engineering, product design, and startup development. Through internships and personal projects, I've worked on everything from data processing workflows and mobile applications to real-time web platforms. I like understanding the problem before writing code: Who is using this? What are they struggling with? What is the simplest solution that actually helps? Then I build it. Whether it is designing a database structure, building a feature from scratch, or improving an existing workflow, I enjoy owning the process from the first idea to the final product."
        />

        <div className="flex flex-col gap-8">
          <Illustration
            src="/illustrations/bamiyan-cliffs.png"
            alt="Hand-drawn pencil illustration of the Bamiyan cliffs"
            decorative={false}
            imgClassName="opacity-40"
          />

          <div className="border-t border-border pt-6 flex flex-col gap-1">
            <p className="text-xs tracking-[0.2em] uppercase text-text-secondary">
              Education
            </p>
            <h3 className="font-serif text-2xl text-text">{education.title}</h3>
            <p className="text-text-secondary text-sm">
              {education.school} &middot; {education.meta}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
