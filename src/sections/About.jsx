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
          title="A developer who loves turning ideas into real products"
          description="I enjoy building products from the ground up and figuring out the best way to solve a problem. Whether I'm designing an interface, building an API, or debugging a tricky issue, I like understanding how everything fits together. I'm always looking for ways to improve my skills and build software that's useful, reliable, and easy to use."
        />

        <div className="flex flex-col gap-8">
          <Illustration
            src="/illustrations/bamiyan-cliffs.png"
            alt="Hand-drawn pencil illustration of the Bamiyan cliffs"
            decorative={false}
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
